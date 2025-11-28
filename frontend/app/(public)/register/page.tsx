'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI, authAPI } from '@/lib/api';
import { setToken, isAuthenticated, getUserRole } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    cpr: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('+973'); // Default Bahrain
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role === 'STUDENT') router.replace('/student');
      else if (role === 'TEACHER') router.replace('/teacher');
      else if (role === 'ADMIN') router.replace('/admin');
    }
  }, [router]);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    // Phone validation: must be 8 digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 8) {
      errors.phone = 'Phone number must be exactly 8 digits';
    }
    
    // CPR validation: must be 9 digits
    const cprDigits = formData.cpr.replace(/\D/g, '');
    if (cprDigits.length !== 9) {
      errors.cpr = 'CPR must be exactly 9 digits';
    }
    
    // Date of Birth validation
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      // Check if date is in the future
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      // Check if age is at least 6
      else if (age < 6 || (age === 6 && monthDiff < 0)) {
        errors.dateOfBirth = 'Student must be at least 6 years old';
      }
      // Check if age is reasonable (not more than 100)
      else if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate form first
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);

    try {
      // Combine country code with phone number
      const phoneWithCode = phoneCountryCode + formData.phone.replace(/\D/g, '');
      
      // Step 1: Create student account
      const result = await studentAPI.create({
        ...formData,
        phone: phoneWithCode
      });

      if (result.success) {
        // Step 2: Request OTP for login
        const otpResult = await authAPI.requestOTP(formData.email, 'email');
        
        if (otpResult.success) {
          setOtpSent(true);
          setStep('verify');
        } else {
          setError('Account created but failed to send OTP. Please login manually.');
          setTimeout(() => router.push('/login'), 3000);
        }
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const result = await authAPI.verifyOTP(formData.email, otpCode);
    
    console.log('Full auth response:', result); // Debug
    
    if (result.success) {
      // Save token
      setToken(result.data.token);
      localStorage.setItem('authToken', result.data.token);
      
      // Save full user object
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
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
      
      // Always go to test after registration
      router.push('/take-test');
    } else {
      setError(result.message || 'Invalid OTP code');
    }
  } catch (err) {
    console.error('Verify OTP error:', err);
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

  if (step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Verify Your Email
          </h1>
          <p className="text-center text-gray-600 mb-6">
            We sent a code to {formData.email}
          </p>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Enter 6-digit code
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-widest font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Continue to Test'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Register for Placement Test
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Please provide your information to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Phone *
                </label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="w-32 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+974">🇶🇦 +974</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="XXXX XXXX"
                    maxLength={8}
                    required
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Personal Info Row */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  min={new Date(new Date().getFullYear() - 100, 0, 1).toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {validationErrors.dateOfBirth && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            {/* CPR */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                CPR Number *
              </label>
              <input
                type="text"
                name="cpr"
                value={formData.cpr}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                  validationErrors.cpr ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="XXXXXXXXX (9 digits)"
                maxLength={9}
                required
              />
              {validationErrors.cpr && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.cpr}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Creating Account...' : 'Register & Continue'}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  sessionStorage.setItem('loginRedirect', '/take-test');
                  router.push('/login');
                }}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                Login here
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}