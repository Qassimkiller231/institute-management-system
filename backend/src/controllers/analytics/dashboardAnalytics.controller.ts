// src/controllers/analytics/dashboardAnalytics.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/auth.types';
import {
  getAdminDashboard,
  getTeacherDashboard,
  getTrends,
} from '../../services/analytics/dashboardAnalytics.service';

// GET /api/reports/dashboard/admin?termId=uuid
export const getAdminDashboardController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const termId = req.query.termId as string | undefined;

    const dashboard = await getAdminDashboard(termId);

    return res.status(200).json({
      success: true,
      message: 'Admin dashboard fetched successfully',
      dashboard,
    });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    return res.status(500).json({ success: false, message });
  }
};

// GET /api/reports/dashboard/teacher/:teacherId
export const getTeacherDashboardController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required',
      });
    }

    const dashboard = await getTeacherDashboard(teacherId);

    return res.status(200).json({
      success: true,
      message: 'Teacher dashboard fetched successfully',
      dashboard,
    });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    // Service throws: new Error('Teacher not found')
    const status = message === 'Teacher not found' ? 404 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
};

// GET /api/reports/analytics/trends?monthsBack=6
export const getTrendsController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const monthsParam = req.query.monthsBack as string | undefined;

    let monthsBack: number | undefined;
    if (monthsParam !== undefined) {
      const parsed = Number(monthsParam);
      if (Number.isNaN(parsed) || parsed <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid monthsBack parameter',
        });
      }
      monthsBack = parsed;
    }

    const trends = await getTrends(monthsBack ?? 6);

    return res.status(200).json({
      success: true,
      message: 'Analytics trends fetched successfully',
      trends,
    });
  } catch (error: any) {
    const message = error?.message || 'Internal server error';
    return res.status(500).json({ success: false, message });
  }
};