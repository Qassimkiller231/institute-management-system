// src/controllers/level.controller.ts
import { Response } from 'express';
import * as levelService from '../services/level.service';
import { AuthRequest } from '../types/auth.types';

export const createLevel = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const result = await levelService.createLevel(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// level.controller.ts - Fix getAllLevels
export const getAllLevels = async (req: AuthRequest, res: Response) => {
  try {
    const result = await levelService.getAllLevels();  // No parameter
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await levelService.getLevelById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Level not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await levelService.updateLevel(id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Level not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteLevel = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await levelService.deleteLevel(id);
    res.status(200).json({ success: true, message: 'Level deleted successfully' });
  } catch (error: any) {
    const status = error.message === 'Level not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};