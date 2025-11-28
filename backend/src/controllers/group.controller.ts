// src/controllers/group.controller.ts
import { Request, Response } from 'express';
import * as groupService from '../services/group.service';
import { checkScheduleConflicts as checkConflicts } from '../utils/schedule';

// ==================== GROUPS ====================

export const createGroup = async (req: Request, res: Response) => {
  try {
    const {
      termId,
      levelId,
      teacherId,
      venueId,
      groupCode,
      name,
      schedule,
      capacity
    } = req.body;

    if (!termId || !levelId || !groupCode) {
      return res.status(400).json({
        success: false,
        message: 'Term ID, level ID, and group code are required'
      });
    }
    
    

    const group = await groupService.createGroup({
      termId,
      levelId,
      teacherId,
      venueId,
      groupCode,
      name,
      schedule,
      capacity
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllGroups = async (req: Request, res: Response) => {
  try {
    const termId = req.query.termId as string;
    const levelId = req.query.levelId as string;
    const teacherId = req.query.teacherId as string;
    const venueId = req.query.venueId as string;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await groupService.getAllGroups({
      termId,
      levelId,
      teacherId,
      venueId,
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
      message: 'Failed to fetch groups'
    });
  }
};

export const getGroupById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const group = await groupService.getGroupById(id);

    res.json({
      success: true,
      data: group
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const group = await groupService.updateGroup(id, updates);

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error: any) {
    const status = error.message === 'Group not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const assignTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    await groupService.assignTeacher(id, teacherId);

    res.json({
      success: true,
      message: 'Teacher assigned successfully'
    });
  } catch (error: any) {
    const status = error.message === 'Group not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { schedule } = req.body;

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message: 'Schedule is required'
      });
    }

    await groupService.updateSchedule(id, schedule);

    res.json({
      success: true,
      message: 'Schedule updated successfully'
    });
  } catch (error: any) {
    const status = error.message === 'Group not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await groupService.deleteGroup(id);

    res.json({
      success: true,
      message: 'Group deactivated successfully'
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== SCHEDULE MANAGEMENT ====================

export const checkScheduleConflictsController = async (req: Request, res: Response) => {
  try {
    const { venueId, date, startTime, endTime, excludeGroupId } = req.query;

    if (!venueId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Venue ID, date, start time, and end time are required'
      });
    }

    const result = await checkConflicts(
      venueId as string,
      date as string,
      startTime as string,
      endTime as string,
      excludeGroupId as string
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check conflicts'
    });
  }
};