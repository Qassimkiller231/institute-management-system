// src/controllers/enrollment.controller.ts
import { Request, Response } from 'express';
import * as enrollmentService from '../services/enrollment.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/enrollments
 * Create new enrollment
 */
export const createEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    // Validation
    if (!data.studentId || !data.groupId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Group ID are required'
      });
    }

    const result = await enrollmentService.createEnrollment(data);

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Create enrollment error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create enrollment'
    });
  }
};

/**
 * GET /api/enrollments
 * Get all enrollments with filters
 */
export const getAllEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      studentId: req.query.studentId as string,
      groupId: req.query.groupId as string,
      termId: req.query.termId as string,
      levelId: req.query.levelId as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await enrollmentService.getAllEnrollments(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollments'
    });
  }
};

/**
 * GET /api/enrollments/:id
 * Get enrollment by ID with full details
 */
export const getEnrollmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await enrollmentService.getEnrollmentById(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get enrollment by ID error:', error);
    
    if (error.message === 'Enrollment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollment'
    });
  }
};

/**
 * PUT /enrollments/:id - Update enrollment (group, status, etc.)
 */
export const updateEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await enrollmentService.updateEnrollment(id, updateData);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update enrollment'
    });
  }
};

/**
 * PUT /api/enrollments/:id/status
 * Update enrollment status
 */
export const updateEnrollmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const result = await enrollmentService.updateEnrollmentStatus(id, status);

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update enrollment status error:', error);
    
    if (error.message === 'Enrollment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update enrollment status'
    });
  }
};

/**
 * PUT /api/enrollments/:id/withdraw
 * Withdraw student from group
 */
export const withdrawEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await enrollmentService.withdrawEnrollment(id, data);

    res.status(200).json({
      success: true,
      message: 'Student withdrawn successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Withdraw enrollment error:', error);
    
    if (error.message === 'Enrollment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to withdraw student'
    });
  }
};

/**
 * GET /api/students/:studentId/enrollments
 * Get all enrollments for a specific student
 */
export const getStudentEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const filters = {
      status: req.query.status as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await enrollmentService.getStudentEnrollments(studentId, filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch student enrollments'
    });
  }
};

/**
 * GET /api/groups/:groupId/enrollments
 * Get all enrollments for a specific group
 */
export const getGroupEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;
    const filters = {
      status: req.query.status as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 100
    };

    const result = await enrollmentService.getGroupEnrollments(groupId, filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get group enrollments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch group enrollments'
    });
  }
};

/**
 * GET /api/groups/:groupId/enrollments/stats
 * Get enrollment statistics for a group
 */
export const getGroupEnrollmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    const result = await enrollmentService.getGroupEnrollmentStats(groupId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get group enrollment stats error:', error);
    
    if (error.message === 'Group not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch enrollment statistics'
    });
  }
};

/**
 * DELETE /api/enrollments/:id
 * Delete enrollment
 */
export const deleteEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await enrollmentService.deleteEnrollment(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Delete enrollment error:', error);
    
    if (error.message === 'Enrollment not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('Cannot delete enrollment')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete enrollment'
    });
  }
};
