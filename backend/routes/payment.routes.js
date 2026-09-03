const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Webhook / Callback endpoint dari iPaymu
router.post('/callback', paymentController.handleIpaymuCallback);

// Cek status pembayaran pesanan
router.get('/status/:orderId', paymentController.checkPaymentStatus);

// Simulasi pembayaran sukses (fitur demo & testing)
router.post('/simulate-success/:orderId', paymentController.simulatePaymentSuccess);

module.exports = router;
