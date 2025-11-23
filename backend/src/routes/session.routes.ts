// src/routes/session.routes.ts
import express from 'express';
import * as sessionController from '../controllers/session.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get sessions by group (must come before /:id)
router.get('/group/:groupId', requireTeacherOrAdmin, sessionController.getSessionsByGroup);

// Admin only for create/update/delete
router.post('/', requireAdmin, sessionController.createSession);
router.post('/bulk', requireAdmin, sessionController.bulkCreateSessions);
router.put('/:id', requireAdmin, sessionController.updateSession);
router.patch('/:id/complete', requireAdmin, sessionController.completeSession);
router.patch('/:id/cancel', requireAdmin, sessionController.cancelSession);

// Admin or Teacher can view sessions
router.get('/', requireTeacherOrAdmin, sessionController.getAllSessions);
router.get('/:id', requireTeacherOrAdmin, sessionController.getSessionById);

export default router;