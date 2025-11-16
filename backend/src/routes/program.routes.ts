// src/routes/program.routes.ts
import express from 'express';
import * as programController from '../controllers/program.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ==================== PROGRAMS ====================
// Admin only for create/update/delete
router.post('/programs', requireAdmin, programController.createProgram);
router.put('/programs/:id', requireAdmin, programController.updateProgram);
router.delete('/programs/:id', requireAdmin, programController.deleteProgram);

// Anyone can view
router.get('/programs', programController.getAllPrograms);
router.get('/programs/:id', programController.getProgramById);

// ==================== TERMS ====================
// Admin only for create/update
router.post('/terms', requireAdmin, programController.createTerm);
router.put('/terms/:id', requireAdmin, programController.updateTerm);

// Anyone can view
router.get('/terms', programController.getAllTerms);
router.get('/terms/:id', programController.getTermById);

// ==================== LEVELS ====================
// Admin only for create/update
router.post('/levels', requireAdmin, programController.createLevel);
router.put('/levels/:id', requireAdmin, programController.updateLevel);

// Anyone can view
router.get('/levels', programController.getAllLevels);
router.get('/levels/:id', programController.getLevelById);

// ==================== VENUES ====================
// Admin only for create/update
router.post('/venues', requireAdmin, programController.createVenue);
router.put('/venues/:id', requireAdmin, programController.updateVenue);

// Anyone can view
router.get('/venues', programController.getAllVenues);
router.get('/venues/:id', programController.getVenueById);

// ==================== HALLS ====================
// Admin only for create/update/delete
router.post('/halls', requireAdmin, programController.createHall);
router.put('/halls/:id', requireAdmin, programController.updateHall);
router.delete('/halls/:id', requireAdmin, programController.deleteHall);

// Anyone can view
router.get('/halls', programController.getAllHalls);
router.get('/halls/:id', programController.getHallById);

export default router;
