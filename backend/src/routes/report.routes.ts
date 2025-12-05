// backend/src/routes/report.routes.ts
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware'; 
import { requireTeacherOrAdmin } from '../middleware/role.middleware';
import {
  downloadPlacementTestReport,
  getPlacementTestReportData,
  emailPlacementTestReport,
  downloadGroupAttendanceReport,
  getGroupAttendanceData,
  downloadGroupProgressReport,
  getGroupProgressData,
  downloadGroupPerformanceReport
} from '../controllers/report.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// PLACEMENT TEST REPORTS (Individual Students)
// ============================================

/**
 * GET /api/reports/placement-test/:studentId
 * Download placement test report as PDF
 */
router.get('/placement-test/:studentId', downloadPlacementTestReport);

/**
 * GET /api/reports/placement-test/:studentId/preview
 * Get report data (JSON) without generating PDF
 */
router.get('/placement-test/:studentId/preview', getPlacementTestReportData);

/**
 * POST /api/reports/placement-test/:studentId/email
 * Send report via email
 */
router.post('/placement-test/:studentId/email', emailPlacementTestReport);

// ============================================
// GROUP REPORTS (Teacher Portal)
// ============================================

/**
 * GET /api/reports/group/:groupId/attendance
 * Download group attendance report as PDF
 */
router.get('/group/:groupId/attendance', requireTeacherOrAdmin, downloadGroupAttendanceReport);

/**
 * GET /api/reports/group/:groupId/attendance/preview
 * Get group attendance data in JSON format
 */
router.get('/group/:groupId/attendance/preview', requireTeacherOrAdmin, getGroupAttendanceData);

/**
 * GET /api/reports/group/:groupId/progress
 * Download group progress report as PDF
 */
router.get('/group/:groupId/progress', requireTeacherOrAdmin, downloadGroupProgressReport);

/**
 * GET /api/reports/group/:groupId/progress/preview
 * Get group progress data in JSON format
 */
router.get('/group/:groupId/progress/preview', requireTeacherOrAdmin, getGroupProgressData);

/**
 * GET /api/reports/group/:groupId/performance
 * Download group performance report as PDF
 */
router.get('/group/:groupId/performance', requireTeacherOrAdmin, downloadGroupPerformanceReport);

export default router;