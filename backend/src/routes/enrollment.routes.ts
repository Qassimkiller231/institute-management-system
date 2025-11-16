// src/routes/enrollment.routes.ts
import express from 'express';
import * as enrollmentController from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== ENROLLMENTS ====================

// Admin only for create/update/withdraw
router.post('/enrollments', requireAdmin, enrollmentController.createEnrollment);
router.put('/enrollments/:id/status', requireAdmin, enrollmentController.updateEnrollmentStatus);
router.put('/enrollments/:id/withdraw', requireAdmin, enrollmentController.withdrawEnrollment);

// Admin or Teacher can view enrollments
router.get('/enrollments', requireTeacherOrAdmin, enrollmentController.getAllEnrollments);
router.get('/enrollments/:id', requireTeacherOrAdmin, enrollmentController.getEnrollmentById);

// Student-specific enrollments (Admin/Teacher access)
router.get('/students/:studentId/enrollments', requireTeacherOrAdmin, enrollmentController.getStudentEnrollments);

// Group-specific enrollments (Admin/Teacher access)
router.get('/groups/:groupId/enrollments', requireTeacherOrAdmin, enrollmentController.getGroupEnrollments);
router.get('/groups/:groupId/enrollments/stats', requireTeacherOrAdmin, enrollmentController.getGroupEnrollmentStats);

export default router;
