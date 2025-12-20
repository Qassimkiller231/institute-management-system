// src/controllers/venue.controller.ts
import { Response } from 'express';
import * as venueService from '../services/venue.service';
import { AuthRequest } from '../types/auth.types';

export const createVenue = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const result = await venueService.createVenue(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/venues - Get all venues
export const getAllVenues = async (req: AuthRequest, res: Response) => {
  try {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const filters = { isActive };
    const result = await venueService.getAllVenues(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVenueById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await venueService.getVenueById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Venue not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateVenue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await venueService.updateVenue(id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Venue not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteVenue = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await venueService.deleteVenue(id);
    res.status(200).json({ success: true, message: 'Venue deleted successfully' });
  } catch (error: any) {
    const status = error.message === 'Venue not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};