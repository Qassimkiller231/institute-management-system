// src/routes/progressCriteria.routes.ts
import { Router } from 'express';
import {
  setStudentCriteriaCompletionController,
  getStudentProgressController,
  listProgressCriteriaController
} from '../controllers/progressCriteria.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin, requireAnyRole } from '../middleware/role.middleware';

const router = Router();

// Get list of criteria (by level or group) - All authenticated users
router.get(
  '/',
  authenticate,
  requireAnyRole,
  listProgressCriteriaController
);

// Get student progress - All authenticated users
router.get(
  '/student/:studentId/progress',
  authenticate,
  requireAnyRole,
  getStudentProgressController
);

// Set criteria completion
router.post(
  '/completion',
  authenticate,
  requireTeacherOrAdmin,
  setStudentCriteriaCompletionController
);

export default router;