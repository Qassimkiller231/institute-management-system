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

export default function LoginPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
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
      const result = await authAPI.requestOTP(email, method);
      
      if (result.success) {
        saveOtpEmail(email); // ✅ Using utility function
        router.push('/verify-otp');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
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
          Email/Phone
        </label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Enter your email or phone"
          required
        />
      </div>
    );
  };

  const renderMethodSelector = () => {
    return (
      <div>
        <label className="block text-sm font-semibold mb-3 text-gray-700">
          Send OTP via
        </label>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="email"
              checked={method === 'email'}
              onChange={(e) => setMethod(e.target.value as 'email')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-gray-900 font-medium">Email</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              value="sms"
              checked={method === 'sms'}
              onChange={(e) => setMethod(e.target.value as 'sms')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-gray-900 font-medium">SMS</span>
          </label>
        </div>
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
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    );
  };

  const renderLoginForm = () => {
    return (
      <AuthLayout>
        <AuthHeader 
          title="Institute Portal" 
          subtitle="Enter your credentials to continue"
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderEmailInput()}
          {renderMethodSelector()}
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