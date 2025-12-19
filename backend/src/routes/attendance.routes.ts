import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin, requireAnyRole } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

import { uploadCsv } from '../config/csvUpload.config';

// Record single attendance (Teacher or Admin only)
router.post(
  '/',
  requireTeacherOrAdmin,
  attendanceController.recordAttendance
);

// Bulk record attendance (CSV Upload)
router.post(
  '/bulk-upload',
  requireTeacherOrAdmin,
  uploadCsv.single('file'),
  attendanceController.uploadBulkAttendance
);

// Bulk record attendance (Manual JSON array - existing)
router.post(
  '/bulk',
  requireTeacherOrAdmin,
  attendanceController.recordBulkAttendance
);

// Get attendance for a specific student (All authenticated users)
router.get(
  '/student/:studentId',
  requireAnyRole,
  attendanceController.getStudentAttendance
);

// Get attendance statistics for a student (All authenticated users)
router.get(
  '/student/:studentId/stats',
  requireAnyRole,
  attendanceController.getAttendanceStats
);

// Get attendance for a class session (Teacher or Admin only)
router.get(
  '/session/:sessionId',
  requireTeacherOrAdmin,
  attendanceController.getSessionAttendance
);

// Get students with low attendance in a group (Teacher or Admin only)
router.get(
  '/group/:groupId/low-attendance',
  requireTeacherOrAdmin,
  attendanceController.getLowAttendanceStudents
);

// Update attendance record (Teacher or Admin only)
router.put(
  '/:id',
  requireTeacherOrAdmin,
  attendanceController.updateAttendance
);

// Delete attendance record (Teacher or Admin only)
router.delete(
  '/:id',
  requireTeacherOrAdmin,
  attendanceController.deleteAttendance
);

export default router;
