import { Request } from 'express';
import { JwtPayload } from '../utils/jwt';

/**
 * Request OTP payload
 */
export interface RequestOtpBody {
  identifier: string; // Email or phone number
  method: 'email' | 'sms';
}

/**
 * Verify OTP payload
 */
export interface VerifyOtpBody {
  identifier: string; // Email or phone number
  code: string;
}

/**
 * Auth response (after successful login)
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      phone: string | null;
      role: string;
    };
  };
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

