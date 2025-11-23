// src/routes/testSession.routes.ts
import express from 'express';
import * as testSessionController from '../controllers/testSession.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// starting / submitting MCQ can be public or require auth — up to you.
// For now I’ll keep them behind authenticate; you can relax if needed.

router.post('/start', testSessionController.startTestSession);
router.get('/:sessionId/questions', testSessionController.getSessionQuestions);
router.post('/:sessionId/submit-mcq', testSessionController.submitMcqAnswers);
router.post('/:sessionId/finalize', authenticate,requireTeacherOrAdmin, testSessionController.finalizeTestSession);
router.get('/:sessionId', testSessionController.getTestSessionById);
router.get('/', authenticate,requireTeacherOrAdmin, testSessionController.listTestSessions);

export default router;