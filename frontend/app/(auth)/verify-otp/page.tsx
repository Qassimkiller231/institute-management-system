'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { getOtpEmail, removeOtpEmail, saveToken, saveUserRole, saveStudentId, saveTeacherId, saveParentId } from '@/lib/authStorage';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorMessage } from '@/components/common/Messages';

export default function VerifyOtpPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  useEffect(() => {
    // Check if email exists in storage
    const savedEmail = getOtpEmail();
    
    if (!savedEmail) {
      // No email found, redirect to login
      router.push('/login');
      return;
    }
    
    setEmail(savedEmail);
  }, [router]);

  // ========================================
  // HANDLERS
  // ========================================
  
  /**
   * Handle successful login by:
   * 1. Saving token and user data
   * 2. Clearing OTP email
   * 3. Redirecting to role-specific dashboard
   */
  const handleSuccessfulLogin = (result: any) => {
    // Save authentication data
    saveToken(result.token);
    saveUserRole(result.user.role);
    
    // Role-specific configuration (ID storage + routing)
    const roleConfig = {
      STUDENT: {
        saveId: () => saveStudentId(result.user.studentId),
        route: '/student/dashboard',
      },
      TEACHER: {
        saveId: () => saveTeacherId(result.user.teacherId),
        route: '/teacher/dashboard',
      },
      PARENT: {
        saveId: () => saveParentId(result.user.parentId),
        route: '/parent/dashboard',
      },
      ADMIN: {
        saveId: () => {}, // Admin doesn't need specific ID
        route: '/admin/dashboard',
      },
    };
    
    const config = roleConfig[result.user.role as keyof typeof roleConfig];
    
    if (config) {
      config.saveId(); // Save role-specific ID
      removeOtpEmail(); // Clean up OTP email
      router.push(config.route); // Navigate to dashboard
    } else {
      // Fallback for unknown roles
      removeOtpEmail();
      router.push('/');
    }
    
    // Debug logging (commented out for production)
    // console.log('🎉 Login successful:', {
    //   role: result.user.role,
    //   route: config?.route,
    //   token: result.token.substring(0, 20) + '...',
    // });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.verifyOTP(email, otp);
      
      if (result.success) {
        handleSuccessfulLogin(result.data);
      } else {
        setError(result.message || 'Invalid OTP code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      // console.error('OTP verification error:', err); // Debug only
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setError('');
      await authAPI.requestOTP(email, 'email');
      
      
    } catch (err) {
      setError('Failed to resend OTP');
      // console.error('Resend OTP error:', err); // Debug only
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================
  
  const renderOtpInput = () => {
    return (
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Verification Code
        </label>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-center text-2xl tracking-widest"
          placeholder="000000"
          maxLength={6}
          required
        />
        <p className="mt-2 text-sm text-gray-600">
          Code sent to: <span className="font-medium text-gray-900">{email}</span>
        </p>
      </div>
    );
  };

  const renderSubmitButton = () => {
    return (
      <button
        type="submit"
        disabled={loading || otp.length !== 6}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    );
  };

  const renderResendButton = () => {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOtp}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Didn't receive code? Resend
        </button>
      </div>
    );
  };

  const renderVerifyOtpForm = () => {
    return (
      <AuthLayout>
        <AuthHeader 
          title="Verify OTP" 
          subtitle="Enter the verification code sent to your email"
        />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderOtpInput()}
          <ErrorMessage message={error} />
          {renderSubmitButton()}
          {renderResendButton()}
        </form>
      </AuthLayout>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  return renderVerifyOtpForm();
}