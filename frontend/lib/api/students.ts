import { API_URL, getHeaders } from './client';

export const studentAPI = {
  create: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE';
    cpr: string;
  }) => {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ✅ ADD THIS:
  getById: async (studentId: string) => {
    const res = await fetch(`${API_URL}/students/${studentId}`, {
      headers: getHeaders(true)
    });
    return res.json();
  }
};