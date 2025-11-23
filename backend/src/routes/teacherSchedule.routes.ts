// src/routes/teacherSchedule.routes.ts
import express from 'express';
import * as teacherScheduleController from '../controllers/teacherSchedule.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require auth
router.use(authenticate);

// Admin only for managing templates and generating slots
router.post(
  '/templates',
  requireAdmin,
  teacherScheduleController.createTemplate
);

router.get(
  '/templates/:teacherId',
  requireAdmin,
  teacherScheduleController.getTemplatesForTeacher
);

router.post(
  '/generate-slots',
  requireAdmin,
  teacherScheduleController.generateSlotsFromTemplates
);

export default router;