// src/controllers/progressCriteria controller.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import {
  setStudentCriteriaCompletion,
  getStudentCriteriaProgress,
  listProgressCriteria,
  createProgressCriteria,
  updateProgressCriteria,
  setProgressCriteriaActive,
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
/**
 * POST /api/progress-criteria/bulk
 * Body: { progressUpdates: [{ studentId, criteriaId, completed, notes?, teacherId? }] }
 */
export const bulkSetCriteriaCompletionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { progressUpdates } = req.body as {
      progressUpdates?: Array<{
        studentId: string;
        criteriaId: string;
        completed: boolean;
        notes?: string;
        teacherId?: string;
      }>;
    };

    console.log('💾 [BULK SAVE] Received request with', progressUpdates?.length || 0, 'updates');

    if (!progressUpdates || !Array.isArray(progressUpdates)) {
      return res.status(400).json({
        success: false,
        message: 'progressUpdates array is required',
      });
    }

    const results = [];
    const errors = [];

    for (const update of progressUpdates) {
      const { studentId, criteriaId, completed } = update;

      if (!studentId || !criteriaId || typeof completed !== 'boolean') {
        console.warn('⚠️  Skipping invalid update:', update);
        errors.push({ update, reason: 'Missing or invalid fields' });
        continue;
      }

      try {
        const enrollment = await prisma.enrollment.findFirst({
          where: { studentId, status: 'ACTIVE' },
          select: { id: true },
        });

        if (!enrollment) {
          console.warn(`⚠️  No active enrollment for student ${studentId}`);
          errors.push({ update, reason: 'No active enrollment' });
          continue;
        }

        const result = await setStudentCriteriaCompletion(
          studentId,
          criteriaId,
          enrollment.id,
          completed,
          completed ? new Date() : undefined
        );

        console.log(`✅ Saved: Student ${studentId}, Criteria ${criteriaId}, Completed: ${completed}`);
        results.push(result);
      } catch (err: any) {
        console.error(`❌ Error saving criteria ${criteriaId} for student ${studentId}:`, err.message);
        errors.push({ update, reason: err.message });
      }
    }

    console.log(`💾 [BULK SAVE] Complete: ${results.length} saved, ${errors.length} errors`);

    res.status(200).json({
      success: true,
      message: `Updated ${results.length} criteria completions`,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('❌ [BULK SAVE] Fatal error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to set bulk criteria completions',
    });
  }
};

/**
 * POST /api/progress-criteria
 * Body: { name, description?, levelId?, groupId?, orderNumber? }
 */
export const createProgressCriteriaController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, description, levelId, groupId, orderNumber } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const criteria = await createProgressCriteria({
      name,
      description,
      levelId,
      groupId,
      orderNumber,
    });

    res.status(201).json({
      success: true,
      message: 'Progress criteria created successfully',
      data: criteria,
    });
  } catch (error: any) {
    console.error('Create progress criteria error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create progress criteria',
    });
  }
};

/**
 * PUT /api/progress-criteria/:id
 * Body: { name?, description?, levelId?, groupId?, orderNumber?, isActive? }
 */
export const updateProgressCriteriaController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const criteria = await updateProgressCriteria(id, updates);

    res.status(200).json({
      success: true,
      message: 'Progress criteria updated successfully',
      data: criteria,
    });
  } catch (error: any) {
    console.error('Update progress criteria error:', error);
    const status = error.message === 'Progress criteria not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to update progress criteria',
    });
  }
};

/**
 * DELETE /api/progress-criteria/:id
 * Soft delete (deactivate) progress criteria
 */
export const deleteProgressCriteriaController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await setProgressCriteriaActive(id, false);

    res.status(200).json({
      success: true,
      message: 'Progress criteria deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete progress criteria error:', error);
    const status = error.message === 'Progress criteria not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to delete progress criteria',
    });
  }
};
