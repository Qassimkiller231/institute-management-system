// src/routes/progressCriteria.routes.ts
import { Router } from 'express';
import { 
  setStudentCriteriaCompletionController, 
  getStudentProgressController,
  listProgressCriteriaController
} from '../controllers/progressCriteria.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = Router();

// Get list of criteria (by level or group)
router.get(
  '/',
  authenticate,
  listProgressCriteriaController
);

// Get student progress
router.get(
  '/student/:studentId/progress',
  authenticate,
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