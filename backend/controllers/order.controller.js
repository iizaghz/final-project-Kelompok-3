const { randomUUID } = require('crypto');
const pool = require('../config/db');
const supabase = require('../config/supabase');
const { generateDailyQueueNumber } = require('../services/queue.service');
const { createQrisPayment } = require('../services/ipaymu.service');
const { successResponse, errorResponse } = require('../utils/response');

// Fallback in-memory orders
let mockOrders = [];

/**
 * 1. Buat Pesanan Baru (Self-Ordering Pelanggan & QRIS iPaymu)
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      customer_name,
      table_number = '-',
      payment_method = 'cashier', // 'cashier' | 'payment_gateway'
      items = [],
      customer_phone,
      customer_email,
    } = req.body;

    if (!customer_name || !items || items.length === 0) {
      return errorResponse(res, 'Nama pelanggan dan daftar pesanan (items) wajib diisi.', null, 400);
    }

    // 1. Hitung total harga & validasi items
    let total_amount = 0;
    const validatedItems = items.map((item) => {
      const quantity = Number(item.quantity) || 1;
      const unit_price = Number(item.price || item.unit_price) || 0;
      const subtotal = quantity * unit_price;
      total_amount += subtotal;

      return {
        product_id: item.product_id ? Number(item.product_id) : (item.id ? Number(item.id) : null),
        product_name: item.name || item.product_name || 'Item Menu',
        quantity,
        unit_price,
        subtotal,
        notes: item.notes || '',
      };
    });

    // 2. Generate Nomor Antrian Harian (A-001, A-002, dst.) & Valid UUID
    const queue_number = await generateDailyQueueNumber();
    const orderId = randomUUID(); // Valid PostgreSQL UUID v4

    let qrisData = null;
    let payment_reference = null;
    let qris_url = null;

    // 3. Jika metode Payment Gateway (iPaymu QRIS)
    if (payment_method === 'payment_gateway') {
      qrisData = await createQrisPayment({
        name: customer_name,
        phone: customer_phone || '081234567890',
        email: customer_email || 'order@kopisenja.com',
        amount: total_amount,
        referenceId: orderId,
      });

      payment_reference = qrisData.transactionId || String(qrisData.referenceId);
      qris_url = qrisData.qrImage || '';
    }

    const orderPayload = {
      id: orderId,
      queue_number,
      customer_name: customer_name.trim(),
      table_number: table_number || '-',
      total_amount,
      payment_method,
      payment_status: 'pending',
      order_status: 'pending_payment',
      payment_reference,
      qris_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 4. Simpan ke PostgreSQL Lokal (Pool)
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Insert Order
        const orderInsertQuery = `
          INSERT INTO orders (
            id, queue_number, customer_name, table_number, total_amount, 
            payment_method, payment_status, order_status, payment_reference, qris_url, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *;
        `;
        const orderRes = await client.query(orderInsertQuery, [
          orderPayload.id,
          orderPayload.queue_number,
          orderPayload.customer_name,
          orderPayload.table_number,
          orderPayload.total_amount,
          orderPayload.payment_method,
          orderPayload.payment_status,
          orderPayload.order_status,
          orderPayload.payment_reference,
          orderPayload.qris_url,
          orderPayload.created_at,
          orderPayload.updated_at,
        ]);

        // Insert Order Items
        for (const item of validatedItems) {
          await client.query(`
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            orderPayload.id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.subtotal,
            item.notes,
          ]);
        }

        await client.query('COMMIT');

        return successResponse(res, 'Pesanan berhasil dibuat (PostgreSQL)!', {
          order: {
            ...orderRes.rows[0],
            items: validatedItems,
            qris: qrisData,
          },
        }, 201);
      } catch (dbErr) {
        await client.query('ROLLBACK');
        console.error('Error insert order to PostgreSQL:', dbErr.message);
        throw dbErr;
      } finally {
        client.release();
      }
    }

    // 5. Supabase Cloud Fallback
    if (supabase) {
      const { data: createdOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([orderPayload])
        .select()
        .single();

      if (!orderErr) {
        const orderItemsPayload = validatedItems.map((item) => ({
          order_id: createdOrder.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          notes: item.notes,
        }));

        await supabase.from('order_items').insert(orderItemsPayload);

        return successResponse(res, 'Pesanan berhasil dibuat (Supabase)!', {
          order: {
            ...createdOrder,
            items: validatedItems,
            qris: qrisData,
          },
        }, 201);
      }
    }

    // 6. In-memory fallback
    const fullMockOrder = {
      ...orderPayload,
      items: validatedItems,
      qris: qrisData,
    };
    mockOrders.unshift(fullMockOrder);

    return successResponse(res, 'Pesanan berhasil dibuat (Mock)!', {
      order: fullMockOrder,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Ambil Semua Pesanan (Dashboard Kasir)
 * GET /api/orders
 */
const getOrders = async (req, res, next) => {
  try {
    const { status, payment_status, limit = 50 } = req.query;

    if (pool) {
      let queryText = `
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
        WHERE 1=1
      `;
      const queryParams = [];

      if (status) {
        queryParams.push(status);
        queryText += ` AND o.order_status = $${queryParams.length}`;
      }
      if (payment_status) {
        queryParams.push(payment_status);
        queryText += ` AND o.payment_status = $${queryParams.length}`;
      }

      queryText += ` GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${queryParams.length + 1}`;
      queryParams.push(Number(limit));

      const result = await pool.query(queryText, queryParams);
      return successResponse(res, 'Daftar pesanan berhasil diambil (PostgreSQL).', result.rows);
    }

    if (supabase) {
      let query = supabase
        .from('orders')
        .select('*, order_items(*, products(id, name, image_url))')
        .order('created_at', { ascending: false })
        .limit(Number(limit));

      if (status) query = query.eq('order_status', status);
      if (payment_status) query = query.eq('payment_status', payment_status);

      const { data, error } = await query;
      if (error) throw error;
      return successResponse(res, 'Daftar pesanan berhasil diambil (Supabase).', data);
    }

    let filtered = [...mockOrders];
    if (status) filtered = filtered.filter((o) => o.order_status === status);
    if (payment_status) filtered = filtered.filter((o) => o.payment_status === payment_status);

    return successResponse(res, 'Daftar pesanan berhasil diambil (Mock).', filtered);
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Detail Pesanan berdasarkan ID atau Nomor Antrian
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

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
      `, [id]);

      if (result.rowCount === 0) {
        return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      }
      return successResponse(res, 'Detail pesanan berhasil diambil (PostgreSQL).', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(id, name, image_url))')
        .or(`id.eq.${id},queue_number.eq.${id}`)
        .single();

      if (error || !data) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      return successResponse(res, 'Detail pesanan berhasil diambil.', data);
    }

    const found = mockOrders.find((o) => String(o.id) === String(id) || String(o.queue_number).toUpperCase() === String(id).toUpperCase());
    if (!found) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    return successResponse(res, 'Detail pesanan berhasil diambil (Mock).', found);
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Konfirmasi Pembayaran Kasir (Bayar di Kasir)
 * PATCH /api/orders/:id/confirm-payment
 */
const confirmCashierPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (pool) {
      const result = await pool.query(`
        UPDATE orders 
        SET payment_status = 'paid', order_status = 'processing', updated_at = NOW()
        WHERE id::text = $1 OR UPPER(queue_number) = UPPER($1)
        RETURNING *;
      `, [id]);

      if (result.rowCount === 0) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      return successResponse(res, 'Pembayaran kasir berhasil dikonfirmasi (PostgreSQL)!', result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          order_status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${id},queue_number.eq.${id}`)
        .select()
        .single();

      if (error) throw error;
      return successResponse(res, 'Pembayaran kasir berhasil dikonfirmasi!', data);
    }

    const index = mockOrders.findIndex((o) => String(o.id) === String(id) || String(o.queue_number).toUpperCase() === String(id).toUpperCase());
    if (index === -1) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    mockOrders[index] = { ...mockOrders[index], payment_status: 'paid', order_status: 'processing', updated_at: new Date().toISOString() };
    return successResponse(res, 'Pembayaran kasir berhasil dikonfirmasi (Mock)!', mockOrders[index]);
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Update Status Tahapan Pesanan (Diproses -> Siap -> Selesai / Batal)
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    const validStatuses = ['pending_payment', 'processing', 'ready', 'completed', 'cancelled'];
    if (!order_status || !validStatuses.includes(order_status)) {
      return errorResponse(res, `Status pesanan tidak valid. Pilihan: ${validStatuses.join(', ')}`, null, 400);
    }

    if (pool) {
      const result = await pool.query(`
        UPDATE orders 
        SET order_status = $1, updated_at = NOW()
        WHERE id::text = $2 OR UPPER(queue_number) = UPPER($2)
        RETURNING *;
      `, [order_status, id]);

      if (result.rowCount === 0) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);
      return successResponse(res, `Status pesanan berhasil diubah menjadi: ${order_status} (PostgreSQL)`, result.rows[0]);
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .update({
          order_status,
          updated_at: new Date().toISOString(),
        })
        .or(`id.eq.${id},queue_number.eq.${id}`)
        .select()
        .single();

      if (error) throw error;
      return successResponse(res, `Status pesanan berhasil diubah menjadi: ${order_status}`, data);
    }

    const index = mockOrders.findIndex((o) => String(o.id) === String(id) || String(o.queue_number).toUpperCase() === String(id).toUpperCase());
    if (index === -1) return errorResponse(res, 'Pesanan tidak ditemukan.', null, 404);

    mockOrders[index] = { ...mockOrders[index], order_status, updated_at: new Date().toISOString() };
    return successResponse(res, `Status pesanan berhasil diubah menjadi: ${order_status} (Mock)`, mockOrders[index]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  confirmCashierPayment,
  updateOrderStatus,
  mockOrders,
};
