'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { setToken, redirectByRole } from '@/lib/auth';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('otpEmail');
    if (!savedEmail) {
      router.push('/login');
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.verifyOTP(email, code);
      
      console.log('Full auth response:', result);
      
      if (result.success) {
        // Save token
        setToken(result.data.token);
        
        // Save user data
        localStorage.setItem('user', JSON.stringify(result.data.user));
        localStorage.setItem('role', result.data.user.role);
        
        // Save role-specific IDs
        if (result.data.user.studentId) {
          localStorage.setItem('studentId', result.data.user.studentId);
        }
        if (result.data.user.teacherId) {
          localStorage.setItem('teacherId', result.data.user.teacherId);
        }
        if (result.data.user.parentId) {
          localStorage.setItem('parentId', result.data.user.parentId);
        }
        
        sessionStorage.removeItem('otpEmail');
        
        // Check for redirect intent
        const redirectTo = sessionStorage.getItem('loginRedirect');
        if (redirectTo) {
          sessionStorage.removeItem('loginRedirect');
          router.push(redirectTo);
          return;
        }
        // Redirect students to dashboard
        if (result.data.user.role === 'STUDENT') {
          router.push('/student');
          return;
        }
        
        // Redirect by role for non-students
        redirectByRole(router, result.data.user.role);
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Verify OTP</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3 text-gray-700">Enter 6-digit code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg text-center text-3xl tracking-widest font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-blue-600 font-medium py-2 hover:text-blue-700"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}