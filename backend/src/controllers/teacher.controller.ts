// src/controllers/teacher.controller.ts
import { Request, Response } from 'express';
import * as teacherService from '../services/teacher.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/teachers
 * Create new teacher
 */
export const createTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    // Validation
    if (!data.email || !data.firstName || !data.lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, first name, and last name are required'
      });
    }

    const result = await teacherService.createTeacher(data);

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Create teacher error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create teacher'
    });
  }
};

/**
 * GET /api/teachers
 * Get all teachers with filters
 */
export const getAllTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true :
        req.query.isActive === 'false' ? false : undefined,
      availableForSpeakingTests: req.query.availableForSpeakingTests === 'true' ? true :
        req.query.availableForSpeakingTests === 'false' ? false : undefined,
      specialization: req.query.specialization as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await teacherService.getAllTeachers(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all teachers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teachers'
    });
  }
};

/**
 * GET /api/teachers/:id
 * Get teacher by ID with full details
 */
export const getTeacherById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await teacherService.getTeacherById(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get teacher by ID error:', error);

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch teacher'
    });
  }
};

/**
 * PUT /api/teachers/:id
 * Update teacher information
 * - Teachers can only update their own profile
 * - Admins can update any teacher
 */
export const updateTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if teacher is trying to update their own profile
    if (req.user?.role === 'TEACHER') {
      // Get the teacher ID from the user's teacher record
      const teacher = await teacherService.getTeacherByUserId(req.user.userId);

      if (!teacher || teacher.id !== id) {
        return res.status(403).json({
          success: false,
          message: 'Teachers can only update their own profile'
        });
      }
    }

    const result = await teacherService.updateTeacher(id, updates);

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update teacher error:', error);

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update teacher'
    });
  }
};

/**
 * DELETE /api/teachers/:id
 * Deactivate teacher (soft delete)
 */
export const deleteTeacher = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await teacherService.deleteTeacher(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Delete teacher error:', error);

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete teacher'
    });
  }
};

/**
 * PUT /api/teachers/:id/availability
 * Toggle speaking test availability
 */
export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Available field must be a boolean'
      });
    }

    const result = await teacherService.toggleAvailability(id, available);

    res.status(200).json({
      success: true,
      message: `Teacher ${available ? 'is now' : 'is no longer'} available for speaking tests`,
      data: result
    });
  } catch (error: any) {
    console.error('Toggle availability error:', error);

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update availability'
    });
  }
};

/**
 * GET /api/teachers/search
 * Search teachers by name or email
 */
export const searchTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await teacherService.searchTeachers(query, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Search teachers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search teachers'
    });
  }
};

/**
 * GET /api/teachers/available
 * Get available teachers for speaking tests
 */
export const getAvailableTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const result = await teacherService.getAvailableTeachers();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get available teachers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available teachers'
    });
  }
};
