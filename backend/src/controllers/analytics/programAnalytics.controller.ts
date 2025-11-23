// src/controllers/analytics/programAnalytics.controller.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types/auth.types';import {
  getProgramStudentOverview,
  getPlacementTestSummary,
} from '../../services/analytics/programAnalytics.service';

// GET /api/reports/program/:programId
export const getProgramStudentOverviewController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const { programId } = req.params;

    if (!programId) {
      return res.status(400).json({
        success: false,
        message: 'programId is required',
      });
    }

    const result = await getProgramStudentOverview(programId);

    return res.status(200).json({
      success: true,
      message: 'Program student overview fetched successfully',
      data: result,
    });
  } catch (error: any) {
    const status = error?.message === 'Program not found' ? 404 : 500;
    return res.status(status).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
};

// GET /api/reports/placement-tests
export const getPlacementTestSummaryController = async (req: AuthRequest, res: Response, _next: NextFunction) => {
  try {
    const result = await getPlacementTestSummary();

    return res.status(200).json({
      success: true,
      message: 'Placement test summary fetched successfully',
      data: result,
    });
  } catch (error: any) {
    // You can special-case messages here later if needed
    return res.status(500).json({
      success: false,
      message: error?.message || 'Internal server error',
    });
  }
};