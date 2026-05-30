// src/routes/test.routes.ts
import express from 'express';
import * as testController from '../controllers/test.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

router.use(authenticate);
router.get('/', testController.getTests);
router.post('/', requireAdmin, testController.createTest);
router.get('/:testId', requireTeacherOrAdmin, testController.getTestById);
router.patch('/:testId', requireAdmin, testController.updateTest);
router.delete('/:testId', requireAdmin, testController.deleteTest);

router.post('/:testId/questions', requireAdmin, testController.addQuestionToTest);
router.post('/:testId/questions/reorder', requireAdmin, testController.reorderQuestions);
router.patch('/:testId/questions/:questionId', requireAdmin, testController.updateQuestion);
router.delete('/:testId/questions/:questionId', requireAdmin, testController.deleteQuestion);

export default router;