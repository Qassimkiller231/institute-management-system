// src/routes/reporting.routes.ts
import express from 'express';
import * as reportingController from '../controllers/reporting.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// DASHBOARD ROUTES
// ============================================

// Admin Dashboard
router.get(
  '/dashboard/admin',
  requireAdmin,
  reportingController.getAdminDashboard
);

// Teacher Dashboard
router.get(
  '/dashboard/teacher/:teacherId',
  requireTeacherOrAdmin,
  reportingController.getTeacherDashboard
);

// ============================================
// PERFORMANCE ROUTES
// ============================================

// Group Performance Report
router.get(
  '/performance/group/:groupId',
  requireTeacherOrAdmin,
  reportingController.getGroupPerformanceReport
);

// Student Performance Report
router.get(
  '/performance/student/:studentId',
  requireTeacherOrAdmin,
  reportingController.getStudentPerformanceReport
);

// At-Risk Students
router.get(
  '/at-risk',
  requireTeacherOrAdmin,
  reportingController.getAtRiskStudents
);

// ============================================
// FINANCIAL ROUTES
// ============================================

// Monthly Program Dues
router.get(
  '/financial/monthly',
  requireAdmin,
  reportingController.getMonthlyProgramDues
);

// Term Dues Overview
router.get(
  '/financial/term/:termId',
  requireAdmin,
  reportingController.getTermDuesOverview
);

// ============================================
// PROGRAM ROUTES (YOUR FAILING ONES - FIXED!)
// ============================================

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE general routes!
// Placement Test Summary (specific)
router.get(
  '/program/placement-summary',
  requireAdmin,
  reportingController.getPlacementTestSummary
);

// Program Student Overview (general - with parameter)
router.get(
  '/program/:programId/summary',
  requireAdmin,
  reportingController.getProgramStudentOverview
);

// ============================================
// TRENDS ROUTE
// ============================================

router.get(
  '/trends',
  requireAdmin,
  reportingController.getTrends
);

export default router;