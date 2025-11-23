// src/controllers/analytics/financialAnalytics.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/auth.types';
import {
  getMonthlyProgramDues,
  getTermDuesOverview,
} from '../../services/analytics/financialAnalytics.service';

// GET /api/reports/financial/monthly-dues?year=2025
export const getMonthlyProgramDuesController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const yearParam = req.query.year as string | undefined;
    const year = yearParam ? Number(yearParam) : undefined;

    if (yearParam && Number.isNaN(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year parameter',
      });
    }

    const data = await getMonthlyProgramDues(year);

    return res.status(200).json({
      success: true,
      message: 'Monthly program dues fetched successfully',
      data,
    });
  } catch (error: any) {
    // For now we don’t have specific error types here, so just send 500
    const message = error?.message || 'Internal server error';
    res.status(500).json({ success: false, message });
  }
};

// GET /api/reports/financial/term/:termId
export const getTermDuesOverviewController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { termId } = req.params;

    if (!termId) {
      return res.status(400).json({
        success: false,
        message: 'termId is required',
      });
    }

    const data = await getTermDuesOverview(termId);

    return res.status(200).json({
      success: true,
      message: 'Term dues overview fetched successfully',
      data,
    });
  } catch (error: any) {
    // Match what the service throws: `throw new Error('Term not found')`
    const message = error?.message || 'Internal server error';
    const status = message === 'Term not found' ? 404 : 500;

    res.status(status).json({
      success: false,
      message,
    });
  }
};