const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');

/**
 * Razorpay Webhook Handler
 * Verifies webhook signature with RAZORPAY_WEBHOOK_SECRET
 * Idempotently processes payment.captured and order.paid events
 */
const razorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret) {
      if (!signature) {
        return res.status(400).json({ success: false, message: 'Missing Razorpay webhook signature header' });
      }

      const bodyData = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
      const expectedDigest = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyData)
        .digest('hex');

      if (expectedDigest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid Razorpay webhook signature' });
      }
    }

    const event = req.body?.event;

    // Handle payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const payload = req.body.payload;
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.status !== 'paid') {
          order.status = 'paid';
          order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
          order.paidAt = new Date();
          await order.save();

          await Payment.create({
            userId: order.userId,
            orderId: order._id,
            razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId || 'webhook_captured',
            amount: order.amount,
            currency: order.currency,
            status: 'success',
            rawPayload: req.body,
          });

          await Purchase.findOneAndUpdate(
            { userId: order.userId, itemType: order.itemType, itemId: order.itemId },
            {
              userId: order.userId,
              itemType: order.itemType,
              itemId: order.itemId,
              orderId: order._id,
              amount: order.amount,
              purchasedAt: new Date(),
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  razorpayWebhook,
};
