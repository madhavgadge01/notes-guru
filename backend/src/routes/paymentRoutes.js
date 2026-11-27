const express = require('express');
const router = express.Router();
const { cashfreeWebhook } = require('../controllers/paymentController');

router.post('/webhook', cashfreeWebhook);

module.exports = router;
