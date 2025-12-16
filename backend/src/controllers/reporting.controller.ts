// src/controllers/reporting.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as dashboardService from '../services/analytics/dashboardAnalytics.service';
import * as performanceService from '../services/analytics/performanceReports.service';
import * as financialService from '../services/analytics/financialAnalytics.service';
import * as programService from '../services/analytics/programAnalytics.service';

// 1. Admin Dashboard
export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const termId = req.query.termId as string | undefined;
    const result = await dashboardService.getAdminDashboard(termId);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard fetched successfully',
      dashboard: result
    });
  } catch (error: any) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin dashboard'
    });
  }
};

// 2. Teacher Dashboard
export const getTeacherDashboard = async (req: AuthRequest, res: Response) => {
  try {
    // Accept teacherId from either query param or URL param
    const teacherId = req.query.teacherId as string || req.params.teacherId;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    const result = await dashboardService.getTeacherDashboard(teacherId);

    res.status(200).json({
      success: true,
      message: 'Teacher dashboard fetched successfully',
      dashboard: result
    });
  } catch (error: any) {
    console.error('Get teacher dashboard error:', error);

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teacher dashboard'
    });
  }
};

// 3. Group Performance Report
export const getGroupPerformanceReport = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'Group ID is required'
      });
    }

    const result = await performanceService.getGroupPerformanceReport(
      groupId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      message: 'Group performance report generated successfully',
      report: result
    });
  } catch (error: any) {
    console.error('Get group performance report error:', error);

    if (error.message === 'Group not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate group performance report'
    });
  }
};

// 4. Student Performance Report
export const getStudentPerformanceReport = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const enrollmentId = req.query.enrollmentId as string | undefined;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const result = await performanceService.getStudentPerformanceReport(
      studentId,
      enrollmentId
    );

    res.status(200).json({
      success: true,
      message: 'Student performance report generated successfully',
      report: result
    });
  } catch (error: any) {
    console.error('Get student performance report error:', error);

    if (error.message === 'Student not found' || error.message === 'Enrollment not found for student') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate student performance report'
    });
  }
};

// 5. At-Risk Students
export const getAtRiskStudents = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.query.groupId as string | undefined;
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 75;

    const result = await performanceService.getAtRiskStudents(groupId, threshold);

    res.status(200).json({
      success: true,
      message: 'At-risk students fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get at-risk students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch at-risk students'
    });
  }
};

// 6. Monthly Program Dues
export const getMonthlyProgramDues = async (req: AuthRequest, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const result = await financialService.getMonthlyProgramDues(year);

    res.status(200).json({
      success: true,
      message: 'Monthly program dues fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get monthly program dues error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch monthly program dues'
    });
  }
};

// 7. Term Dues Overview
export const getTermDuesOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { termId } = req.params;

    if (!termId) {
      return res.status(400).json({
        success: false,
        message: 'Term ID is required'
      });
    }

    const result = await financialService.getTermDuesOverview(termId);

    res.status(200).json({
      success: true,
      message: 'Term dues overview fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get term dues overview error:', error);

    if (error.message === 'Term not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch term dues overview'
    });
  }
};

// 7.5. Overall Financial Analytics (All Terms)
export const getOverallFinancialAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const result = await financialService.getOverallFinancialAnalytics();

    res.status(200).json({
      success: true,
      message: 'Overall financial analytics fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get overall financial analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch overall financial analytics'
    });
  }
};

// 8. Program Student Overview (FIX: This is the one failing!)
export const getProgramStudentOverview = async (req: AuthRequest, res: Response) => {
  try {
    const { programId } = req.params;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'Program ID is required'
      });
    }

    const result = await programService.getProgramStudentOverview(programId);

    res.status(200).json({
      success: true,
      message: 'Program student overview fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get program student overview error:', error);

    if (error.message === 'Program not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch program student overview'
    });
  }
};

// 9. Placement Test Summary (FIX: This is the other one failing!)
export const getPlacementTestSummary = async (req: AuthRequest, res: Response) => {
  try {
    const result = await programService.getPlacementTestSummary();

    res.status(200).json({
      success: true,
      message: 'Placement test summary fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get placement test summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch placement test summary'
    });
  }
};

// 10. Trends
export const getTrends = async (req: AuthRequest, res: Response) => {
  try {
    const monthsBack = req.query.monthsBack ? parseInt(req.query.monthsBack as string) : 6;
    const result = await dashboardService.getTrends(monthsBack);

    res.status(200).json({
      success: true,
      message: 'Trends fetched successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Get trends error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch trends'
    });
  }
};