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
    // For ADMIN users, use Claude AI directly with DATABASE CONTEXT
    if (query.userRole === 'ADMIN') {
      try {
        console.log('🔵 ADMIN query detected, fetching database context...');

        // Get real-time database statistics
        const dbContext = await analyticsService.getDatabaseContext();
        console.log('📊 Database context fetched');

        // Build enhanced system prompt with DB context
        const systemPrompt = `${getContextualSystemPrompt(query.userRole, query.userId)}

${dbContext}

IMPORTANT: You have access to the above REAL DATA from the institute's database. Use it to answer questions accurately. If asked about counts, statistics, or current status, refer to this data.`;

        console.log('🤖 Sending query to Claude with database context...');

        const aiResponse = await claudeService.askClaude(
          query.message,
          systemPrompt,
          query.conversationHistory
        );

        console.log('✅ Claude AI response received');

        return {
          response: aiResponse,
          queryType: detectQueryType(query.message),
          usedAI: true
        };
      } catch (error: any) {
        console.error('❌ Claude API error for ADMIN:', error);
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);

        if (error.message === 'CLAUDE_API_NOT_CONFIGURED') {
          return {
            response: "⚠️ Claude AI is not configured.\n\nTo fix:\n1. Add ANTHROPIC_API_KEY to .env\n2. Restart server\n3. Check API key is valid",
            queryType: 'ERROR',
            usedAI: false
          };
        }

        // DON'T RE-THROW! Return helpful error instead
        return {
          response: `⚠️ Claude API Error: ${error.message}\n\nCheck:\n1. API key in .env is correct\n2. Server was restarted\n3. Check backend console for details`,
          queryType: 'ERROR',
          usedAI: false
        };
      }
    }

    // For non-admin users, try FAQ first then data queries
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

    // Try FAQ for non-admin (faster, free)
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