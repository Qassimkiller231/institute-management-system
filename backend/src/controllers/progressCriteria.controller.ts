// src/controllers/progressCriteria.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  setStudentCriteriaCompletion,
} from '../services/progressCriteria.service';

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
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'completionDate must be a valid date string (YYYY-MM-DD, ISO, etc.)',
        });
      }
      parsedDate = d;
    }

    const record = await setStudentCriteriaCompletion(
      studentId,
      criteriaId,
      enrollmentId,  // 👈 now guaranteed non-null
      completed,
      parsedDate
    );

    return res.status(200).json({
      success: true,
      message: 'Student progress criteria updated successfully',
      data: record,
    });
  } catch (error: any) {
    // You can refine this if your service throws specific messages
    if (error?.message === 'Progress criteria not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};