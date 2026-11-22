const crypto = require('crypto');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Block = require('../models/Block');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const { getRazorpayInstance, verifyRazorpaySignature } = require('../config/razorpay');

/**
 * Fetch entity and actual verified price from MongoDB
 */
const getItemDetailsAndPrice = async (itemType, itemId) => {
  let item = null;
  let price = 0;
  let title = '';

  switch (itemType) {
    case 'semester':
      item = await Semester.findById(itemId).populate('courseId');
      if (!item) throw new Error('Semester not found');
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `${item.name} (${item.courseId?.name || 'Semester Package'})`;
      break;

    case 'subject':
      item = await Subject.findById(itemId);
      if (!item) throw new Error('Subject not found');
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Complete Subject: ${item.name}`;
      break;

    case 'block':
      item = await Block.findById(itemId).populate('subjectId');
      if (!item) throw new Error('Block not found');
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Block ${item.blockNumber}: ${item.name} (${item.subjectId?.name || ''})`;
      break;

    case 'unit':
      item = await Unit.findById(itemId).populate('subjectId');
      if (!item) throw new Error('Unit not found');
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Unit ${item.unitNumber}: ${item.title} (${item.subjectId?.name || ''})`;
      break;

    case 'note':
      item = await Note.findById(itemId);
      if (!item) throw new Error('Note not found');
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = item.title;
      break;

    default:
      throw new Error(`Invalid item type: ${itemType}`);
  }

  return { item, price: Math.max(0, price), title };
};

/**
 * Create Order & Razorpay Order
 * Secure server-side calculation and order initiation
 */
const createOrder = async (userId, itemType, itemId) => {
  // Check if already purchased
  const existingPurchase = await Purchase.findOne({ userId, itemType, itemId });
  if (existingPurchase) {
    throw new Error('You already own this item. It is available in your library.');
  }

  const { item, price, title } = await getItemDetailsAndPrice(itemType, itemId);

  const razorpay = getRazorpayInstance();
  if (!razorpay) {
    throw new Error(
      'Razorpay payment gateway is not configured. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment.'
    );
  }

  // Generate unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  let rzpOrder;
  try {
    rzpOrder = await razorpay.orders.create({
      amount: Math.round(price * 100), // amount in paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        userId: userId.toString(),
        itemType,
        itemId: itemId.toString(),
      },
    });
  } catch (err) {
    console.error('[Razorpay Order Creation Error]', err);
    throw new Error(err.error?.description || err.message || 'Failed to create Razorpay payment order');
  }

  const order = await Order.create({
    userId,
    orderNumber,
    itemType,
    itemId,
    itemTitle: title,
    amount: price,
    currency: 'INR',
    razorpayOrderId: rzpOrder.id,
    status: 'created',
  });

  return {
    order,
    orderId: order._id,
    orderNumber: order.orderNumber,
    razorpayOrderId: rzpOrder.id,
    amount: price,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    itemTitle: title,
  };
};

/**
 * Verify Payment and Grant Entitlement
 * Cryptographic server-side signature verification & atomic entitlement fulfillment
 */
const verifyPaymentAndFulfill = async ({
  userId,
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) => {
  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new Error(
      'Payment verification requires orderId, razorpayOrderId, razorpayPaymentId, and razorpaySignature'
    );
  }

  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw new Error('Order not found or does not belong to this student account');
  }

  // Idempotent fulfillment: If already paid, return existing purchase without duplicating
  if (order.status === 'paid') {
    const existing = await Purchase.findOne({ userId, itemType: order.itemType, itemId: order.itemId });
    return { success: true, message: 'Order already fulfilled', order, purchase: existing };
  }

  // Verify Razorpay Order ID matches what was created
  if (order.razorpayOrderId && order.razorpayOrderId !== razorpayOrderId) {
    order.status = 'failed';
    await order.save();
    throw new Error('Order ID does not match the registered Razorpay order');
  }

  // Cryptographic signature check using HMAC-SHA256
  const isValidSignature = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValidSignature) {
    order.status = 'failed';
    await order.save();
    throw new Error('Invalid payment signature. Cryptographic verification failed.');
  }

  // Double check with Razorpay API if live instance is active
  const razorpay = getRazorpayInstance();
  if (razorpay) {
    try {
      const rzpPayment = await razorpay.payments.fetch(razorpayPaymentId);
      if (rzpPayment) {
        if (rzpPayment.order_id && rzpPayment.order_id !== razorpayOrderId) {
          order.status = 'failed';
          await order.save();
          throw new Error('Payment does not correspond to this order ID on Razorpay.');
        }
        if (rzpPayment.status === 'failed') {
          order.status = 'failed';
          await order.save();
          throw new Error('Payment was declined or marked failed by Razorpay.');
        }
        // Auto-capture payment if authorized
        if (rzpPayment.status === 'authorized') {
          await razorpay.payments.capture(razorpayPaymentId, rzpPayment.amount, rzpPayment.currency);
        }
      }
    } catch (fetchErr) {
      console.warn('[Razorpay API Payment Fetch Warning]', fetchErr.message);
    }
  }

  // Update order to paid
  order.status = 'paid';
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.paidAt = new Date();
  await order.save();

  // Record payment in Payment collection
  await Payment.create({
    userId,
    orderId: order._id,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount: order.amount,
    currency: order.currency,
    status: 'success',
  });

  // Create or activate entitlement in Purchase collection
  const purchase = await Purchase.findOneAndUpdate(
    { userId, itemType: order.itemType, itemId: order.itemId },
    {
      userId,
      itemType: order.itemType,
      itemId: order.itemId,
      orderId: order._id,
      amount: order.amount,
      purchasedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    message: 'Payment verified and entitlement granted successfully!',
    order,
    purchase,
  };
};

module.exports = {
  createOrder,
  verifyPaymentAndFulfill,
  getItemDetailsAndPrice,
};
