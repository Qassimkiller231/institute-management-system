import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import materialService from '../services/material.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MaterialController {
  // Create new material
  async createMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { groupId, title, description, materialType, fileUrl, fileSizeKb, scheduledFor, publishNow } = req.body;

      if (!groupId || !title || !materialType) {
        res.status(400).json({
          success: false,
          message: 'groupId, title, and materialType are required'
        });
        return;
      }

      const validTypes = ['PDF', 'VIDEO', 'LINK', 'IMAGE', 'OTHER'];
      if (!validTypes.includes(materialType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid materialType. Must be PDF, VIDEO, LINK, IMAGE, or OTHER'
        });
        return;
      }

      // Get teacher ID
      let uploadedBy: string | undefined;

      if (req.user!.role === 'TEACHER') {
        const teacher = await prisma.teacher.findUnique({
          where: { userId: req.user!.userId }
        });

        if (!teacher) {
          res.status(403).json({
            success: false,
            message: 'Teacher record not found'
          });
          return;
        }
        uploadedBy = teacher.id;
      } else if (req.user!.role === 'ADMIN') {
        // Admin can optionally provide teacherId, otherwise uploadedBy is undefined
        uploadedBy = req.body.teacherId;
      } else {
        res.status(403).json({
          success: false,
          message: 'Only teachers and admins can upload materials'
        });
        return;
      }

      const material = await materialService.createMaterial({
        groupId,
        title,
        description,
        materialType,
        fileUrl,
        fileSizeKb,
        uploadedBy,
        scheduledFor,
        publishNow,
        performedBy: req.user!.userId
      });

      res.status(201).json({
        success: true,
        message: 'Material created successfully',
        data: material
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create material'
      });
    }
  }

  // Get all materials for a group
  // Get all materials for a specific group
  async getGroupMaterials(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;
      const { materialType, isActive } = req.query;

      // Authorization check for students
      if (req.user!.role === 'STUDENT') {
        // Verify student is enrolled in this group
        const student = await prisma.student.findUnique({
          where: { userId: req.user!.userId },
          include: {
            enrollments: {
              where: {
                groupId: groupId,
                status: 'ACTIVE'
              }
            }
          }
        });

        if (!student || student.enrollments.length === 0) {
          res.status(403).json({
            success: false,
            message: 'Access denied. You are not enrolled in this group.'
          });
          return;
        }
      }
      // Teachers and admins can access any group (no additional check needed)

      const filters: any = {};
      if (materialType) filters.materialType = materialType as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const materials = await materialService.getGroupMaterials(groupId, filters);

      res.status(200).json({
        success: true,
        count: materials.length,
        data: materials
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get materials'
      });
    }
  }

  // Get all materials with filters and pagination
  async getAllMaterials(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        groupId,
        materialType,
        uploadedBy,
        isActive,
        page,
        limit
      } = req.query;

      const filters: any = {};
      if (groupId) filters.groupId = groupId as string;
      if (materialType) filters.materialType = materialType as string;
      if (uploadedBy) filters.uploadedBy = uploadedBy as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (page) filters.page = parseInt(page as string);
      if (limit) filters.limit = parseInt(limit as string);

      const result = await materialService.getAllMaterials(filters);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to get materials'
      });
    }
  }

  // Get material by ID
  async getMaterialById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const material = await materialService.getMaterialById(id);

      res.status(200).json({
        success: true,
        data: material
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update material
  async updateMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, materialType, fileUrl, fileSizeKb } = req.body;

      if (materialType) {
        const validTypes = ['PDF', 'VIDEO', 'LINK', 'IMAGE', 'OTHER'];
        if (!validTypes.includes(materialType)) {
          res.status(400).json({
            success: false,
            message: 'Invalid materialType. Must be PDF, VIDEO, LINK, IMAGE, or OTHER'
          });
          return;
        }
      }

      const material = await materialService.updateMaterial(id, {
        title,
        description,
        materialType,
        fileUrl,
        fileSizeKb
      });

      res.status(200).json({
        success: true,
        message: 'Material updated successfully',
        data: material
      });
    } catch (error: any) {
      const status = error.message === 'Material not found' ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete material (soft delete)
  async deleteMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await materialService.deleteMaterial(id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Material deleted successfully'
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Permanently delete material (hard delete - admin only)
  async permanentlyDeleteMaterial(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await materialService.permanentlyDeleteMaterial(id, req.user!.userId);

      res.status(200).json({
        success: true,
        message: 'Material permanently deleted'
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get materials by type
  async getMaterialsByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;

      const validTypes = ['PDF', 'VIDEO', 'LINK', 'IMAGE', 'OTHER'];
      if (!validTypes.includes(type.toUpperCase())) {
        res.status(400).json({
          success: false,
          message: 'Invalid material type'
        });
        return;
      }

      const materials = await materialService.getMaterialsByType(type.toUpperCase() as any);

      res.status(200).json({
        success: true,
        count: materials.length,
        data: materials
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get materials uploaded by a teacher
  async getTeacherMaterials(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { teacherId } = req.params;

      const materials = await materialService.getTeacherMaterials(teacherId);

      res.status(200).json({
        success: true,
        count: materials.length,
        data: materials
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // Get material statistics for a group
  async getGroupMaterialStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;

      const stats = await materialService.getGroupMaterialStats(groupId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new MaterialController();
