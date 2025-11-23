// src/routes/email.routes.ts
import express from 'express';
import * as emailController from '../controllers/email.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.use(authenticate);

// Admin only routes
router.post('/send', requireAdmin, emailController.sendTestEmail);
router.post('/send-otp', requireAdmin, emailController.sendOtp);
router.post('/send-receipt', requireAdmin, emailController.sendReceipt);
router.post('/send-payment-reminder', requireAdmin, emailController.sendPaymentReminder);
router.post('/send-attendance-warning', requireAdmin, emailController.sendAttendanceWarning);
router.post('/send-announcement', requireAdmin, emailController.sendAnnouncement);
router.post('/send-bulk', requireAdmin, emailController.sendBulk);
router.get('/verify-ses', requireAdmin, emailController.verifySes);
router.get('/history', requireAdmin, emailController.getHistory);

export default router;