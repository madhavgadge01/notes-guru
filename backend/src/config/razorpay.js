const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('your_key') || keySecret.includes('your_key')) {
    return null;
  }

  if (!razorpayInstance || razorpayInstance.key_id !== keyId) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !signature || !orderId || !paymentId) return false;

  const generated = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (generated.length !== signature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(signature));
  } catch {
    return generated === signature;
  }
};

module.exports = {
  getRazorpayInstance,
  verifyRazorpaySignature,
};
