// src/controllers/test.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as testService from '../services/test.service';

/**
 * POST /api/tests
 * Create new test (ADMIN)
 */
export const createTest = async (req: AuthRequest, res: Response) => {
  try {
    const { name, testType, levelId, totalQuestions, durationMinutes } = req.body;

    if (!name || !testType || !totalQuestions || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'name, testType, totalQuestions, durationMinutes are required'
      });
    }

    const test = await testService.createTest({
      name,
      testType,
      levelId,
      totalQuestions,
      durationMinutes
    });

    return res.status(201).json({
      success: true,
      message: 'Test created successfully',
      test
    });
  } catch (error: any) {
    console.error('createTest error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create test'
    });
  }
};

/**
 * POST /api/tests/:testId/questions
 * Add question to test (ADMIN)
 */
export const addQuestionToTest = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const {
      questionText,
      questionType,
      options,
      correctAnswer,
      points,
      orderNumber
    } = req.body;

    if (!questionText || !questionType || !correctAnswer || !orderNumber) {
      return res.status(400).json({
        success: false,
        message:
          'questionText, questionType, correctAnswer and orderNumber are required'
      });
    }

    const question = await testService.addQuestionToTest(testId, {
      questionText,
      questionType,
      options,
      correctAnswer,
      points,
      orderNumber
    });

    return res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question
    });
  } catch (error: any) {
    console.error('addQuestionToTest error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to add question'
    });
  }
};

/**
 * GET /api/tests
 * List tests (ADMIN / TEACHER)
 */
export const getTests = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      testType: req.query.testType as string | undefined,
      isActive:
        req.query.isActive === 'true'
          ? true
          : req.query.isActive === 'false'
          ? false
          : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    };

    const result = await testService.getTests(filters);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error: any) {
    console.error('getTests error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch tests'
    });
  }
};

/**
 * GET /api/tests/:testId
 * Get single test with questions (ADMIN / TEACHER)
 */
export const getTestById = async (req: AuthRequest, res: Response) => {
  try {
    const { testId } = req.params;
    const test = await testService.getTestById(testId);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    return res.status(200).json({
      success: true,
      test
    });
  } catch (error: any) {
    console.error('getTestById error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch test'
    });
  }
};