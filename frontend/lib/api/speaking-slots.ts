import { API_URL, getHeaders } from './client';

export const speakingSlotAPI = {
  getAvailable: async () => {
    const res = await fetch(`${API_URL}/speaking-slots/available`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

  getAll: async () => {
    const res = await fetch(`${API_URL}/speaking-slots`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

  getByTeacher: async (teacherId: string) => {
    const res = await fetch(`${API_URL}/speaking-slots/teacher/${teacherId}`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

  submitResult: async (data: {
    slotId: string;
    sessionId: string;
    mcqLevel: string;
    speakingLevel: string;
    finalLevel: string;
    feedback?: string;
  }) => {
    const res = await fetch(`${API_URL}/speaking-slots/submit-result`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  cancel: async (slotId: string, sessionId: string) => {
    const res = await fetch(`${API_URL}/speaking-slots/${slotId}/cancel`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },

  book: async (slotId: string, sessionId: string, studentId: string) => {
    const res = await fetch(`${API_URL}/speaking-slots/book`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ slotId, sessionId, studentId })
    });
    return res.json();
  },
};