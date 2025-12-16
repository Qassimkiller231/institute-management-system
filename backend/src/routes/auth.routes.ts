import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/request-otp 
 * Request OTP code for login
 * Public route
 */
router.post('/request-otp', authController.requestOtp);

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login
 * Public route
 */
router.post('/verify-otp', authController.verifyOtp);

/**
 * POST /api/auth/logout
 * Logout user
 * Protected route
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * Get current user info
 * Protected route
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
