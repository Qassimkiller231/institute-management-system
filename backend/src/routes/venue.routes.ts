// src/routes/venue.routes.ts
import express from 'express';
import * as venueController from '../controllers/venue.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only for create/update
router.post('/', requireAdmin, venueController.createVenue);
router.put('/:id', requireAdmin, venueController.updateVenue);

// Anyone can view
router.get('/', venueController.getAllVenues);
router.get('/:id', venueController.getVenueById);

export default router;