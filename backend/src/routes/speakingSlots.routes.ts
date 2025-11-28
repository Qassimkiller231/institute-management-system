// src/routes/speakingSlot.routes.ts
import express from 'express';
import * as speakingSlotController from '../controllers/speakingSlot.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require auth
router.use(authenticate);

// View available slots (Students can view)
router.get(
  '/available',
  speakingSlotController.getAvailableSlots
);

// Book a slot for a session (Students can book)
router.post(
  '/book',
  speakingSlotController.bookSlot
);

// View all slots for a specific teacher (Teacher/Admin only)
router.get(
  '/teacher/:teacherId',
  requireTeacherOrAdmin,
  speakingSlotController.getSlotsForTeacher
);

// Submit speaking result (Teacher/Admin only)
router.post(
  '/submit-result',
  requireTeacherOrAdmin,
  speakingSlotController.submitResult
);
router.put(
  '/:id/cancel',
  speakingSlotController.cancelSlot
);

export default router;