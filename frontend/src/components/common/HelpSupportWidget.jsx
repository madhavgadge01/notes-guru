import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HelpCircle,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const HelpSupportWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Listen to fullscreen changes across browsers
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // When opening modal or auth changes, populate user info for logged in users
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (isAuthenticated && user) {
        setName(user.name || '');
        setEmail(user.email || '');
      } else if (!submittedTicket) {
        setName('');
        setEmail('');
      }
    }
  }, [isOpen, isAuthenticated, user]);

  // Completely hide on reader pages and in fullscreen reading mode
  const isReaderPage =
    location.pathname.startsWith('/reader/') ||
    location.pathname.includes('/reader') ||
    location.pathname.includes('reader');

  if (isReaderPage || isFullscreen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isLoggedIn = Boolean(isAuthenticated && user);
    const currentName = isLoggedIn ? (user.name || 'Student') : name.trim();
    const currentEmail = isLoggedIn ? (user.email || '') : email.trim();
    const currentDesc = description.trim();

    // Guest user fields validation
    if (!isLoggedIn) {
      if (!currentName) {
        setError('Please provide your full name.');
        return;
      }

      if (!currentEmail) {
        setError('Please provide your email address.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(currentEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    // Common description validation
    if (!currentDesc) {
      setError("Please describe the issue you're facing.");
      return;
    }

    if (currentDesc.length < 5) {
      setError('Please provide at least a few words describing your issue.');
      return;
    }

    try {
      setLoading(true);
      // Send complaint securely to backend (JWT token automatically attached via auth interceptor)
      const res = await api.post('/support/complaints', {
        name: currentName,
        email: currentEmail,
        description: currentDesc,
      });

      if (res.data?.success) {
        // Show success screen only after confirmed backend success
        setSubmittedTicket(res.data.ticket || { ticketId: 'SUBMITTED' });
        setDescription('');
        if (!isLoggedIn) {
          setName('');
          setEmail('');
        }
      } else {
        setError(res.data?.message || 'Failed to submit your request. Please try again.');
      }
    } catch (err) {
      console.error('Support ticket submission error:', err);
      setError(
        err.response?.data?.message ||
          'Unable to submit your complaint at this time. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    // Reset submission state after animation completes
    setTimeout(() => {
      setSubmittedTicket(null);
    }, 300);
  };

  return (
    <>
      {/* Floating Help & Support Button (Small, Professional, Bottom-Right) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 md:z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-brand-500 to-coral-500 text-white font-bold text-xs shadow-sunset hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group"
        title="Help & Support"
        aria-label="Open Help & Support"
      >
        <HelpCircle className="w-4 h-4 flex-shrink-0 group-hover:rotate-12 transition-transform duration-200" />
        <span className="hidden sm:inline font-semibold">Help & Support</span>
      </button>

      {/* Help & Support Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 animate-fade-in">
          {/* Modal Container: Fullscreen on mobile, centered modal on desktop */}
          <div className="w-full h-full sm:h-auto sm:max-w-lg bg-[#FAF9F6] dark:bg-[#1C1C1C] text-[#242321] dark:text-gray-100 sm:rounded-3xl shadow-2xl border-0 sm:border border-[#E3DED5] dark:border-neutral-800 flex flex-col max-h-[100vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#E3DED5] dark:border-neutral-800 flex items-start justify-between gap-4 bg-white/70 dark:bg-neutral-900/50">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-500 flex items-center justify-center">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-[#242321] dark:text-white tracking-tight">
                    Help & Support
                  </h3>
                </div>
                <p className="text-xs text-[#77736C] dark:text-gray-400 mt-1 leading-relaxed">
                  Tell us what issue you're facing. Our team will review your request.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {submittedTicket ? (
                /* Success Screen */
                <div className="text-center py-6 sm:py-8 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg sm:text-xl font-bold text-[#242321] dark:text-white">
                      Your request has been submitted successfully!
                    </h4>
                    {submittedTicket.ticketId && (
                      <div className="inline-block px-3 py-1 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                        Ticket ID: {submittedTicket.ticketId}
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-[#77736C] dark:text-gray-400 leading-relaxed max-w-md mx-auto pt-1">
                      Thank you for contacting GenZNotes Support. Our team will review your request and respond to you via email within 24 hours. Please keep an eye on your inbox for our response.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full sm:w-auto px-8 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 shadow-sm transition active:scale-95"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Support Form */
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {isAuthenticated && user ? (
                    /* If User Is Logged In: Only instruction + multiline textarea */
                    <div>
                      <label className="block text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        Please describe the issue you're facing. <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Write your issue here..."
                        rows={5}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition resize-none"
                        required
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Our support team usually reviews requests and replies via email within 24 hours.
                      </span>
                    </div>
                  ) : (
                    /* If User Is Not Logged In (Guest): Name, Email, and Describe Your Issue */
                    <>
                      {/* 1. Your Name */}
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#242321] dark:text-white bg-white dark:bg-neutral-900 border-[#E3DED5] dark:border-neutral-700 focus:outline-none focus:border-brand-500 transition"
                            required
                          />
                        </div>
                      </div>

                      {/* 2. Email Address */}
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-[#242321] dark:text-white bg-white dark:bg-neutral-900 border-[#E3DED5] dark:border-neutral-700 focus:outline-none focus:border-brand-500 transition"
                            required
                          />
                        </div>
                      </div>

                      {/* 3. Describe Your Issue */}
                      <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Describe Your Issue <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please explain the problem or question you are experiencing in detail..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 bg-white dark:bg-neutral-900 border border-[#E3DED5] dark:border-neutral-700 rounded-xl text-xs sm:text-sm text-[#242321] dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-500 transition resize-none"
                            required
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          Our support team usually reviews requests and replies via email within 24 hours.
                        </span>
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpSupportWidget;
