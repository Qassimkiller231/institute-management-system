'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI, authAPI } from '@/lib/api';
import { 
  getToken,
  getUserRole, 
  saveToken, 
  saveUserRole, 
  saveStudentId, 
  saveTeacherId, 
  saveParentId 
} from '@/lib/authStorage';
import { saveLoginRedirect } from '@/lib/redirectStorage';
import { ErrorMessage } from '@/components/common/Messages';

// ========================================
// TYPES
// ========================================

type RegistrationStep = 'register' | 'verify';
type Gender = 'MALE' | 'FEMALE';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  cpr: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    cpr: ''
  });
  const [phoneCountryCode, setPhoneCountryCode] = useState('+973');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<RegistrationStep>('register');
  
  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Redirect if already authenticated
   * Check if user is logged in and redirect to appropriate dashboard
   */
  useEffect(() => {
    const token = getToken();
    if (token) {
      const role = getUserRole();
      
      // Role-to-route mapping
      const roleRoutes: Record<string, string> = {
        STUDENT: '/student',
        TEACHER: '/teacher',
        ADMIN: '/admin',
        PARENT: '/parent',
      };
      
      if (role) {
        const route = roleRoutes[role];
        if (route) {
          router.replace(route);
        }
      }
    }
  }, [router]);

  // ========================================
  // VALIDATION FUNCTIONS
  // ========================================
  
  /**
   * Validate the registration form
   * Checks phone, CPR, and date of birth
   */
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Phone validation - must be 8 digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 8) {
      errors.phone = 'Phone number must be exactly 8 digits';
    }
    
    // CPR validation - must be 9 digits
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
      
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      else if (age < 6 || (age === 6 && monthDiff < 0)) {
        errors.dateOfBirth = 'Student must be at least 6 years old';
      }
      else if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Parse backend error messages into user-friendly format
   */
  const parseBackendError = (err: any): string => {
    let errorMessage = 'Failed to create account. Please try again.';
    
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      const msg = err.message.toLowerCase();
      
      // Error pattern matching
      const errorPatterns = [
        {
          patterns: ['phone', 'unique constraint failed on the fields: (`phone`)'],
          message: 'This phone number is already registered. Please use a different number or login.',
        },
        {
          patterns: ['cpr'],
          message: 'This CPR is already registered. Please use a different CPR or login.',
        },
        {
          patterns: ['email'],
          message: 'This email is already in use. Please use a different email or login.',
        },
      ];
      
      const matchedPattern = errorPatterns.find(({ patterns }) =>
        patterns.some(pattern => msg.includes(pattern))
      );
      
      errorMessage = matchedPattern ? matchedPattern.message : err.message;
    }
    
    return errorMessage;
  };

  // ========================================
  // HANDLERS
  // ========================================
  
  /**
   * Handle form field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /**
   * Handle registration form submission
   * Creates student account and sends OTP for verification
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);

    try {
      // Backend expects just the phone number without country code
      const phoneDigits = formData.phone.replace(/\D/g, '');
      
      const result = await studentAPI.create({
        ...formData,
        phone: phoneDigits
      });

      if (result.success) {
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
    } catch (err: any) {
      setError(parseBackendError(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OTP verification
   * Verifies OTP and logs user in
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authAPI.verifyOTP(formData.email, otpCode);
      
      // console.log('Full auth response:', result); // Debug
      
      if (result.success) {
        // Save authentication data using storage utilities
        saveToken(result.data.token);
        saveUserRole(result.data.user.role);
        
        // Save role-specific IDs using mapping
        const idMappings = [
          { key: 'studentId', saveFn: saveStudentId },
          { key: 'teacherId', saveFn: saveTeacherId },
          { key: 'parentId', saveFn: saveParentId },
        ];
        
        idMappings.forEach(({ key, saveFn }) => {
          const id = result.data.user[key];
          if (id) saveFn(id);
        });
        
        // Redirect to placement test
        router.push('/take-test');
      } else {
        setError(result.message || 'Invalid OTP code');
      }
    } catch (err) {
      // console.error('Verify OTP error:', err); // Debug
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle navigation to login page
   */
  const handleGoToLogin = () => {
    saveLoginRedirect('/take-test');
    router.push('/login');
  };

  // ========================================
  // RENDER FUNCTIONS - VERIFICATION STEP
  // ========================================
  
  /**
   * OTP verification screen
   */
  const renderVerificationStep = () => {
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

            <ErrorMessage message={error} />

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
  };

  // ========================================
  // RENDER FUNCTIONS - REGISTRATION STEP
  // ========================================

  /**
   * Name input fields (First & Last Name)
   */
  const renderNameFields = () => {
    return (
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
    );
  };

  /**
   * Contact fields (Email & Phone)
   */
  const renderContactFields = () => {
    return (
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
    );
  };

  /**
   * Personal info fields (Date of Birth & Gender)
   */
  const renderPersonalFields = () => {
    return (
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
    );
  };

  /**
   * CPR field
   */
  const renderCPRField = () => {
    return (
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
    );
  };

  /**
   * Registration form screen (main)
   */
  const renderRegistrationStep = () => {
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
              {renderNameFields()}
              {renderContactFields()}
              {renderPersonalFields()}
              {renderCPRField()}

              <ErrorMessage message={error} />

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
                  onClick={handleGoToLogin}
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
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (step === 'verify') {
    return renderVerificationStep();
  }

  return renderRegistrationStep();
}