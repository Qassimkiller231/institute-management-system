// src/controllers/teacherSchedule.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import {
  createTeacherScheduleTemplate,
  listTeacherScheduleTemplates,
  generateSpeakingSlotsFromTemplate
} from '../services/teacherSchedule.service';

/**
 * POST /api/teacher-schedules/templates
 * Create a teacher schedule template (Admin only for now)
 */
export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { teacherId, dayOfWeek, startTime, endTime } = req.body;

    if (
      !teacherId ||
      typeof dayOfWeek !== 'number' ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          'teacherId, dayOfWeek, startTime and endTime are required'
      });
    }

    const template = await createTeacherScheduleTemplate({
      teacherId,
      dayOfWeek,
      startTime,
      endTime
    });

    return res.status(201).json({
      success: true,
      message: 'Teacher schedule template created successfully',
      data: template
    });
  } catch (error: any) {
    console.error('createTemplate error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create schedule template'
    });
  }
};

/**
 * GET /api/teacher-schedules/templates/:teacherId
 * List active templates for a teacher (Admin)
 */
export const getTemplatesForTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required'
      });
    }

    const templates = await listTeacherScheduleTemplates(teacherId);

    return res.status(200).json({
      success: true,
      data: templates
    });
  } catch (error: any) {
    console.error('getTemplatesForTeacher error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch templates'
    });
  }
};

/**
 * POST /api/teacher-schedules/generate-slots
 * Generate speaking slots from templates for a date range (Admin)
 */
export const generateSlotsFromTemplates = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { teacherId, startDate, endDate, slotDuration } = req.body;

    if (!teacherId || !startDate || !endDate || !slotDuration) {
      return res.status(400).json({
        success: false,
        message:
          'teacherId, startDate, endDate and slotDuration are required'
      });
    }

    const result = await generateSpeakingSlotsFromTemplate({
      teacherId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      slotDuration
    });

    return res.status(200).json({
      success: true,
      message: `Generated ${result.slotsCreated} speaking slots`,
      ...result
    });
  } catch (error: any) {
    console.error('generateSlotsFromTemplates error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate speaking slots'
    });
  }
};