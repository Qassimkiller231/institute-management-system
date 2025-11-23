import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-placeholder',
});

/**
 * Send query to Claude API
 */
export const askClaude = async (
  userMessage: string,
  systemPrompt?: string,
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> => {
  try {
    // Build messages array
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...(conversationHistory || []),
      { role: 'user', content: userMessage }
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt || getDefaultSystemPrompt(),
      messages
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error: any) {
    console.error('Claude API error:', error);
    
    // If API key not configured, throw specific error
    if (error.status === 401) {
      throw new Error('CLAUDE_API_NOT_CONFIGURED');
    }
    
    throw new Error(`Claude API error: ${error.message}`);
  }
};

/**
 * Default system prompt for institute chatbot
 */
function getDefaultSystemPrompt(): string {
  return `You are a helpful assistant for The Function Institute, an English language teaching center in Bahrain.

You help students, teachers, and parents with questions about:
- Attendance records and percentages
- Payment status and installments
- Class schedules and groups
- Programs and levels (English Multiverse for ages 11-17, English Unlimited for 18+)
- Teacher information
- Enrollment status

Keep responses concise, friendly, and professional. If you don't know something, suggest the user contact the admin.

Current date: ${new Date().toLocaleDateString('en-US', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}`;
}