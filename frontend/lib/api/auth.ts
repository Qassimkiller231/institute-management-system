import { API_URL, getHeaders } from './client';

export const authAPI = {
  requestOTP: async (identifier: string, method: 'email' | 'sms') => {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ identifier, method })
    });
    return res.json();
  },

  verifyOTP: async (identifier: string, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ identifier, code })
    });
    return res.json();
  }
};