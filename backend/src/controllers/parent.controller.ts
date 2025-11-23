// src/controllers/parent.controller.ts
import { Response } from 'express';
import * as parentService from '../services/parent.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/parents
 * Create new parent
 */
export const createParent = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.firstName || !data.lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const result = await parentService.createParent(data);

    res.status(201).json({
      success: true,
      message: 'Parent created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Create parent error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create parent'
    });
  }
};

/**
 * GET /api/parents
 * Get all parents with filters
 */
export const getAllParents = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true : 
                req.query.isActive === 'false' ? false : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await parentService.getAllParents(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all parents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch parents'
    });
  }
};

/**
 * GET /api/parents/:id
 * Get parent by ID with full details
 */
export const getParentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await parentService.getParentById(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get parent by ID error:', error);
    
    if (error.message === 'Parent not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch parent'
    });
  }
};

/**
 * PUT /api/parents/:id
 * Update parent information
 */
export const updateParent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await parentService.updateParent(id, updates);

    res.status(200).json({
      success: true,
      message: 'Parent updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update parent error:', error);
    
    if (error.message === 'Parent not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update parent'
    });
  }
};

/**
 * DELETE /api/parents/:id
 * Deactivate parent (soft delete)
 */
export const deleteParent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await parentService.deleteParent(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Delete parent error:', error);
    
    if (error.message === 'Parent not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete parent'
    });
  }
};

/**
 * POST /api/parents/:id/link-student
 * Link student to parent
 */
export const linkStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!data.studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const result = await parentService.linkStudent(id, data);

    res.status(201).json({
      success: true,
      message: 'Student linked to parent successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Link student error:', error);
    
    if (error.message === 'Parent not found' || error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to link student'
    });
  }
};

/**
 * GET /api/parents/search
 * Search parents by name or email
 */
export const searchParents = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await parentService.searchParents(query, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Search parents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to search parents'
    });
  }
};