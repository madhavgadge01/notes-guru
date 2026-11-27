const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    cashfreeOrderId: {
      type: String,
      required: true,
      index: true,
    },
    cashfreePaymentId: {
      type: String,
      required: true,
      index: true,
    },
    paymentGroup: {
      type: String,
      default: '',
    },
    bankReference: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'refunded'],
      default: 'success',
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
