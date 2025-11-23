// src/routes/test.routes.ts
import express from 'express';
import * as testController from '../controllers/test.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.use(authenticate);
router.get('/', testController.getTests);
router.post('/', requireAdmin, testController.createTest);
router.post('/:testId/questions', requireAdmin, testController.addQuestionToTest);

router.get('/:testId', requireTeacherOrAdmin, testController.getTestById);

export default router;