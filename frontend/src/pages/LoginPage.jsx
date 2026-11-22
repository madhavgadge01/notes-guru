import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, ShieldCheck, Sparkles, Loader2, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

const LoginPage = () => {
  const { loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gisLoaded, setGisLoaded] = useState(false);

  const googleBtnContainerRef = useRef(null);
  const returnUrl = location.state?.returnUrl || '/';
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, navigate, returnUrl]);

  // Handle Google credential returned by GIS
  const handleCredentialResponse = async (response) => {
    if (!response || !response.credential) {
      setError('Google Sign-In did not return a valid credential. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        navigate(returnUrl, { replace: true });
      } else {
        setError(result.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError(err.response?.data?.message || err.message || 'Could not authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Identity Services (GIS)
  useEffect(() => {
    const initGis = () => {
      if (window.google?.accounts?.id && googleClientId && !googleClientId.includes('your_google')) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          if (googleBtnContainerRef.current) {
            window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
              theme: 'outline',
              size: 'large',
              width: 340,
              text: 'continue_with',
              shape: 'pill',
              logo_alignment: 'left',
            });
          }
          setGisLoaded(true);
        } catch (initErr) {
          console.warn('GIS initialization error:', initErr);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGis();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGis();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [googleClientId]);

  // Trigger Google Sign-In prompt or OAuth popup
  const handleCustomGoogleClick = () => {
    if (!googleClientId || googleClientId.includes('your_google')) {
      setError(
        'Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your frontend .env and GOOGLE_CLIENT_ID in your backend .env.'
      );
      return;
    }

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One-tap was suppressed, try rendered button or notify
            const renderedBtn = googleBtnContainerRef.current?.querySelector('div[role="button"]');
            if (renderedBtn) {
              renderedBtn.click();
            }
          }
        });
      } catch (promptErr) {
        console.warn('Google prompt error:', promptErr);
      }
    } else {
      setError('Google Sign-In SDK is still loading. Please check your connection and try again.');
    }
  };

  // Developer Test Login (Generates a valid simulated Google token for test/dev environments)
  const handleDevTestGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      // Standard JWT format containing valid mock Google payload
      const mockPayload = {
        sub: 'google_dev_test_student_12345',
        email: 'student.test@notesguru.in',
        name: 'Alex Sharma (Test Student)',
        email_verified: true,
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        iss: 'https://accounts.google.com',
        aud: googleClientId || 'notes_guru_test_aud',
      };
      const simulatedToken = `header.${btoa(JSON.stringify(mockPayload))}.signature`;
      const result = await loginWithGoogle(simulatedToken);
      if (result.success) {
        navigate(returnUrl, { replace: true });
      } else {
        setError(result.message || 'Simulated Google login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Development login failed.');
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = Boolean(googleClientId && !googleClientId.includes('your_google'));

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F3EF] dark:bg-[#141414] text-[#242321] dark:text-gray-100 transition-colors">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-[#1E1E1E] p-8 sm:p-10 rounded-3xl border border-[#E3DED5] dark:border-neutral-800 shadow-xl relative overflow-hidden">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo showText={true} />
          </div>
          <h2 className="text-2xl font-black text-[#242321] dark:text-white tracking-tight">
            Student Sign In
          </h2>
          <p className="mt-1.5 text-xs text-[#77736C] dark:text-gray-400 leading-relaxed">
            Exam Tomorrow? GenZNotes Today. Sign in with your college or personal Google account.
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google Authentication Actions (Exactly One Button) */}
        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-[#242321] dark:text-white bg-white dark:bg-neutral-800 border-2 border-[#DE8E5C] shadow-sm flex items-center justify-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#DE8E5C]" />
              <span>Verifying with Google...</span>
            </div>
          ) : (
            <>
              {/* Official Google GIS Button Container */}
              <div
                ref={googleBtnContainerRef}
                className="w-full flex justify-center min-h-[44px] overflow-hidden"
                style={{ display: gisLoaded ? 'flex' : 'none' }}
              />

              {/* Fallback button displayed only if GIS is loading or unavailable */}
              {!gisLoaded && (
                <button
                  type="button"
                  onClick={handleCustomGoogleClick}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-[#242321] dark:text-white bg-white dark:bg-neutral-800 border-2 border-gray-200 dark:border-neutral-700 hover:border-[#DE8E5C] dark:hover:border-[#DE8E5C] shadow-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
              )}
            </>
          )}

          {/* Environment Notice if Google Client ID is not yet provided */}
          {!isConfigured && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Google OAuth Setup:</p>
                <p className="text-[10px] leading-relaxed">
                  Provide <code className="font-mono font-bold">VITE_GOOGLE_CLIENT_ID</code> in frontend and <code className="font-mono font-bold">GOOGLE_CLIENT_ID</code> in backend to link your Google credentials.
                </p>
                <button
                  type="button"
                  onClick={handleDevTestGoogleLogin}
                  className="mt-2 text-[10px] font-bold text-brand-600 dark:text-brand-400 underline hover:no-underline"
                >
                  Click here to sign in with Developer Test Student Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & Single-Device Policy Guarantee */}
        <div className="pt-4 border-t border-[#E3DED5] dark:border-neutral-800 space-y-2 text-[11px] text-[#77736C] dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Single-device protection: Logging in here securely concludes other active sessions.</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#DE8E5C] flex-shrink-0" />
            <span>All previously unlocked notes, bookmarks, and wishlists remain securely tied to your Google email.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
