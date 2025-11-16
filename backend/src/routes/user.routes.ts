import express from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get('/', authenticate, requireAdmin, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get specific user
 * @access  Private (Own profile or Admin)
 */
router.get('/:id', authenticate, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user information
 * @access  Private (Own profile or Admin)
 */
router.put('/:id', authenticate, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Deactivate user
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Change user role
 * @access  Private (Admin only)
 */
router.patch('/:id/role', authenticate, requireAdmin, userController.changeUserRole);

export default router;
