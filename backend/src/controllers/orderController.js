const Order = require('../models/Order');
const { createOrder, verifyPaymentAndFulfill } = require('../services/paymentService');

// Create order
const createNewOrder = async (req, res, next) => {
  try {
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type (semester, subject, unit, note) and item ID are required',
      });
    }

    const orderData = await createOrder(req.user._id, itemType, itemId);

    return res.status(201).json({
      success: true,
      message: 'Order initiated',
      ...orderData,
    });
  } catch (error) {
    next(error);
  }
};

// Verify payment & fulfill entitlement
const verifyOrderPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Razorpay order ID, payment ID, and signature are required for verification',
      });
    }

    const result = await verifyPaymentAndFulfill({
      userId: req.user._id,
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's order history
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNewOrder,
  verifyOrderPayment,
  getMyOrders,
};
