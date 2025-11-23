import { API_URL, getHeaders } from './client';

export const testAPI = {
  getPlacementTests: async () => {
    const res = await fetch(`${API_URL}/tests?testType=PLACEMENT&isActive=true`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

  startSession: async (studentId: string, testId: string) => {
    const res = await fetch(`${API_URL}/test-sessions/start`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ studentId, testId })
    });
    return res.json();
  },

  getSessionQuestions: async (sessionId: string) => {
    const res = await fetch(`${API_URL}/test-sessions/${sessionId}/questions`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

  submitMCQ: async (sessionId: string, answers: Record<string, string>) => {
    const res = await fetch(`${API_URL}/test-sessions/${sessionId}/submit-mcq`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ answers })
    });
    return res.json();
  }
};