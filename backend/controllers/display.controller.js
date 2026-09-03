const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const axios = require('axios');
const supabase = require('../config/supabase');
const pool = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const { mockOrders } = require('./order.controller');

// Audio Cache Directory
const AUDIO_CACHE_DIR = path.resolve(__dirname, '../../audio_cache');
if (!fs.existsSync(AUDIO_CACHE_DIR)) {
  try {
    fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
  } catch {}
}

/**
 * 1. Mendapatkan antrian untuk Layar Display Publik TV & Halaman Antrian Umum Pelanggan
 * GET /api/display/queue
 */
const getQueueDisplay = async (req, res, next) => {
  try {
    if (pool) {
      const result = await pool.query(`
        SELECT id, queue_number, customer_name, table_number, order_status, total_amount, payment_method, updated_at, created_at
        FROM orders
        WHERE order_status IN ('pending_payment', 'processing', 'ready')
        ORDER BY updated_at DESC;
      `);

      const orders = result.rows || [];
      const ready = orders.filter((o) => o.order_status === 'ready');
      const processing = orders.filter((o) => o.order_status === 'processing');
      const pending = orders.filter((o) => o.order_status === 'pending_payment');

      return successResponse(res, 'Data antrian display berhasil diambil (PostgreSQL).', {
        ready,
        processing,
        pending,
        totalActive: orders.length,
      });
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('id, queue_number, customer_name, table_number, order_status, total_amount, payment_method, updated_at, created_at')
        .in('order_status', ['pending_payment', 'processing', 'ready'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const orders = data || [];
      const ready = orders.filter((o) => o.order_status === 'ready');
      const processing = orders.filter((o) => o.order_status === 'processing');
      const pending = orders.filter((o) => o.order_status === 'pending_payment');

      return successResponse(res, 'Data antrian display berhasil diambil (Supabase).', {
        ready,
        processing,
        pending,
        totalActive: orders.length,
      });
    }

    const active = mockOrders.filter((o) => ['pending_payment', 'processing', 'ready'].includes(o.order_status));
    const ready = active.filter((o) => o.order_status === 'ready');
    const processing = active.filter((o) => o.order_status === 'processing');
    const pending = active.filter((o) => o.order_status === 'pending_payment');

    return successResponse(res, 'Data antrian display berhasil diambil (Mock).', {
      ready,
      processing,
      pending,
      totalActive: active.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Pelacakan Pesanan Pelanggan (HP Tracking / Pencarian Tiket)
 * GET /api/display/track/:orderIdOrQueue
 */
const trackOrder = async (req, res, next) => {
  try {
    const { orderIdOrQueue } = req.params;

    if (pool) {
      const result = await pool.query(`
        SELECT 
          o.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', oi.id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'subtotal', oi.subtotal,
                'notes', oi.notes,
                'product_name', p.name,
                'image_url', p.image_url
              )
            ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
          ) as order_items
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE o.id::text = $1 OR UPPER(o.queue_number) = UPPER($1)
        GROUP BY o.id
        LIMIT 1;
      `, [orderIdOrQueue]);

      if (result.rowCount === 0) {
        return errorResponse(res, 'Nomor antrian atau pesanan tidak ditemukan.', null, 404);
      }

      return successResponse(res, 'Status pesanan berhasil diambil (PostgreSQL).', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('id, queue_number, customer_name, table_number, total_amount, payment_method, payment_status, order_status, created_at, updated_at, order_items(*, products(id, name, image_url))')
        .or(`id.eq.${orderIdOrQueue},queue_number.eq.${orderIdOrQueue}`)
        .single();

      if (error || !data) {
        return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      }

      return successResponse(res, 'Status pesanan berhasil diambil.', data);
    }

    const found = mockOrders.find(
      (o) => String(o.id) === String(orderIdOrQueue) || String(o.queue_number).toUpperCase() === String(orderIdOrQueue).toUpperCase()
    );

    if (!found) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    return successResponse(res, 'Status pesanan berhasil diambil (Mock).', found);
  } catch (error) {
    next(error);
  }
};

// Helper untuk mengirimkan file audio MP3 lengkap dengan Content-Length dan Range header
const sendAudioFile = (filePath, req, res) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
};

/**
 * 3. Stream Suara Panggilan Bahasa Indonesia Standar Alami
 * GET /api/display/voice?text=...
 */
const getVoiceAnnouncement = async (req, res) => {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).send('Parameter text wajib diisi.');
    }

    // Cache file berdasarkan hash teks
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const cachedFile = path.join(AUDIO_CACHE_DIR, `voice_${hash}.mp3`);

    // Jika sudah ada di cache, langsung kirim
    if (fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 1000) {
      return sendAudioFile(cachedFile, req, res);
    }

    // Generate dengan Microsoft Neural Indonesian (id-ID-ArdiNeural) dengan artikulasi jernih dan normal
    const args = [
      '-m', 'edge_tts',
      '--voice', 'id-ID-ArdiNeural',
      '--text', text,
      '--write-media', cachedFile,
    ];

    const py = spawn('python', args);

    py.on('close', async (code) => {
      if (code === 0 && fs.existsSync(cachedFile) && fs.statSync(cachedFile).size > 1000) {
        return sendAudioFile(cachedFile, req, res);
      }

      // Fallback Google Translate TTS jika edge-tts mengalami kendala
      try {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}`;
        const response = await axios.get(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          responseType: 'arraybuffer',
          timeout: 8000,
        });

        fs.writeFileSync(cachedFile, Buffer.from(response.data));
        return sendAudioFile(cachedFile, req, res);
      } catch (fallbackErr) {
        return res.status(500).send('Gagal membuat suara');
      }
    });

    py.on('error', async () => {
      try {
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(text)}`;
        const response = await axios.get(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          responseType: 'arraybuffer',
          timeout: 8000,
        });

        fs.writeFileSync(cachedFile, Buffer.from(response.data));
        return sendAudioFile(cachedFile, req, res);
      } catch (fallbackErr) {
        return res.status(500).send('Gagal membuat suara');
      }
    });
  } catch (err) {
    console.warn('Voice endpoint error:', err.message);
    res.status(500).send('Voice error');
  }
};

module.exports = {
  getQueueDisplay,
  trackOrder,
  getVoiceAnnouncement,
};
