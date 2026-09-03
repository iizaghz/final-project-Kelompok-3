const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public (Pelanggan)
router.post('/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);

// Protected (Kasir / Admin)
router.get('/', verifyToken, orderController.getOrders);
router.patch('/:id/confirm-payment', verifyToken, orderController.confirmCashierPayment);
router.patch('/:id/status', verifyToken, orderController.updateOrderStatus);

module.exports = router;
