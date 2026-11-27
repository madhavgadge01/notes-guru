const Order = require('../models/Order');
const { createOrder, verifyPaymentAndFulfill } = require('../services/paymentService');

// Create order
const createNewOrder = async (req, res, next) => {
  try {
    const { itemType, itemId, returnPath } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type (semester, subject, block, unit, note) and item ID are required',
      });
    }

    const orderData = await createOrder(req.user._id, itemType, itemId, {
      returnPath,
      requestOrigin: req.headers.origin,
    });

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
    const { orderId, cashfreeOrderId } = req.body;

    if (!orderId && !cashfreeOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID or Cashfree Order ID is required for verification',
      });
    }

    const result = await verifyPaymentAndFulfill({
      userId: req.user._id,
      orderId,
      cashfreeOrderId,
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
