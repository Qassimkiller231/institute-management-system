// src/controllers/student.controller.ts
import { Request, Response } from 'express';
import * as studentService from '../services/student.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/students
 * Create new student
 */
export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    // Validation
    if (!data.cpr || !data.firstName || !data.dateOfBirth || !data.gender) {
      return res.status(400).json({
        success: false,
        message: 'CPR, first name, date of birth, and gender are required'
      });
    }

    const result = await studentService.createStudent(data);

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Create student error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create student'
    });
  }
};

/**
 * GET /api/students
 * Get all students with filters
 */
export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    // Common filters
    const baseFilters = {
      isActive: req.query.isActive === 'true' ? true :
        req.query.isActive === 'false' ? false : undefined,
      gender: req.query.gender as string,
      schoolType: req.query.schoolType as string,
      schoolYear: req.query.schoolYear as string,
      preferredCenter: req.query.preferredCenter as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
      needsSpeakingTest: req.query.needsSpeakingTest === 'true'
    };

    // Enrollment-based filters (for dashboard)
    const enrollmentFilters = {
      programId: req.query.programId as string | undefined,
      termId: req.query.termId as string | undefined,
      groupId: req.query.groupId as string | undefined,
      levelId: req.query.levelId as string | undefined,
      venueId: req.query.venueId as string | undefined,
      status: req.query.status as string | undefined,
      search: baseFilters.search,
      page: baseFilters.page,
      limit: baseFilters.limit
    };

    const hasEnrollmentFilter =
      enrollmentFilters.programId ||
      enrollmentFilters.termId ||
      enrollmentFilters.groupId ||
      enrollmentFilters.levelId ||
      enrollmentFilters.venueId ||
      enrollmentFilters.status;

    const result = hasEnrollmentFilter
      ? await studentService.getStudentsByEnrollmentFilters(enrollmentFilters)
      : await studentService.getAllStudents(baseFilters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch students'
    });
  }
};

/**
 * GET /api/students/:id
 * Get student by ID with full details
 */
export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Security: Students can only view their own data
    if (req.user?.role === 'STUDENT' && req.user?.studentId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const student = await studentService.getStudentById(id);

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error: any) {
    console.error('getStudentById error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get student'
    });
  }
};

/**
 * PUT /api/students/:id
 * Update student information
 */
export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Allow updating isActive for reactivation
    // Allow updating email, phone, cpr, and other student fields
    const result = await studentService.updateStudent(id, updates);

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update student error:', error);

    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update student'
    });
  }
};

/**
 * DELETE /api/students/:id
 * Deactivate student (soft delete)
 */
export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await studentService.deleteStudent(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Delete student error:', error);

    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete student'
    });
  }
};

/**
 * POST /api/students/:id/phones
 * Add phone number to student
 */

/**
 * POST /api/students/:id/parents
 * Link parent to student
 */
export const linkParent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!data.parentId) {
      return res.status(400).json({
        success: false,
        message: 'Parent ID is required'
      });
    }

    const result = await studentService.linkParent(id, data);

    res.status(201).json({
      success: true,
      message: 'Parent linked successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Link parent error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to link parent'
    });
  }
};

/**
 * GET /api/students/search
 * Search students by name, CPR, or email
 */
export const searchStudents = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await studentService.searchStudents(query, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Search students error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search students'
    });
  }
};
/**
 * POST /api/students/:id/profile-picture
 * Upload profile picture for student
 */
export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Security: Students can only upload their own picture, admins can upload for anyone
    if (req.user?.role === 'STUDENT' && req.user?.studentId !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload your own profile picture'
      });
    }

    // Update student with profile picture path
    const filePath = `/uploads/students/${req.file.filename}`;
    const result = await studentService.updateProfilePicture(id, filePath);

    return res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Upload profile picture error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload profile picture'
    });
  }
};

/**
 * DELETE /api/students/:id/profile-picture
 * Delete profile picture for student
 */
export const deleteProfilePicture = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Security: Students can only delete their own picture, admins can delete for anyone
    if (req.user?.role === 'STUDENT' && req.user?.studentId !== id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own profile picture'
      });
    }

    const result = await studentService.deleteProfilePicture(id);

    return res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Delete profile picture error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete profile picture'
    });
  }
};
