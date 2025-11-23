// src/controllers/analytics/performanceReports.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/auth.types';import {
  getGroupPerformanceReport,
  getStudentPerformanceReport,
  getAtRiskStudents,
} from '../../services/analytics/performanceReports.service';

// GET /api/reports/performance/group/:groupId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getGroupPerformanceReportController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { groupId } = req.params;
    const startDateStr = req.query.startDate as string | undefined;
    const endDateStr = req.query.endDate as string | undefined;

    if (!groupId) {
      return res.status(400).json({
        success: false,
        message: 'groupId is required',
      });
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (startDateStr) {
      const d = new Date(startDateStr);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate',
        });
      }
      startDate = d;
    }

    if (endDateStr) {
      const d = new Date(endDateStr);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate',
        });
      }
      endDate = d;
    }

    const report = await getGroupPerformanceReport(groupId, startDate, endDate);

    return res.status(200).json({
      success: true,
      message: 'Group performance report generated successfully',
      report,
    });
  } catch (err) {
    _next(err);
  }
};

// GET /api/reports/performance/student/:studentId?enrollmentId=uuid
export const getStudentPerformanceReportController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { studentId } = req.params;
    const enrollmentId = req.query.enrollmentId as string | undefined;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required',
      });
    }

    const report = await getStudentPerformanceReport(studentId, enrollmentId);

    return res.status(200).json({
      success: true,
      message: 'Student performance report generated successfully',
      report,
    });
  } catch (err: any) {
    if (
      err.message === 'Student not found' ||
      err.message === 'Enrollment not found for student'
    ) {
      return res.status(404).json({
        success: false,
        message: err.message,
      });
    }
    _next(err);
  }
};

// GET /api/reports/at-risk-students?groupId=uuid&threshold=75
export const getAtRiskStudentsController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const groupId = req.query.groupId as string | undefined;
    const thresholdParam = req.query.threshold as string | undefined;

    let threshold: number | undefined;
    if (thresholdParam !== undefined) {
      const parsed = Number(thresholdParam);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid threshold parameter',
        });
      }
      threshold = parsed;
    }

    const result = await getAtRiskStudents(groupId, threshold);

    return res.status(200).json({
      success: true,
      message: 'At-risk students fetched successfully',
      ...result,
    });
  } catch (err) {
    _next(err);
  }
};