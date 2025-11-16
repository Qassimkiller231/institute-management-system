// src/controllers/group.controller.ts
import { Request, Response } from 'express';
import * as groupService from '../services/group.service';

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

// ==================== CLASS SESSIONS ====================

export const createClassSession = async (req: Request, res: Response) => {
  try {
    const {
      groupId,
      hallId,
      sessionNumber,
      sessionDate,
      startTime,
      endTime,
      topic
    } = req.body;

    if (!groupId || !sessionNumber || !sessionDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, session number, date, and times are required'
      });
    }

    const session = await groupService.createClassSession({
      groupId,
      hallId,
      sessionNumber,
      sessionDate,
      startTime,
      endTime,
      topic
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const bulkCreateSessions = async (req: Request, res: Response) => {
  try {
    const {
      groupId,
      hallId,
      startDate,
      schedule,
      totalSessions
    } = req.body;

    if (!groupId || !startDate || !schedule || !totalSessions) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, start date, schedule, and total sessions are required'
      });
    }

    const result = await groupService.bulkCreateSessions({
      groupId,
      hallId,
      startDate,
      schedule,
      totalSessions
    });

    res.status(201).json({
      success: true,
      message: `${result.totalCreated} sessions created successfully`,
      data: {
        groupId,
        totalCreated: result.totalCreated,
        firstSession: result.firstSession,
        lastSession: result.lastSession
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSessionsByGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 100;

    const sessions = await groupService.getSessionsByGroup(groupId, {
      status,
      limit
    });

    res.json({
      success: true,
      data: sessions,
      total: sessions.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

export const updateClassSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const session = await groupService.updateClassSession(id, updates);

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: session
    });
  } catch (error: any) {
    const status = error.message === 'Class session not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const completeSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { topic } = req.body;

    await groupService.completeSession(id, topic);

    res.json({
      success: true,
      message: 'Session marked as completed'
    });
  } catch (error: any) {
    const status = error.message === 'Class session not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const cancelSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    if (!cancellationReason) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required'
      });
    }

    await groupService.cancelSession(id, cancellationReason);

    res.json({
      success: true,
      message: 'Session cancelled successfully'
    });
  } catch (error: any) {
    const status = error.message === 'Class session not found' ? 404 : 400;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

// ==================== SCHEDULE MANAGEMENT ====================

export const checkScheduleConflicts = async (req: Request, res: Response) => {
  try {
    const { venueId, date, startTime, endTime, excludeGroupId } = req.query;

    if (!venueId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Venue ID, date, start time, and end time are required'
      });
    }

    const result = await groupService.checkScheduleConflicts(
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
