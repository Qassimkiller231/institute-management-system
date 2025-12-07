// src/routes/enrollment.routes.ts
import express from 'express';
import * as enrollmentController from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update/withdraw/delete
router.post('/', requireAdmin, enrollmentController.createEnrollment);
router.put('/:id', requireAdmin, enrollmentController.updateEnrollment);
router.put('/:id/status', requireAdmin, enrollmentController.updateEnrollmentStatus);
router.put('/:id/withdraw', requireAdmin, enrollmentController.withdrawEnrollment);
router.delete('/:id', requireAdmin, enrollmentController.deleteEnrollment);

// Admin or Teacher can view enrollments
router.get('/', requireTeacherOrAdmin, enrollmentController.getAllEnrollments);
router.get('/:id', requireTeacherOrAdmin, enrollmentController.getEnrollmentById);

export default router;