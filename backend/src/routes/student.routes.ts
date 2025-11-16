// src/routes/student.routes.ts
import express from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== STUDENTS ====================

// Admin only for create/update/delete
router.post('/students', requireAdmin, studentController.createStudent);
router.put('/students/:id', requireAdmin, studentController.updateStudent);
router.delete('/students/:id', requireAdmin, studentController.deleteStudent);

// Admin or Teacher can view students
router.get('/students/search', requireTeacherOrAdmin, studentController.searchStudents);
router.get('/students', requireTeacherOrAdmin, studentController.getAllStudents);
router.get('/students/:id', requireTeacherOrAdmin, studentController.getStudentById);

// Admin only for phone and parent management
router.post('/students/:id/phones', requireAdmin, studentController.addPhone);
router.post('/students/:id/parents', requireAdmin, studentController.linkParent);

export default router;
