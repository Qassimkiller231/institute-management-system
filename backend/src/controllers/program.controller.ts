// src/controllers/program.controller.ts
import { Request, Response } from 'express';
import * as programService from '../services/program.service';
import * as termService from '../services/term.service';
import * as levelService from '../services/level.service';
import * as venueService from '../services/venue.service';
import * as hallService from '../services/hall.service';

// ==================== PROGRAMS ====================

export const createProgram = async (req: Request, res: Response) => {
  try {
    const { name, code, description, minAge, maxAge } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    const program = await programService.createProgram({
      name,
      code,
      description,
      minAge,
      maxAge
    });

    res.status(201).json({
      success: true,
      data: program
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllPrograms = async (req: Request, res: Response) => {
  try {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await programService.getAllPrograms({
      isActive,
      page,
      limit
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programs'
    });
  }
};

export const getProgramById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const program = await programService.getProgramById(id);

    res.json({
      success: true,
      data: program
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const program = await programService.updateProgram(id, updates);

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program
    });
  } catch (error: any) {
    const status = error.message === 'Program not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await programService.deleteProgram(id);

    res.json({
      success: true,
      message: 'Program deactivated successfully'
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== TERMS ====================

export const createTerm = async (req: Request, res: Response) => {
  try {
    const { programId, name, startDate, endDate, isCurrent } = req.body;

    if (!programId || !name || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Program ID, name, start date, and end date are required'
      });
    }

    const term = await termService.createTerm({
      programId,
      name,
      startDate,
      endDate,
      isCurrent
    });

    res.status(201).json({
      success: true,
      data: term
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllTerms = async (req: Request, res: Response) => {
  try {
    const programId = req.query.programId as string;
    const isCurrent = req.query.isCurrent === 'true' ? true : req.query.isCurrent === 'false' ? false : undefined;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await termService.getAllTerms({
      programId,
      isCurrent,
      isActive,
      page,
      limit
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms'
    });
  }
};

export const getTermById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const term = await termService.getTermById(id);

    res.json({
      success: true,
      data: term
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateTerm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const term = await termService.updateTerm(id, updates);

    res.json({
      success: true,
      message: 'Term updated successfully',
      data: term
    });
  } catch (error: any) {
    const status = error.message === 'Term not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== LEVELS ====================

export const createLevel = async (req: Request, res: Response) => {
  try {
    const { name, displayName, orderNumber, description, isMixed, mixedLevels } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Level name is required'
      });
    }

    const level = await levelService.createLevel({
      name,
      displayName,
      orderNumber,
      description,
      isMixed,
      mixedLevels
    });

    res.status(201).json({
      success: true,
      data: level
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllLevels = async (req: Request, res: Response) => {
  try {
    const levels = await levelService.getAllLevels();

    res.json({
      success: true,
      data: levels
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch levels'
    });
  }
};

export const getLevelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const level = await levelService.getLevelById(id);

    res.json({
      success: true,
      data: level
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateLevel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const level = await levelService.updateLevel(id, updates);

    res.json({
      success: true,
      message: 'Level updated successfully',
      data: level
    });
  } catch (error: any) {
    const status = error.message === 'Level not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== VENUES ====================

export const createVenue = async (req: Request, res: Response) => {
  try {
    const { name, code, address } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    const venue = await venueService.createVenue({
      name,
      code,
      address
    });

    res.status(201).json({
      success: true,
      data: venue
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllVenues = async (req: Request, res: Response) => {
  try {
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const venues = await venueService.getAllVenues({ isActive });

    res.json({
      success: true,
      data: venues
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch venues'
    });
  }
};

export const getVenueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const venue = await venueService.getVenueById(id);

    res.json({
      success: true,
      data: venue
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const venue = await venueService.updateVenue(id, updates);

    res.json({
      success: true,
      message: 'Venue updated successfully',
      data: venue
    });
  } catch (error: any) {
    const status = error.message === 'Venue not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== HALLS ====================

export const createHall = async (req: Request, res: Response) => {
  try {
    const { venueId, name, code, capacity, floor } = req.body;

    if (!venueId || !name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Venue ID, name, and code are required'
      });
    }

    const hall = await hallService.createHall({
      venueId,
      name,
      code,
      capacity,
      floor
    });

    res.status(201).json({
      success: true,
      data: hall
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllHalls = async (req: Request, res: Response) => {
  try {
    const venueId = req.query.venueId as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

    const halls = await hallService.getAllHalls({
      venueId,
      isActive
    });

    res.json({
      success: true,
      data: halls
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch halls'
    });
  }
};

export const getHallById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hall = await hallService.getHallById(id);

    res.json({
      success: true,
      data: hall
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateHall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const hall = await hallService.updateHall(id, updates);

    res.json({
      success: true,
      message: 'Hall updated successfully',
      data: hall
    });
  } catch (error: any) {
    const status = error.message === 'Hall not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteHall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await hallService.deleteHall(id);

    res.json({
      success: true,
      message: 'Hall deactivated successfully'
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
