// src/routes/progressCriteria.routes.ts
import { Router } from 'express';
import { setStudentCriteriaCompletionController } from '../controllers/progressCriteria.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = Router();

router.post(
  '/completion',
  authenticate,requireTeacherOrAdmin,              // optional, if you want only teachers/admin
  setStudentCriteriaCompletionController
);

export default router;