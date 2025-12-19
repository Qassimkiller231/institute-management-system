import { Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import * as queryService from '../services/chatbot/query.service';
import * as summaryService from '../services/chatbot/summary.service';
import * as faqService from '../services/chatbot/faq.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/chatbot/query
 * Send a message to chatbot (ADMIN ONLY)
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Process query
    const result = await queryService.processQuery({
      userId,
      userRole,
      message,
      conversationHistory
    });

    // Save to database
    await queryService.saveChatMessage({
      userId,
      userRole,
      message,
      response: result.response,
      queryType: result.queryType,
      context: { usedAI: result.usedAI }
    });

    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        queryType: result.queryType,
        usedAI: result.usedAI
      }
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
};

/**
 * GET /api/chatbot/history
 * Get chat history for current user (ADMIN ONLY)
 */
export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    res.status(200).json({
      success: true,
      data: messages.reverse() // Return in chronological order
    });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch chat history'
    });
  }
};

/**
 * GET /api/chatbot/summary/weekly
 * Get weekly summary (ADMIN ONLY)
 */
export const getWeeklySummary = async (req: AuthRequest, res: Response) => {
  try {
    const summary = await summaryService.getAdminWeeklySummary();

    res.status(200).json({
      success: true,
      data: { summary }
    });
  } catch (error: any) {
    console.error('Get weekly summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate weekly summary'
    });
  }
};

/**
 * GET /api/chatbot/faqs
 * Get all FAQs (ADMIN ONLY)
 */
export const getFAQs = async (req: AuthRequest, res: Response) => {
  try {
    const faqs = await faqService.getAllFAQs();

    res.status(200).json({
      success: true,
      data: faqs
    });
  } catch (error: any) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch FAQs'
    });
  }
};

/**
 * DELETE /api/chatbot/history
 * Clear chat history (ADMIN ONLY)
 */
export const clearHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    await prisma.chatMessage.deleteMany({
      where: { userId }
    });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error: any) {
    console.error('Clear history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear chat history'
    });
  }
};