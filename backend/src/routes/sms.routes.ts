// src/routes/sms.routes.ts
import express from 'express';
import * as smsController from '../controllers/sms.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/sms/send
 * Send SMS to a single recipient
 * Access: Admin only
 */
router.post('/send', requireAdmin, smsController.sendSMS);

/**
 * POST /api/sms/send-otp
 * Send OTP via SMS
 * Access: Admin only (used internally by auth system)
 */
router.post('/send-otp', requireAdmin, smsController.sendOTP);

/**
 * POST /api/sms/payment-reminder
 * Send payment reminder via SMS
 * Access: Admin only
 */
router.post('/payment-reminder', requireAdmin, smsController.sendPaymentReminder);

/**
 * POST /api/sms/attendance-warning
 * Send attendance warning via SMS
 * Access: Admin only
 */
router.post('/attendance-warning', requireAdmin, smsController.sendAttendanceWarning);

/**
 * POST /api/sms/bulk
 * Send bulk SMS to multiple recipients
 * Access: Admin only
 */
router.post('/bulk', requireAdmin, smsController.sendBulkSMS);

/**
 * GET /api/sms/history
 * Get SMS history for current user
 * Access: All authenticated users
 */
router.get('/history', smsController.getSMSHistory);

/**
 * GET /api/sms/logs
 * Get all SMS logs with filters
 * Access: Admin only
 */
router.get('/logs', requireAdmin, smsController.getAllSMSLogs);

/**
 * GET /api/sms/verify-config
 * Verify Twilio configuration
 * Access: Admin only
 */
router.get('/verify-config', requireAdmin, smsController.verifyConfig);

export default router;