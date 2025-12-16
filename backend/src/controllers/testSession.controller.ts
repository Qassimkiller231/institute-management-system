// src/controllers/testSession.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as testSessionService from '../services/testSession.service';

/**
 * POST /api/test-sessions/start
 * Start a new test session for a student
 */
export const startTestSession = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, testId } = req.body;

    if (!studentId || !testId) {
      return res.status(400).json({
        success: false,
        message: 'studentId and testId are required'
      });
    }

    const session = await testSessionService.startTestSession({
      studentId,
      testId
    });

    return res.status(201).json({
      success: true,
      message: 'Test session started',
      session
    });
  } catch (error: any) {
    console.error('startTestSession error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to start test session'
    });
  }
};

/**
 * GET /api/test-sessions/:sessionId/questions
 * Get questions for this session (no correct answers)
 */
export const getSessionQuestions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    const data = await testSessionService.getSessionQuestions(sessionId);

    return res.status(200).json({
      success: true,
      ...data
    });
  } catch (error: any) {
    console.error('getSessionQuestions error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get questions'
    });
  }
};

/**
 * POST /api/test-sessions/:sessionId/submit-mcq
 * Submit MCQ answers for a session
 */
export const submitMcqAnswers = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'answers object is required'
      });
    }

    const result = await testSessionService.submitMcqAnswers({
      sessionId,
      answers
    });

    return res.status(200).json({
      success: true,
      message: 'MCQ submitted successfully',
      results: result
    });
  } catch (error: any) {
    console.error('submitMcqAnswers error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit MCQ answers'
    });
  }
};

/**
 * POST /api/test-sessions/:sessionId/finalize
 * Final decision (level + pass/fail)
 */
export const finalizeTestSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { sessionId } = req.params;
    const { finalLevelId, recommendation, passed } = req.body;

    const updated = await testSessionService.finalizeTestSession({
      sessionId,
      finalLevelId,
      recommendation,
      passed
    });

    return res.status(200).json({
      success: true,
      message: 'Test session finalized',
      session: updated
    });
  } catch (error: any) {
    console.error('finalizeTestSession error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to finalize test session'
    });
  }
};

/**
 * GET /api/test-sessions/:sessionId
 * Get full session details
 */
export const getTestSessionById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { sessionId } = req.params;

    const session = await testSessionService.getTestSessionById(sessionId);

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('getTestSessionById error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch test session'
    });
  }
};

/**
 * GET /api/test-sessions
 * List sessions with filters (status, testType, pagination)
 */
export const listTestSessions = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string | undefined,
      testType: req.query.testType as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    };

    const result = await testSessionService.listTestSessions(filters);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('listTestSessions error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to list test sessions'
    });
  }
};

// Add this function to testSession_controller.ts

/**
 * GET /api/test-sessions/active?studentId=xxx
 * Get active test session for a student
 */
export const getActiveSession = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.query;

    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'studentId query parameter is required'
      });
    }

    const session = await testSessionService.getActiveSessionForStudent(studentId);

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('getActiveSession error:', error);

    // If no active session found, return 404 instead of 400
    if (error.message?.includes('No active test session')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get active session'
    });
  }
};

/**
 * GET /api/test-sessions/last-session?studentId=xxx&testId=yyy
 * Get the most recent session for a student and test
 */
export const getLastSession = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, testId } = req.query;

    if (!studentId || typeof studentId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'studentId query parameter is required'
      });
    }

    if (!testId || typeof testId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'testId query parameter is required'
      });
    }

    const session = await testSessionService.getLastTestSession(studentId, testId);

    if (!session) {
      return res.status(404).json({
        success: false, // Not an error, just no session found
        message: 'No previous session found'
      });
    }

    return res.status(200).json({
      success: true,
      session
    });
  } catch (error: any) {
    console.error('getLastSession error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to get last session'
    });
  }
};