// src/controllers/phone.controller.ts
import { Response } from 'express';
import * as phoneService from '../services/phone.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/phones
 * Add new phone number
 */
export const addPhone = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.phoneNumber || !data.ownerId || !data.ownerType) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, owner ID, and owner type are required'
      });
    }

    if (data.ownerType !== 'PARENT' && data.ownerType !== 'STUDENT') {
      return res.status(400).json({
        success: false,
        message: 'Owner type must be PARENT or STUDENT'
      });
    }

    const result = await phoneService.addPhone(data);

    res.status(201).json({
      success: true,
      message: 'Phone added successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Add phone error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add phone'
    });
  }
};

/**
 * GET /api/phones
 * Get all phones with filters
 */
export const getAllPhones = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      isActive: req.query.isActive === 'true' ? true : 
                req.query.isActive === 'false' ? false : undefined,
      isPrimary: req.query.isPrimary === 'true' ? true : 
                 req.query.isPrimary === 'false' ? false : undefined,
      parentId: req.query.parentId as string,
      studentId: req.query.studentId as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await phoneService.getAllPhones(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all phones error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch phones'
    });
  }
};

/**
 * GET /api/phones/:id
 * Get phone by ID
 */
export const getPhoneById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await phoneService.getPhoneById(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get phone by ID error:', error);
    
    if (error.message === 'Phone not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch phone'
    });
  }
};

/**
 * PUT /api/phones/:id
 * Update phone
 */
export const updatePhone = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await phoneService.updatePhone(id, updates);

    res.status(200).json({
      success: true,
      message: 'Phone updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update phone error:', error);
    
    if (error.message === 'Phone not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update phone'
    });
  }
};

/**
 * DELETE /api/phones/:id
 * Delete phone (soft delete)
 */
export const deletePhone = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await phoneService.deletePhone(id);

    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Delete phone error:', error);
    
    if (error.message === 'Phone not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete phone'
    });
  }
};