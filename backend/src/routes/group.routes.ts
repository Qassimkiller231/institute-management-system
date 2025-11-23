// src/routes/group.routes.ts
import { Router } from 'express';
import * as groupController from '../controllers/group.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';
import * as enrollmentController from '../controllers/enrollment.controller';

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


router.get('/:groupId/enrollments', requireTeacherOrAdmin, enrollmentController.getGroupEnrollments);
router.get('/:groupId/enrollments/stats', requireTeacherOrAdmin, enrollmentController.getGroupEnrollmentStats);
// ==================== SCHEDULE ROUTES ====================

// Check schedule conflicts (Admin only)
router.get('/schedules/conflicts', requireAdmin, groupController.checkScheduleConflictsController);

export default router;