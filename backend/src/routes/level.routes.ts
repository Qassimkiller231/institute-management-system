// src/routes/level.routes.ts
import express from 'express';
import * as levelController from '../controllers/level.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update
router.post('/', requireAdmin, levelController.createLevel);
router.put('/:id', requireAdmin, levelController.updateLevel);

// Anyone can view
router.get('/', levelController.getAllLevels);
router.get('/:id', levelController.getLevelById);

export default router;