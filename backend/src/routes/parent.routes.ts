// src/routes/parent.routes.ts
import express from 'express';
import * as parentController from '../controllers/parent.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Search parents (must come before /:id)
router.get('/search', requireTeacherOrAdmin, parentController.searchParents);

// Admin only for create/update/delete
router.post('/', requireAdmin, parentController.createParent);
router.put('/:id', requireAdmin, parentController.updateParent);
router.delete('/:id', requireAdmin, parentController.deleteParent);

// Link student to parent
router.post('/:id/link-student', requireAdmin, parentController.linkStudent);

// Admin or Teacher can view parents
router.get('/', requireTeacherOrAdmin, parentController.getAllParents);
router.get('/:id', requireTeacherOrAdmin, parentController.getParentById);

export default router;