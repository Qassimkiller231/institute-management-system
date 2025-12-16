// src/controllers/term.controller.ts
import { Response } from 'express';
import * as termService from '../services/term.service';
import { AuthRequest } from '../types/auth.types';

export const createTerm = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    const result = await termService.createTerm(data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllTerms = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      programId: req.query.programId as string,
      isCurrent: req.query.isCurrent === 'true' ? true : undefined,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    };
    console.log("filters", filters);
    const result = await termService.getAllTerms(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTermById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await termService.getTermById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Term not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const updateTerm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await termService.updateTerm(id, updates);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Term not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const deleteTerm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await termService.deleteTerm(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Term not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Set term as current (exclusive per program)
export const setCurrentTerm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await termService.setCurrentTerm(id);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    const status = error.message === 'Term not found' ? 404 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};