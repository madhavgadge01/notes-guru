const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Block = require('../models/Block');
const Unit = require('../models/Unit');
const Note = require('../models/Note');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const { getCashfreeInstance, getCashfreeMode } = require('../config/cashfree');

const createHttpError = (message, statusCode = 400) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

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
      if (!item) throw createHttpError('Semester not found', 404);
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `${item.name} (${item.courseId?.name || 'Semester Package'})`;
      break;

    case 'subject':
      item = await Subject.findById(itemId);
      if (!item) throw createHttpError('Subject not found', 404);
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Complete Subject: ${item.name}`;
      break;

    case 'block':
      item = await Block.findById(itemId).populate('subjectId');
      if (!item) throw createHttpError('Block not found', 404);
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Block ${item.blockNumber}: ${item.name} (${item.subjectId?.name || ''})`;
      break;

    case 'unit':
      item = await Unit.findById(itemId).populate('subjectId');
      if (!item) throw createHttpError('Unit not found', 404);
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = `Unit ${item.unitNumber}: ${item.title} (${item.subjectId?.name || ''})`;
      break;

    case 'note':
      item = await Note.findById(itemId);
      if (!item) throw createHttpError('Note not found', 404);
      price = item.discountedPrice !== undefined && item.discountedPrice !== null ? item.discountedPrice : item.price;
      title = item.title;
      break;

    default:
      throw createHttpError(`Invalid item type: ${itemType}`, 400);
  }

  return { item, price: Math.max(0, Number(price) || 0), title };
};

const sanitizePhoneForCashfree = (rawPhone) => {
  if (!rawPhone || typeof rawPhone !== 'string') return '9999999999';
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (trimmed.startsWith('+') && digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  if (digits.length > 10) return digits.slice(-10);
  return '9999999999';
};

const buildSafeReturnUrl = (returnPath, requestOrigin, mode) => {
  const configuredOrigin = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
  const candidateOrigin = (requestOrigin || '').trim().replace(/\/+$/, '');

  let baseOrigin = configuredOrigin;
  if (!baseOrigin && candidateOrigin && /^https?:\/\/[a-zA-Z0-9.-]+(:\d+)?$/.test(candidateOrigin)) {
    baseOrigin = candidateOrigin;
  }

  if (!baseOrigin) return undefined;
  if (mode === 'production' && !baseOrigin.startsWith('https://')) {
    return undefined;
  }

  const safePath =
    typeof returnPath === 'string' && returnPath.startsWith('/') && !returnPath.startsWith('//')
      ? returnPath.split('?')[0].split('#')[0]
      : '/';

  const fullUrl = `${baseOrigin}${safePath}?cf_order_id={order_id}`;
  return fullUrl.length <= 250 ? fullUrl : `${baseOrigin}/?cf_order_id={order_id}`;
};

const buildNotifyUrl = () => {
  const backendUrl = (process.env.BACKEND_URL || process.env.API_URL || '').trim().replace(/\/+$/, '');
  if (!backendUrl || !backendUrl.startsWith('https://')) return undefined;
  const url = `${backendUrl}/api/payments/webhook`;
  return url.length <= 250 ? url : undefined;
};

/**
 * Atomically mark an order paid, record Payment, and grant Purchase entitlement
 * Shared by both synchronous /orders/verify and asynchronous Cashfree webhook
 */
const fulfillPaidOrder = async ({
  order,
  cashfreeOrderId,
  cashfreePaymentId,
  paymentGroup = '',
  bankReference = '',
  rawPayload = {},
}) => {
  const paymentRef = String(cashfreePaymentId || `cf_pay_${cashfreeOrderId}`);

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: order._id, status: { $ne: 'paid' } },
    {
      $set: {
        status: 'paid',
        cashfreeOrderId: cashfreeOrderId || order.cashfreeOrderId,
        cashfreePaymentId: paymentRef,
        paidAt: new Date(),
      },
    },
    { new: true }
  );

  const finalOrder = updatedOrder || (await Order.findById(order._id));

  if (updatedOrder) {
    await Payment.findOneAndUpdate(
      { orderId: finalOrder._id, cashfreePaymentId: paymentRef },
      {
        $setOnInsert: {
          userId: finalOrder.userId,
          orderId: finalOrder._id,
          cashfreeOrderId: finalOrder.cashfreeOrderId || cashfreeOrderId,
          cashfreePaymentId: paymentRef,
          paymentGroup: paymentGroup || '',
          bankReference: bankReference || '',
          amount: finalOrder.amount,
          currency: finalOrder.currency,
          status: 'success',
          rawPayload,
        },
      },
      { upsert: true, new: true }
    );
  }

  const purchase = await Purchase.findOneAndUpdate(
    { userId: finalOrder.userId, itemType: finalOrder.itemType, itemId: finalOrder.itemId },
    {
      $setOnInsert: {
        userId: finalOrder.userId,
        itemType: finalOrder.itemType,
        itemId: finalOrder.itemId,
        orderId: finalOrder._id,
        amount: finalOrder.amount,
        purchasedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return { order: finalOrder, purchase, alreadyFulfilled: !updatedOrder };
};

/**
 * Create Order & Cashfree PG Order
 * Secure server-side calculation and order initiation
 */
const createOrder = async (userId, itemType, itemId, { returnPath, requestOrigin } = {}) => {
  const existingPurchase = await Purchase.findOne({ userId, itemType, itemId });
  if (existingPurchase) {
    throw createHttpError('You already own this item. It is available in your library.', 400);
  }

  const { price, title } = await getItemDetailsAndPrice(itemType, itemId);
  if (price < 1) {
    throw createHttpError('Order amount must be at least ₹1 to initiate online payment.', 400);
  }

  const cashfree = getCashfreeInstance();
  if (!cashfree) {
    throw createHttpError(
      'Cashfree payment gateway is not configured. Please set valid CASHFREE_APP_ID and CASHFREE_SECRET_KEY in the environment.',
      503
    );
  }

  const user = await User.findById(userId).select('name email phone').lean();
  const mode = getCashfreeMode();
  const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const cashfreeOrderId = orderNumber;
  const orderAmount = Number(price.toFixed(2));

  const returnUrl = buildSafeReturnUrl(returnPath, requestOrigin, mode);
  const notifyUrl = buildNotifyUrl();
  const orderMeta = {};
  if (returnUrl) orderMeta.return_url = returnUrl;
  if (notifyUrl) orderMeta.notify_url = notifyUrl;

  const cfRequest = {
    order_id: cashfreeOrderId,
    order_amount: orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: userId.toString(),
      customer_name: (user?.name || 'Student').trim().slice(0, 100),
      ...(user?.email ? { customer_email: user.email } : {}),
      customer_phone: sanitizePhoneForCashfree(user?.phone),
    },
    ...(Object.keys(orderMeta).length > 0 ? { order_meta: orderMeta } : {}),
    order_note: title.slice(0, 200),
    order_tags: {
      itemType: String(itemType),
      itemId: String(itemId),
      userId: userId.toString(),
    },
  };

  let cfOrder;
  try {
    const cfResponse = await cashfree.PGCreateOrder(cfRequest);
    cfOrder = cfResponse?.data;
  } catch (err) {
    const cfErrorMsg = err.response?.data?.message || err.message || 'Failed to create Cashfree payment order';
    console.error('[Cashfree Order Creation Error]', err.response?.data || err.message);
    throw createHttpError(cfErrorMsg, 502);
  }

  if (!cfOrder?.payment_session_id) {
    throw createHttpError('Cashfree did not return a valid payment session ID.', 502);
  }

  const order = await Order.create({
    userId,
    orderNumber,
    itemType,
    itemId,
    itemTitle: title,
    amount: orderAmount,
    currency: 'INR',
    cashfreeOrderId: cfOrder.order_id || cashfreeOrderId,
    cfOrderId: cfOrder.cf_order_id ? String(cfOrder.cf_order_id) : '',
    paymentSessionId: cfOrder.payment_session_id,
    paymentMethod: 'cashfree',
    status: 'created',
  });

  return {
    order,
    orderId: order._id,
    orderNumber: order.orderNumber,
    cashfreeOrderId: order.cashfreeOrderId,
    paymentSessionId: cfOrder.payment_session_id,
    cashfreeMode: mode,
    amount: orderAmount,
    currency: 'INR',
    itemTitle: title,
  };
};

/**
 * Verify Cashfree Payment via Server API and Grant Entitlement
 * Never trusts client-side payment status without authoritative Cashfree API verification
 */
const verifyPaymentAndFulfill = async ({ userId, orderId, cashfreeOrderId }) => {
  if (!orderId && !cashfreeOrderId) {
    throw createHttpError('Order ID or Cashfree Order ID is required for verification', 400);
  }

  const query = { userId };
  if (orderId) {
    query._id = orderId;
  } else {
    query.cashfreeOrderId = cashfreeOrderId;
  }

  const order = await Order.findOne(query);
  if (!order) {
    throw createHttpError('Order not found or does not belong to this student account', 404);
  }

  if (orderId && cashfreeOrderId && order.cashfreeOrderId && order.cashfreeOrderId !== cashfreeOrderId) {
    throw createHttpError('Order ID does not match the registered Cashfree order', 400);
  }

  // Idempotent fulfillment: if already paid (e.g. via webhook), return existing purchase
  if (order.status === 'paid') {
    const existing = await Purchase.findOne({ userId, itemType: order.itemType, itemId: order.itemId });
    return { success: true, message: 'Order already fulfilled', order, purchase: existing };
  }

  const targetCfOrderId = cashfreeOrderId || order.cashfreeOrderId || order.orderNumber;
  if (!targetCfOrderId) {
    throw createHttpError('Missing Cashfree order reference for verification', 400);
  }

  const cashfree = getCashfreeInstance();
  if (!cashfree) {
    throw createHttpError(
      'Cashfree payment gateway is not configured. Please set valid CASHFREE_APP_ID and CASHFREE_SECRET_KEY.',
      503
    );
  }

  let cfOrder;
  let cfPayments = [];

  try {
    const [orderRes, paymentsRes] = await Promise.all([
      cashfree.PGFetchOrder(targetCfOrderId),
      cashfree.PGOrderFetchPayments(targetCfOrderId).catch(() => ({ data: [] })),
    ]);
    cfOrder = orderRes?.data;
    cfPayments = Array.isArray(paymentsRes?.data) ? paymentsRes.data : [];
  } catch (fetchErr) {
    const errMsg = fetchErr.response?.data?.message || fetchErr.message || 'Unable to verify order with Cashfree';
    console.error('[Cashfree Order Verification Error]', fetchErr.response?.data || fetchErr.message);
    throw createHttpError(errMsg, 502);
  }

  if (!cfOrder) {
    throw createHttpError('Unable to retrieve order status from Cashfree.', 502);
  }

  if (
    cfOrder.order_amount !== undefined &&
    Number(cfOrder.order_amount) + 0.01 < Number(order.amount)
  ) {
    order.status = 'failed';
    await order.save();
    throw createHttpError('Paid amount does not match the order amount.', 400);
  }

  const successfulPayment = cfPayments.find((p) => p.payment_status === 'SUCCESS');
  const pendingPayment = cfPayments.find((p) => p.payment_status === 'PENDING');

  if (cfOrder.order_status === 'PAID' || successfulPayment) {
    const { order: fulfilledOrder, purchase } = await fulfillPaidOrder({
      order,
      cashfreeOrderId: targetCfOrderId,
      cashfreePaymentId: successfulPayment?.cf_payment_id,
      paymentGroup: successfulPayment?.payment_group || '',
      bankReference: successfulPayment?.bank_reference || '',
      rawPayload: { order: cfOrder, payment: successfulPayment || null },
    });

    return {
      success: true,
      message: 'Payment verified and entitlement granted successfully!',
      order: fulfilledOrder,
      purchase,
    };
  }

  if (pendingPayment) {
    throw createHttpError(
      'Payment is pending confirmation from your bank/UPI app. Access will unlock automatically once confirmed.',
      409
    );
  }

  const latestPayment = cfPayments[0];
  const terminalOrderStatuses = ['EXPIRED', 'TERMINATED', 'TERMINATION_REQUESTED'];
  if (
    terminalOrderStatuses.includes(cfOrder.order_status) ||
    latestPayment?.payment_status === 'FAILED'
  ) {
    order.status = 'failed';
    await order.save();
  }

  throw createHttpError(
    latestPayment?.payment_message ||
      (cfOrder.order_status === 'EXPIRED'
        ? 'Payment session expired. Please initiate a new payment.'
        : 'Payment was not completed. No amount was charged.'),
    400
  );
};

module.exports = {
  createOrder,
  verifyPaymentAndFulfill,
  fulfillPaidOrder,
  getItemDetailsAndPrice,
};
