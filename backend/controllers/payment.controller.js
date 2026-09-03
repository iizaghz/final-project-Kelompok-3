const pool = require('../config/db');
const supabase = require('../config/supabase');
const { successResponse, errorResponse } = require('../utils/response');
const { mockOrders } = require('./order.controller');

/**
 * 1. Webhook Callback Notifikasi dari iPaymu
 * POST /api/payment/callback
 */
const handleIpaymuCallback = async (req, res) => {
  try {
    const payload = req.body;
    console.log('[iPaymu Callback Received]:', payload);

    const trxId = payload.trx_id;
    const referenceId = payload.reference_id;
    const status = payload.status;
    const statusCode = payload.status_code;

    if (!referenceId) {
      return res.status(400).json({ success: false, message: 'reference_id tidak ditemukan' });
    }

    const isSuccess = (status === 'berhasil' || String(statusCode) === '1');

    if (isSuccess) {
      if (pool) {
        await pool.query(`
          UPDATE orders 
          SET payment_status = 'paid', order_status = 'processing', payment_reference = $1, updated_at = NOW()
          WHERE id::text = $2 OR UPPER(queue_number) = UPPER($2);
        `, [trxId ? String(trxId) : 'IPAYMU-PAID', referenceId]);
      }

      if (supabase) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'processing',
            payment_reference: trxId ? String(trxId) : undefined,
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${referenceId},queue_number.eq.${referenceId}`);
      }

      const index = mockOrders.findIndex(o => String(o.id) === String(referenceId) || String(o.queue_number).toUpperCase() === String(referenceId).toUpperCase());
      if (index !== -1) {
        mockOrders[index] = {
          ...mockOrders[index],
          payment_status: 'paid',
          order_status: 'processing',
          payment_reference: trxId ? String(trxId) : undefined,
          updated_at: new Date().toISOString(),
        };
      }

      console.log(`✓ Pembayaran berhasil untuk Pesanan ID: ${referenceId}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Notifikasi callback berhasil diproses.',
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * 2. Cek Status Pembayaran Pesanan
 * GET /api/payment/status/:orderId
 */
const checkPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (pool) {
      const result = await pool.query(`
        SELECT id, queue_number, payment_method, payment_status, order_status, total_amount
        FROM orders
        WHERE id::text = $1 OR UPPER(queue_number) = UPPER($1)
        LIMIT 1;
      `, [orderId]);

      if (result.rowCount === 0) {
        return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      }
      return successResponse(res, 'Status pembayaran berhasil diambil (PostgreSQL).', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('id, queue_number, payment_method, payment_status, order_status, total_amount')
        .or(`id.eq.${orderId},queue_number.eq.${orderId}`)
        .single();

      if (error || !data) {
        return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      }

      return successResponse(res, 'Status pembayaran berhasil diambil.', data);
    }

    const found = mockOrders.find(o => String(o.id) === String(orderId) || String(o.queue_number).toUpperCase() === String(orderId).toUpperCase());
    if (!found) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    return successResponse(res, 'Status pembayaran berhasil diambil (Mock).', found);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Simulasi Bayar Sukses (Untuk Pengujian & Demo Ujian)
 * POST /api/payment/simulate-success/:orderId
 */
const simulatePaymentSuccess = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (pool) {
      const result = await pool.query(`
        UPDATE orders 
        SET payment_status = 'paid', order_status = 'processing', payment_reference = $1, updated_at = NOW()
        WHERE id::text = $2 OR UPPER(queue_number) = UPPER($2)
        RETURNING *;
      `, [`SIMULATED-${Date.now()}`, orderId]);

      if (result.rowCount === 0) {
        return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      }

      return successResponse(res, 'Simulasi pembayaran QRIS berhasil! Pesanan mulai diproses barista.', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'processing',
          payment_reference: `SIMULATED-${Date.now()}`,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${orderId},queue_number.eq.${orderId}`)
        .select()
        .single();

      if (error) throw error;
      return successResponse(res, 'Simulasi pembayaran QRIS berhasil!', data);
    }

    const index = mockOrders.findIndex(o => String(o.id) === String(orderId) || String(o.queue_number).toUpperCase() === String(orderId).toUpperCase());
    if (index === -1) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    mockOrders[index] = {
      ...mockOrders[index],
      payment_status: 'paid',
      order_status: 'processing',
      payment_reference: `SIMULATED-${Date.now()}`,
      updated_at: new Date().toISOString(),
    };

    return successResponse(res, 'Simulasi pembayaran QRIS berhasil (Mock)!', mockOrders[index]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleIpaymuCallback,
  checkPaymentStatus,
  simulatePaymentSuccess,
};
