// src/controllers/session.controller.ts
import { Response } from 'express';
import * as sessionService from '../services/session.service';
import { AuthRequest } from '../types/auth.types';

/**
 * POST /api/sessions
 * Create a single class session
 */
export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.groupId || !data.sessionDate || !data.sessionNumber || !data.startTime || !data.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Group ID, session date, session number, start time, and end time are required'
      });
    }

    const result = await sessionService.createSession(data);

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create session'
    });
  }
};

/**
 * POST /api/sessions/bulk
 * Bulk create sessions
 */
export const bulkCreateSessions = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (!data.groupId || !data.sessions || !Array.isArray(data.sessions)) {
      return res.status(400).json({
        success: false,
        message: 'Group ID and sessions array are required'
      });
    }

    const result = await sessionService.bulkCreateSessions(data);

    res.status(201).json({
      success: true,
      message: `${result.created} sessions created successfully`,
      data: result
    });
  } catch (error: any) {
    console.error('Bulk create sessions error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create sessions'
    });
  }
};

/**
 * GET /api/sessions
 * Get all sessions with filters
 */
export const getAllSessions = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      groupId: req.query.groupId as string,
      status: req.query.status as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await sessionService.getAllSessions(filters);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('Get all sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sessions'
    });
  }
};

/**
 * GET /api/sessions/:id
 * Get session by ID
 */
export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await sessionService.getSessionById(id);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get session by ID error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch session'
    });
  }
};

/**
 * GET /api/sessions/group/:groupId
 * Get sessions by group
 */
export const getSessionsByGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.params;

    const result = await sessionService.getSessionsByGroup(groupId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Get sessions by group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sessions'
    });
  }
};

/**
 * PUT /api/sessions/:id
 * Update session
 */
export const updateSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await sessionService.updateSession(id, updates);

    res.status(200).json({
      success: true,
      message: 'Session updated successfully',
      data: result
    });
  } catch (error: any) {
    console.error('Update session error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update session'
    });
  }
};

/**
 * PATCH /api/sessions/:id/complete
 * Mark session as completed
 */
export const completeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await sessionService.completeSession(id);

    res.status(200).json({
      success: true,
      message: 'Session marked as completed',
      data: result
    });
  } catch (error: any) {
    console.error('Complete session error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to complete session'
    });
  }
};

/**
 * PATCH /api/sessions/:id/cancel
 * Cancel session
 */
export const cancelSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await sessionService.cancelSession(id, reason);

    res.status(200).json({
      success: true,
      message: 'Session cancelled',
      data: result
    });
  } catch (error: any) {
    console.error('Cancel session error:', error);
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel session'
    });
  }
};