import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = Router();
router.get(
  '/student/:studentId',
  attendanceController.getStudentAttendance
);
// All routes require authentication
router.use(authenticate);

// Record single attendance (Teacher or Admin only)
router.post(
  '/',
  requireTeacherOrAdmin,
  attendanceController.recordAttendance
);

// Bulk record attendance for a class session (Teacher or Admin only)
router.post(
  '/bulk',
  requireTeacherOrAdmin,
  attendanceController.recordBulkAttendance
);

// Get attendance for a specific student (Teacher or Admin only)


// Get attendance statistics for a student (Teacher or Admin only)
router.get(
  '/student/:studentId/stats',
  requireTeacherOrAdmin,
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
