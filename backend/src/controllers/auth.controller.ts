import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { RequestOtpBody, VerifyOtpBody, AuthRequest } from '../types/auth.types';

/**
 * POST /api/auth/request-otp
 * Request OTP code
 */
export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, method }: RequestOtpBody = req.body;

    // Validation
    if (!identifier || !method) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and method are required',
      });
    }

    if (method !== 'email' && method !== 'sms') {
      return res.status(400).json({
        success: false,
        message: 'Method must be either email or sms',
      });
    }

    const result = await authService.requestOTP(identifier, method);
    // console.log(result);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Request OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, code }: VerifyOtpBody = req.body;

    // Validation
    if (!identifier || !code) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and code are required',
      });
    }

    if (code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'OTP code must be 6 digits',
      });
    }

    const result = await authService.verifyOTP(identifier, code);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const result = await authService.logout(token);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to logout',
    });
  }
};

/**
 * GET /api/auth/me
 * Get current user info
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }

    const result = await authService.getCurrentUser(req.user.userId);

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get user info',
    });
  }
};
