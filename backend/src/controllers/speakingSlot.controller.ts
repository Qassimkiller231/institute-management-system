// src/controllers/speakingSlot.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import {
  getAvailableSpeakingSlots,
  getAllSpeakingSlots,
  bookSpeakingSlot,
  submitSpeakingResult,
  listSpeakingSlotsForTeacher, cancelSpeakingSlot
} from '../services/speakingSlot.service';

/**
 * GET /api/speaking-slots
 * Get ALL speaking slots (for admin)
 */
export const getAllSlots = async (req: AuthRequest, res: Response) => {
  try {
    const slots = await getAllSpeakingSlots();

    return res.status(200).json({
      success: true,
      total: slots.length,
      data: slots
    });
  } catch (error: any) {
    console.error('getAllSlots error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch all slots'
    });
  }
};

/**
 * GET /api/speaking-slots/available
 * Get available speaking slots (optional date range)
 */
export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filters: { startDate?: Date; endDate?: Date } = {};

    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const slots = await getAvailableSpeakingSlots(filters);

    return res.status(200).json({
      success: true,
      total: slots.length,
      data: slots
    });
  } catch (error: any) {
    console.error('getAvailableSlots error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch available slots'
    });
  }
};

/**
 * GET /api/speaking-slots/teacher/:teacherId
 * List all speaking slots for a teacher
 */
export const getSlotsForTeacher = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        success: false,
        message: 'teacherId is required'
      });
    }

    const slots = await listSpeakingSlotsForTeacher(teacherId);

    return res.status(200).json({
      success: true,
      total: slots.length,
      data: slots
    });
  } catch (error: any) {
    console.error('getSlotsForTeacher error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch teacher slots'
    });
  }
};

/**
 * POST /api/speaking-slots/book
 * Book a speaking slot for a test session
 */
export const bookSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId, slotId, studentId } = req.body;

    if (!sessionId || !slotId || !studentId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId, slotId and studentId are required'
      });
    }

    const result = await bookSpeakingSlot({ sessionId, slotId, studentId });

    return res.status(200).json({
      success: true,
      message: 'Slot booked successfully',
      data: result
    });
  } catch (error: any) {
    console.error('bookSlot error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to book speaking slot'
    });
  }
};

/**
 * POST /api/speaking-slots/submit-result
 * Submit speaking test result for a booked slot
 */
export const submitResult = async (req: AuthRequest, res: Response) => {
  try {
    const {
      sessionId,
      slotId,
      mcqLevel,
      speakingLevel,
      finalLevel,
      feedback
    } = req.body;

    if (!sessionId || !slotId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and slotId are required'
      });
    }

    if (!mcqLevel || !speakingLevel || !finalLevel) {
      return res.status(400).json({
        success: false,
        message: 'mcqLevel, speakingLevel, and finalLevel are required'
      });
    }

    const result = await submitSpeakingResult({
      sessionId,
      slotId,
      mcqLevel,
      speakingLevel,
      finalLevel,
      feedback
    });

    return res.status(200).json({
      success: true,
      message: 'Speaking result submitted successfully',
      data: result
    });
  } catch (error: any) {
    console.error('submitResult error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit speaking result'
    });
  }
};
/**
 * PUT /api/speaking-slots/:id/cancel
 * Cancel a booked speaking slot
 */

export const cancelSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // slotId
    const { sessionId } = req.body;

    // Validate inputs
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    // Call service function
    const updatedSlot = await cancelSpeakingSlot(id, sessionId);

    return res.status(200).json({
      success: true,
      message: 'Speaking slot cancelled successfully',
      data: updatedSlot
    });
  } catch (error: any) {
    console.error('cancelSlot error:', error);

    // Handle specific errors
    if (error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message?.includes('Access denied')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel slot'
    });
  }
};
