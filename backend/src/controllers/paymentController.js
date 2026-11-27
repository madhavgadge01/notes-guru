const Order = require('../models/Order');
const { verifyCashfreeWebhookSignature } = require('../config/cashfree');
const { fulfillPaidOrder } = require('../services/paymentService');

/**
 * Cashfree Webhook Handler
 * Verifies x-webhook-signature using HMAC-SHA256(timestamp + rawBody)
 * Idempotently processes PAYMENT_SUCCESS_WEBHOOK and terminal failure events
 */
const cashfreeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];

    if (!signature || !timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Missing Cashfree webhook signature or timestamp headers',
      });
    }

    const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const isValid = verifyCashfreeWebhookSignature(signature, rawBody, timestamp);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Cashfree webhook signature',
      });
    }

    const eventType = req.body?.type;
    const data = req.body?.data || {};
    const cfOrder = data.order || {};
    const cfPayment = data.payment || {};
    const cashfreeOrderId = cfOrder.order_id;

    if (!cashfreeOrderId) {
      return res.status(200).json({ status: 'ok', received: true });
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' && cfPayment.payment_status === 'SUCCESS') {
      const order = await Order.findOne({ cashfreeOrderId });
      if (order) {
        const paidAmount = Number(cfOrder.order_amount ?? cfPayment.payment_amount ?? 0);
        if (paidAmount + 0.01 >= Number(order.amount)) {
          await fulfillPaidOrder({
            order,
            cashfreeOrderId,
            cashfreePaymentId: cfPayment.cf_payment_id,
            paymentGroup: cfPayment.payment_group || '',
            bankReference: cfPayment.bank_reference || '',
            rawPayload: req.body,
          });
        }
      }
    } else if (
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK'
    ) {
      await Order.findOneAndUpdate(
        { cashfreeOrderId, status: 'created' },
        { $set: { status: 'failed' } }
      );
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  cashfreeWebhook,
};
