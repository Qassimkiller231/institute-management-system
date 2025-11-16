import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { Role } from '../types/auth.types';

/**
 * GET /api/users
 * Get all users with filters
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, isActive, search, limit, page } = req.query;

    const filters = {
      role: role as Role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page ? parseInt(page as string) : undefined,
    };

    const result = await userService.getAllUsers(filters);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users',
    });
  }
};

/**
 * GET /api/users/:id
 * Get specific user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id);
    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to fetch user',
    });
  }
};

/**
 * PUT /api/users/:id
 * Update user information
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, phone, isActive } = req.body;

    const result = await userService.updateUser(id, {
      email,
      phone,
      isActive,
    });

    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === 'User not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update user',
    });
  }
};

/**
 * DELETE /api/users/:id
 * Deactivate user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUser(id);
    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete user',
    });
  }
};

/**
 * PATCH /api/users/:id/role
 * Change user role (Admin only)
 */
export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, TEACHER, STUDENT, or PARENT',
      });
    }

    const result = await userService.changeUserRole(id, role as Role);
    res.status(200).json(result);
  } catch (error: any) {
    const statusCode = error.message === 'User not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to change user role',
    });
  }
};
