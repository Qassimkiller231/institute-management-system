import { API_URL, getHeaders } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatbotAPI = {
  /**
   * Send a message to the chatbot
   */
  sendMessage: async (message: string, conversationHistory?: ChatMessage[]) => {
    const response = await fetch(`${API_URL}/chatbot/query`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ message, conversationHistory })
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
  },

  /**
   * Get chat history
   */
  getHistory: async (limit = 50) => {
    const response = await fetch(`${API_URL}/chatbot/history?limit=${limit}`, {
      headers: getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  /**
   * Get weekly summary
   */
  getWeeklySummary: async () => {
    const response = await fetch(`${API_URL}/chatbot/summary/weekly`, {
      headers: getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },

  /**
   * Get FAQs
   */
  getFAQs: async () => {
    const response = await fetch(`${API_URL}/chatbot/faqs`, {
      headers: getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to fetch FAQs');
    return response.json();
  },

  /**
   * Clear chat history
   */
  clearHistory: async () => {
    const response = await fetch(`${API_URL}/chatbot/history`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!response.ok) throw new Error('Failed to clear history');
    return response.json();
  }
};
