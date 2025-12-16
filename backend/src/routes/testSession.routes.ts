// src/routes/testSession.routes.ts
import express from 'express';
import * as testSessionController from '../controllers/testSession.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// Get active session for a student (must come BEFORE /:sessionId)
router.get('/active', testSessionController.getActiveSession);

// Start test session
router.post('/start', testSessionController.startTestSession);

// Get last session (completed or otherwise)
router.get('/last-session', testSessionController.getLastSession);

// Get questions for a session
router.get('/:sessionId/questions', testSessionController.getSessionQuestions);

// Submit MCQ answers
router.post('/:sessionId/submit-mcq', testSessionController.submitMcqAnswers);

// Finalize test session (teacher/admin only)
router.post('/:sessionId/finalize', authenticate, requireTeacherOrAdmin, testSessionController.finalizeTestSession);

// Get specific session by ID
router.get('/:sessionId', testSessionController.getTestSessionById);

// List all sessions (teacher/admin only)
router.get('/', authenticate, requireTeacherOrAdmin, testSessionController.listTestSessions);

export default router;