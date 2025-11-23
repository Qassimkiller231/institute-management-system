// src/routes/hall.routes.ts
import express from 'express';
import * as hallController from '../controllers/hall.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update/delete
router.post('/', requireAdmin, hallController.createHall);
router.put('/:id', requireAdmin, hallController.updateHall);
router.delete('/:id', requireAdmin, hallController.deleteHall);

// Anyone can view
router.get('/', hallController.getAllHalls);
router.get('/:id', hallController.getHallById);

export default router;