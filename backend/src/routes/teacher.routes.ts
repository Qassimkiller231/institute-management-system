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
router.post('/teachers', requireAdmin, teacherController.createTeacher);
router.put('/teachers/:id', requireAdmin, teacherController.updateTeacher);
router.delete('/teachers/:id', requireAdmin, teacherController.deleteTeacher);
router.put('/teachers/:id/availability', requireAdmin, teacherController.toggleAvailability);

// Admin or Teacher can view teachers
router.get('/teachers/search', requireTeacherOrAdmin, teacherController.searchTeachers);
router.get('/teachers/available', requireTeacherOrAdmin, teacherController.getAvailableTeachers);
router.get('/teachers', requireTeacherOrAdmin, teacherController.getAllTeachers);
router.get('/teachers/:id', requireTeacherOrAdmin, teacherController.getTeacherById);

export default router;
