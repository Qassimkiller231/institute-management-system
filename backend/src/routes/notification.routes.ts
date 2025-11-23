import express from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Payment reminders
router.post('/payment-reminder/:installmentId', notificationController.sendPaymentReminder);

// Attendance warnings
router.post('/attendance-warning/:studentId', notificationController.sendAttendanceWarning);

// Get at-risk students
router.get('/at-risk-students', notificationController.getAtRiskStudents);

// Test scheduler
router.post('/test-scheduler', notificationController.testScheduler);

export default router;