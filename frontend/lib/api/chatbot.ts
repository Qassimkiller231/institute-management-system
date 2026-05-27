import { apiFetch } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatbotAPI = {
  /** Send a message to the chatbot */
  sendMessage: (message: string, conversationHistory?: ChatMessage[]) =>
    apiFetch('/chatbot/query', {
      method: 'POST',
      body: { message, conversationHistory },
    }),

  /** Get chat history */
  getHistory: (limit = 50) => apiFetch(`/chatbot/history?limit=${limit}`),

  /** Get weekly summary */
  getWeeklySummary: () => apiFetch('/chatbot/summary/weekly'),

  /** Get FAQs */
  getFAQs: () => apiFetch('/chatbot/faqs'),

  /** Clear chat history */
  clearHistory: () => apiFetch('/chatbot/history', { method: 'DELETE' }),
};
