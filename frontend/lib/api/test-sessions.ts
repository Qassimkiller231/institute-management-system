import { API_URL, getHeaders } from './client';

export const testSessionAPI = {
  getByStudent: async (studentId: string) => {
    const res = await fetch(`${API_URL}/test-sessions?studentId=${studentId}`, {
      headers: getHeaders(true)
    });
    return res.json();
  },
  
  getById: async (sessionId: string) => {
    const res = await fetch(`${API_URL}/test-sessions/${sessionId}`, {
      headers: getHeaders(true)
    });
    return res.json();
  }
};