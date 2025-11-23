// src/routes/program.routes.ts
import express from 'express';
import * as programController from '../controllers/program.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication

// ==================== PROGRAMS ====================
// Admin only for create/update/delete
router.post('/',authenticate, requireAdmin, programController.createProgram);
router.put('/:id',authenticate, requireAdmin, programController.updateProgram);
router.delete('/:id',authenticate, requireAdmin, programController.deleteProgram);

// Anyone can view
router.get('/', programController.getAllPrograms);
router.get('/:id', programController.getProgramById);


export default router;
