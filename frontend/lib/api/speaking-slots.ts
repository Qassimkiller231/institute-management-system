import { API_URL, getHeaders } from './client';

export const speakingSlotAPI = {
  getAvailable: async () => {
    const res = await fetch(`${API_URL}/speaking-slots/available`, {
      headers: getHeaders(true)
    });
    return res.json();
  },

 book: async (slotId: string, sessionId: string, studentId: string) => {
  const res = await fetch(`${API_URL}/speaking-slots/book`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify({ slotId, sessionId, studentId }) // ✅ Added studentId
  });
  return res.json();
},
};