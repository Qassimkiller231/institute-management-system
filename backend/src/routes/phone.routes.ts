// src/routes/phone.routes.ts
import express from 'express';
import * as phoneController from '../controllers/phone.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireTeacherOrAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update/delete
router.post('/', requireAdmin, phoneController.addPhone);
router.put('/:id', requireAdmin, phoneController.updatePhone);
router.delete('/:id', requireAdmin, phoneController.deletePhone);

// Admin or Teacher can view phones
router.get('/', requireTeacherOrAdmin, phoneController.getAllPhones);
router.get('/:id', requireTeacherOrAdmin, phoneController.getPhoneById);

export default router;