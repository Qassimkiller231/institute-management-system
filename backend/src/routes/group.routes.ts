// src/routes/group.routes.ts
import { Router } from 'express';
import * as groupController from '../controllers/group.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== GROUP ROUTES ====================

// Create a new group (Admin only)
router.post('/', requireAdmin, groupController.createGroup);

// Get all groups with filters (Teacher or Admin)
router.get('/', requireTeacherOrAdmin, groupController.getAllGroups);

// Get single group by ID (Teacher or Admin)
router.get('/:id', requireTeacherOrAdmin, groupController.getGroupById);

// Update group (Admin only)
router.put('/:id', requireAdmin, groupController.updateGroup);

// Assign teacher to group (Admin only)
router.patch('/:id/assign-teacher', requireAdmin, groupController.assignTeacher);

// Update group schedule (Admin only)
router.patch('/:id/schedule', requireAdmin, groupController.updateSchedule);

// Deactivate group (Admin only)
router.delete('/:id', requireAdmin, groupController.deleteGroup);

// ==================== CLASS SESSION ROUTES ====================

// Create a single class session (Admin only)
router.post('/sessions', requireAdmin, groupController.createClassSession);

// Bulk create class sessions (Admin only)
router.post('/sessions/bulk', requireAdmin, groupController.bulkCreateSessions);

// Get all sessions for a group (Teacher or Admin)
router.get('/:groupId/sessions', requireTeacherOrAdmin, groupController.getSessionsByGroup);

// Update a class session (Admin only)
router.put('/sessions/:id', requireAdmin, groupController.updateClassSession);

// Mark session as completed (Teacher or Admin)
router.patch('/sessions/:id/complete', requireTeacherOrAdmin, groupController.completeSession);

// Cancel a class session (Admin only)
router.patch('/sessions/:id/cancel', requireAdmin, groupController.cancelSession);

// ==================== SCHEDULE MANAGEMENT ROUTES ====================

// Check for schedule conflicts (Admin only)
router.get('/schedules/conflicts', requireAdmin, groupController.checkScheduleConflicts);

export default router;
