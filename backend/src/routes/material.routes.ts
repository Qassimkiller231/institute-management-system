import { Router } from 'express';
import materialController from '../controllers/material.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new material (Teacher or Admin only)
router.post(
  '/',
  requireTeacherOrAdmin,
  materialController.createMaterial
);

// Get all materials with filters and pagination (Teacher or Admin only)
router.get(
  '/',
  requireTeacherOrAdmin,
  materialController.getAllMaterials
);

// Get material by ID (Teacher or Admin only)
router.get(
  '/:id',
  requireTeacherOrAdmin,
  materialController.getMaterialById
);

// Update material (Teacher or Admin only)
router.put(
  '/:id',
  requireTeacherOrAdmin,
  materialController.updateMaterial
);

// Delete material - soft delete (Teacher or Admin only)
router.delete(
  '/:id',
  requireTeacherOrAdmin,
  materialController.deleteMaterial
);

// Permanently delete material - hard delete (Admin only)
router.delete(
  '/:id/permanent',
  requireAdmin,
  materialController.permanentlyDeleteMaterial
);

// Get all materials for a specific group (Teacher or Admin only)
router.get(
  '/group/:groupId',
  requireTeacherOrAdmin,
  materialController.getGroupMaterials
);

// Get material statistics for a group (Teacher or Admin only)
router.get(
  '/group/:groupId/stats',
  requireTeacherOrAdmin,
  materialController.getGroupMaterialStats
);

// Get materials by type (Teacher or Admin only)
router.get(
  '/type/:type',
  requireTeacherOrAdmin,
  materialController.getMaterialsByType
);

// Get materials uploaded by a specific teacher (Teacher or Admin only)
router.get(
  '/teacher/:teacherId',
  requireTeacherOrAdmin,
  materialController.getTeacherMaterials
);

export default router;
