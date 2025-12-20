// src/routes/teacher.routes.ts
import express from 'express';
import * as teacherController from '../controllers/teacher.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== TEACHERS ====================

// Admin only for create/delete
router.post('/', requireAdmin, teacherController.createTeacher);
router.delete('/:id', requireAdmin, teacherController.deleteTeacher);
router.put('/:id/availability', requireAdmin, teacherController.toggleAvailability);

// Teachers can update their own profile OR admin can update any teacher
router.put('/:id', requireTeacherOrAdmin, teacherController.updateTeacher);

// Admin or Teacher can view teachers
router.get('/search', requireTeacherOrAdmin, teacherController.searchTeachers);
router.get('/available', requireTeacherOrAdmin, teacherController.getAvailableTeachers);
router.get('/', requireTeacherOrAdmin, teacherController.getAllTeachers);
router.get('/:id', requireTeacherOrAdmin, teacherController.getTeacherById);

export default router;

