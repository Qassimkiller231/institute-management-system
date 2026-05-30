'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { authAPI } from '@/lib/api';
import { saveOtpEmail, persistSession } from '@/lib/authStorage';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorMessage } from '@/components/common/Messages';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const OTP_ENABLED = process.env.NEXT_PUBLIC_OTP_ENABLED !== 'false';

export default function LoginPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ========================================
  // HANDLERS
  // ========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.requestOTP(email, 'email');

      if (!result.success) {
        setError(result.message || 'Failed to send OTP');
        return;
      }

      if (!OTP_ENABLED) {
        // Backend skips code check when OTP_ENABLED=false; any code is accepted.
        const verify = await authAPI.verifyOTP(email, '000000');
        if (verify.success) {
          const route = persistSession(verify.data);
          router.push(route);
        } else {
          setError(verify.message || 'Login failed');
        }
        return;
      }

      saveOtpEmail(email);
      router.push('/verify-otp');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google sign-in (staff only). Sends the Google ID token to the
   * backend, which links it to an existing ADMIN/TEACHER account.
   */
  const handleGoogleSuccess = async (idToken?: string) => {
    if (!idToken) return;
    setError('');
    try {
      const result = await authAPI.googleLogin(idToken);
      if (result.success) {
        const route = persistSession(result.data);
        router.push(route);
      } else {
        setError(result.message || 'Google sign-in failed');
      }
    } catch {
      setError('Google sign-in failed. Please try again.');
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) return null;
    return (
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-xs text-gray-400 uppercase">or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>
        <div className="flex justify-center">
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={(cred) => handleGoogleSuccess(cred.credential)}
              onError={() => setError('Google sign-in failed')}
            />
          </GoogleOAuthProvider>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Google sign-in is for staff (admin / teacher) only.
        </p>
      </div>
    );
  };
  
  const renderEmailInput = () => {
    return (
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Enter your email"
          required
        />
      </div>
    );
  };

  const renderSubmitButton = () => {
    return (
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (OTP_ENABLED ? 'Sending...' : 'Signing in...') : (OTP_ENABLED ? 'Send OTP' : 'Sign In')}
      </button>
    );
  };

  const renderLoginForm = () => {
    return (
      <AuthLayout>
        <AuthHeader
          title="Institute Portal"
          subtitle={OTP_ENABLED ? 'Enter your email to receive a code' : 'Enter your email to sign in'}
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderEmailInput()}
          <ErrorMessage message={error} />
          {renderSubmitButton()}
        </form>

        {renderGoogleSignIn()}
      </AuthLayout>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  // Currently only one state (login form)
  // Easy to add more states later (loading, success, etc.)
  
  return renderLoginForm();
}