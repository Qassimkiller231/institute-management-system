// src/routes/term.routes.ts
import express from 'express';
import * as termController from '../controllers/term.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update/delete
router.post('/', requireAdmin, termController.createTerm);
router.put('/:id', requireAdmin, termController.updateTerm);
router.delete('/:id', requireAdmin, termController.deleteTerm);

// Anyone can view
router.get('/', termController.getAllTerms);
router.get('/:id', termController.getTermById);

export default router;