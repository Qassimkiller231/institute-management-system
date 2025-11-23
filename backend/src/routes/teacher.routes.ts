// src/routes/teacher.routes.ts
import express from 'express';
import * as teacherController from '../controllers/teacher.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== TEACHERS ====================

// Admin only for create/update/delete
router.post('/', requireAdmin, teacherController.createTeacher);
router.put('/:id', requireAdmin, teacherController.updateTeacher);
router.delete('/:id', requireAdmin, teacherController.deleteTeacher);
router.put('/:id/availability', requireAdmin, teacherController.toggleAvailability);

// Admin or Teacher can view teachers
router.get('/search', requireTeacherOrAdmin, teacherController.searchTeachers);
router.get('/available', requireTeacherOrAdmin, teacherController.getAvailableTeachers);
router.get('/', requireTeacherOrAdmin, teacherController.getAllTeachers);
router.get('/:id', requireTeacherOrAdmin, teacherController.getTeacherById);

export default router;
