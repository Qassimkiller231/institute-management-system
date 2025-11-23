// src/routes/student.routes.ts
import express from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';
import * as enrollmentController from '../controllers/enrollment.controller';

const router = express.Router();

// All routes require authentication
router.post('/', studentController.createStudent);
router.use(authenticate);

// ==================== STUDENTS ====================
router.get('/:id', studentController.getStudentById);


// Admin only for create/update/delete
router.put('/:id', requireAdmin, studentController.updateStudent);
router.delete('/:id', requireAdmin, studentController.deleteStudent);

// Admin or Teacher can view students
router.get('/search', requireTeacherOrAdmin, studentController.searchStudents);
router.get('/', requireTeacherOrAdmin, studentController.getAllStudents);
router.get('/:studentId/enrollments', requireTeacherOrAdmin, enrollmentController.getStudentEnrollments);


export default router;
