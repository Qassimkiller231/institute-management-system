import express from 'express';
import * as paymentReminderController from '../controllers/paymentReminder.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin); // All routes require admin

router.post('/check-and-send', paymentReminderController.checkAndSendReminders);
router.post('/manual', paymentReminderController.sendManualReminder);
router.get('/overdue', paymentReminderController.getOverduePayments);

export default router;