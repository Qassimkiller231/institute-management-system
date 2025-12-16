import { API_URL, getHeaders } from './client';

export const authAPI = {
  requestOTP: async (identifier: string, method: 'email' | 'sms') => {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ identifier, method })
    });
    console.log(res);
    return res.json();
  },

  verifyOTP: async (identifier: string, code: string) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify({ identifier, code })
    });
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(true)
    });
    console.log('[API] getCurrentUser response:', res.status);
    if (!res.ok) throw new Error('Failed to fetch user data');
    return res.json();
  }
};