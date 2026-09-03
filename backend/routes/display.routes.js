const express = require('express');
const router = express.Router();
const displayController = require('../controllers/display.controller');

// Audio stream suara pengumuman Bahasa Indonesia
router.get('/voice', displayController.getVoiceAnnouncement);

// Antrian untuk layar TV display
router.get('/queue', displayController.getQueueDisplay);
router.get('/active', displayController.getQueueDisplay);

// Live tracking pesanan dari HP pelanggan
router.get('/track/:orderIdOrQueue', displayController.trackOrder);
router.get('/my/:orderIdOrQueue', displayController.trackOrder);
router.get('/:orderIdOrQueue', displayController.trackOrder);

module.exports = router;
