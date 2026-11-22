import React from 'react';
import { ShieldAlert, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SingleDeviceAlertModal = ({ message, onClose }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl p-6 sm:p-8 shadow-2xl border border-red-200 dark:border-neutral-700 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Session Terminated
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {message || 'Your account was logged in on another device. Please log in again.'}
        </p>

        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 mb-6">
          For security and account protection, GenZNotes permits only one active device session per student account.
        </div>

        <button
          onClick={handleLoginRedirect}
          className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-brand-500 to-sunset-red hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center justify-center gap-2 transition"
        >
          <LogIn className="w-4 h-4" />
          <span>Log In Again</span>
        </button>
      </div>
    </div>
  );
};

export default SingleDeviceAlertModal;
