// src/controllers/progressCriteria.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  setStudentCriteriaCompletion,
  getStudentCriteriaProgress,
  listProgressCriteria,
} from '../services/progressCriteria.service';

/**
 * GET /api/progress-criteria?levelId=xxx&groupId=xxx&isActive=true
 * Get list of progress criteria by level or group
 */
export const listProgressCriteriaController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { levelId, groupId, isActive } = req.query;

    const filter: any = {};
    
    if (levelId) filter.levelId = levelId as string;
    if (groupId) filter.groupId = groupId as string;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const criteria = await listProgressCriteria(filter);

    res.status(200).json({
      success: true,
      data: criteria,
    });
  } catch (error: any) {
    console.error('List progress criteria error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to list progress criteria',
    });
  }
};

// POST /api/progress-criteria/completion
// Body: { studentId, criteriaId, enrollmentId, completed, completionDate? }
export const setStudentCriteriaCompletionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      studentId,
      criteriaId,
      enrollmentId,
      completed,
      completionDate,
    } = req.body as {
      studentId?: string;
      criteriaId?: string;
      enrollmentId?: string;
      completed?: boolean;
      completionDate?: string;
    };

    // ✅ Validate required fields (enrollmentId is now mandatory)
    if (!studentId || !criteriaId || !enrollmentId) {
      return res.status(400).json({
        success: false,
        message:
          'studentId, criteriaId and enrollmentId are all required fields',
      });
    }

    // ✅ Validate "completed"
    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'completed must be a boolean',
      });
    }

    // ✅ Optional completionDate parsing
    let parsedDate: Date | undefined;
    if (completionDate) {
      const d = new Date(completionDate);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
      }
    }

    const result = await setStudentCriteriaCompletion(
      studentId,
      criteriaId,
      enrollmentId,
      completed,
      parsedDate
    );

    res.status(200).json({
      success: true,
      message: 'Criteria completion updated successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Set student criteria completion error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to set criteria completion',
    });
  }
};

/**
 * GET /api/progress-criteria/student/:studentId/progress
 * Query params: enrollmentId?, groupId?, levelId?, includeInactive?
 */
export const getStudentProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const { enrollmentId, groupId, levelId, includeInactive } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'studentId is required',
      });
    }

    // Either groupId or levelId must be provided
    if (!groupId && !levelId) {
      return res.status(400).json({
        success: false,
        message: 'Either groupId or levelId must be provided',
      });
    }

    const result = await getStudentCriteriaProgress({
      studentId,
      enrollmentId: enrollmentId as string,
      groupId: groupId as string,
      levelId: levelId as string,
      includeInactive: includeInactive === 'true',
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Get student progress error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to get student progress',
    });
  }
};