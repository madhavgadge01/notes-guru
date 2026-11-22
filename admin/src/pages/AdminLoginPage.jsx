import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import AdminLogo from '../components/common/AdminLogo';

const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== 'rozar@notesguru.in') {
      setError('Access restricted. Only authorized administrator rozar@notesguru.in can log into this portal.');
      return;
    }

    setLoading(true);

    try {
      const result = await login(trimmedEmail, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setError(err.message || 'Access denied. You do not have administrator permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F7F4] dark:bg-[#141414] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-200 dark:border-neutral-800 p-8 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <AdminLogo />
          </div>
          <h2 className="text-xl font-black text-gray-950 dark:text-white">
            Administrative Control Center
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in with authorized administrator credentials to manage academic hierarchy, pricing, and notes.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter administrator email"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-500 to-coral-500 hover:from-brand-600 hover:to-coral-600 shadow-sunset flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Enter Admin Console</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
