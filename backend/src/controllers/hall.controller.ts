// src/controllers/hall.controller.ts
import { Response } from 'express';
import * as hallService from '../services/hall.service';
import { AuthRequest } from '../types/auth.types';

export const createHall = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const result = await hallService.createHall(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// hall.controller.ts - Fix getAllHalls (expects object)
export const getAllHalls = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      venueId: req.query.venueId as string | undefined
    };
    const result = await hallService.getAllHalls(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHallById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await hallService.getHallById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Hall not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateHall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await hallService.updateHall(id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Hall not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

// hall.controller.ts - Fix deleteHall
export const deleteHall = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await hallService.deleteHall(id);  // Doesn't return message
    res.status(200).json({ success: true, message: 'Hall deleted successfully' });
  } catch (error: any) {
    const status = error.message === 'Hall not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};