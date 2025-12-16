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
  },
  getActiveSession: async (studentId: string) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(
      `http://localhost:3001/api/test-sessions/active?studentId=${studentId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },
  getLastSession: async (studentId: string, testId: string) => {
    const res = await fetch(`${API_URL}/test-sessions/last-session?studentId=${studentId}&testId=${testId}`, {
      headers: getHeaders(true)
    });
    // Check if 404 (not found) - this is a valid "null" result, not an error
    if (res.status === 404) {
      return { success: true, session: null };
    }
    return res.json();
  }
};