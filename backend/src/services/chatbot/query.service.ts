import { PrismaClient } from '@prisma/client';
import * as claudeService from './claude.service';
import * as faqService from './faq.service';
import * as analyticsService from './analytics.service';

const prisma = new PrismaClient();

export interface ChatQuery {
  userId: string;
  userRole: string;
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  response: string;
  queryType: string;
  usedAI: boolean;
}

/**
 * Process user query and return response
 */
export const processQuery = async (query: ChatQuery): Promise<ChatResponse> => {
  try {
    // Detect query type/intent
    const queryType = detectQueryType(query.message);
    
    // Try to get specific data if needed
    if (queryType === 'ATTENDANCE' || queryType === 'PAYMENT' || queryType === 'SCHEDULE') {
      const dataResponse = await analyticsService.getSpecificData(
        query.userId,
        query.userRole,
        queryType,
        query.message
      );
      
      if (dataResponse) {
        return {
          response: dataResponse,
          queryType,
          usedAI: false
        };
      }
    }
    
    // Try FAQ first (faster, free)
    const faqResponse = faqService.getFAQResponse(query.message, query.userRole);
    if (faqResponse) {
      return {
        response: faqResponse,
        queryType: 'FAQ',
        usedAI: false
      };
    }
    
    // Fall back to Claude API if configured
    try {
      const aiResponse = await claudeService.askClaude(
        query.message,
        getContextualSystemPrompt(query.userRole, query.userId),
        query.conversationHistory
      );
      
      return {
        response: aiResponse,
        queryType,
        usedAI: true
      };
    } catch (error: any) {
      if (error.message === 'CLAUDE_API_NOT_CONFIGURED') {
        return {
          response: "I'm currently unable to process complex queries. Please try asking about specific topics like attendance, payments, or schedule, or contact the admin for assistance.",
          queryType: 'ERROR',
          usedAI: false
        };
      }
      throw error;
    }
    
  } catch (error: any) {
    console.error('Query processing error:', error);
    return {
      response: "I'm having trouble processing your request. Please try again or contact the admin.",
      queryType: 'ERROR',
      usedAI: false
    };
  }
};

/**
 * Detect query intent/type
 */
function detectQueryType(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('attendance') || lowerMessage.includes('absent')) {
    return 'ATTENDANCE';
  }
  if (lowerMessage.includes('payment') || lowerMessage.includes('fee') || lowerMessage.includes('balance')) {
    return 'PAYMENT';
  }
  if (lowerMessage.includes('schedule') || lowerMessage.includes('class') || lowerMessage.includes('time')) {
    return 'SCHEDULE';
  }
  if (lowerMessage.includes('grade') || lowerMessage.includes('progress')) {
    return 'PROGRESS';
  }
  if (lowerMessage.includes('teacher')) {
    return 'TEACHER';
  }
  if (lowerMessage.includes('program') || lowerMessage.includes('level')) {
    return 'PROGRAM';
  }
  
  return 'GENERAL';
}

/**
 * Get contextual system prompt based on user role
 */
function getContextualSystemPrompt(userRole: string, userId: string): string {
  let roleContext = '';
  
  switch (userRole) {
    case 'STUDENT':
      roleContext = 'You are speaking with a student. Focus on their attendance, grades, schedule, and payments.';
      break;
    case 'TEACHER':
      roleContext = 'You are speaking with a teacher. Help with their assigned classes, student progress, and attendance recording.';
      break;
    case 'ADMIN':
      roleContext = 'You are speaking with an administrator. Provide insights on overall institute performance, financials, and reports.';
      break;
    case 'PARENT':
      roleContext = "You are speaking with a parent. Help them track their child's attendance, progress, and payments.";
      break;
  }
  
  return `You are a helpful assistant for The Function Institute.

${roleContext}

Keep responses concise and professional. Current date: ${new Date().toISOString().split('T')[0]}`;
}

/**
 * Save chat message to database
 */
export const saveChatMessage = async (data: {
  userId: string;
  userRole: string;
  message: string;
  response: string;
  queryType: string;
  context?: any;
}) => {
  return await prisma.chatMessage.create({
    data: {
      userId: data.userId,
      userRole: data.userRole,
      message: data.message,
      response: data.response,
      queryType: data.queryType,
      context: data.context || {}
    }
  });
};