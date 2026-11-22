import React, { useState } from 'react';
import { ShieldCheck, Check, Sparkles, X, CreditCard, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PurchaseModal = ({ isOpen, onClose, itemType, itemId, itemTitle, price, discountedPrice, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const actualPrice = discountedPrice !== undefined && discountedPrice !== null ? discountedPrice : price;
  const originalPrice = price || actualPrice;
  const savings = originalPrice > actualPrice ? originalPrice - actualPrice : 0;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login', { state: { returnUrl: window.location.pathname } });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your network connection.');
      }

      // Step 1: Create Order on Backend (Backend calculates actual verified price from DB)
      const res = await api.post('/orders/create', { itemType, itemId });
      const { orderId, keyId, razorpayOrderId, amount, currency } = res.data;

      const activeKey = keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!activeKey) {
        throw new Error('Razorpay Key ID is not configured. Please check environment variables.');
      }

      // Step 2: Open Razorpay Checkout Interface
      const options = {
        key: activeKey,
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        name: 'GenZNotes',
        description: itemTitle,
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#F28C52',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment checkout was cancelled. No amount was charged.');
          },
        },
        handler: async function (response) {
          try {
            setLoading(true);
            // Step 3: Cryptographic Server-side Signature Verification & Access Grant
            const verifyRes = await api.post('/orders/verify', {
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              if (onSuccess) onSuccess(verifyRes.data);
              onClose();
            } else {
              setError(verifyRes.data?.message || 'Payment verification failed.');
            }
          } catch (vErr) {
            setError(vErr.response?.data?.message || 'Server payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setLoading(false);
        setError(resp.error?.description || 'Payment was declined or failed.');
      });
      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Could not initiate payment. Please verify gateway configuration.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1F1F1F] rounded-2xl shadow-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-brand-500 via-coral-500 to-sunset-red p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-black/10 hover:bg-black/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {itemType.toUpperCase()} PASS
            </span>
            <span className="text-xs text-white/80">• Lifetime Access</span>
          </div>
          <h3 className="text-xl font-bold truncate pr-6">{itemTitle}</h3>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Pricing Box */}
          <div className="bg-cream-50 dark:bg-neutral-800/60 rounded-xl p-4 border border-brand-200/60 dark:border-neutral-700 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Item Total</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{originalPrice}</span>
            </div>

            {savings > 0 && (
              <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                <span>Special Academic Discount</span>
                <span className="font-semibold">-₹{savings}</span>
              </div>
            )}

            <div className="pt-2 border-t border-brand-200/50 dark:border-neutral-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Payable Amount</span>
                <span className="text-2xl font-black text-brand-600 dark:text-brand-400">₹{actualPrice}</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                Instant Digital Unlock
              </span>
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-2.5 mb-6 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Immediate access to all unit formulas, derivations & university patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Personalized academic watermark with lifetime student reading license</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Full-screen distraction-free reader with Light and Dark reading themes</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-500 via-coral-500 to-sunset-red hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay ₹{actualPrice}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>100% Encrypted & Secure Checkout via Razorpay Payment Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
