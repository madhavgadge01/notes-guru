const express = require('express');
const router = express.Router();
const {
  createNewOrder,
  verifyOrderPayment,
  getMyOrders,
} = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.post('/create', authenticate, createNewOrder);
router.post('/verify', authenticate, verifyOrderPayment);
router.get('/my-orders', authenticate, getMyOrders);

module.exports = router;
