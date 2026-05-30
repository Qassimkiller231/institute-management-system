import { apiFetch } from './client';

export const authAPI = {
  // Login endpoints: no auth header, and don't throw — the login pages inspect
  // `result.success` and show the server's message inline.
  requestOTP: (identifier: string, method: 'email' | 'sms') =>
    apiFetch('/auth/request-otp', {
      method: 'POST',
      body: { identifier, method },
      auth: false,
      throwOnError: false,
    }),

  // verify-otp and google login MUST send credentials so the browser stores
  // the Set-Cookie response (the httpOnly session cookie). `auth: true` triggers
  // `credentials: 'include'` in apiFetch.
  verifyOTP: (identifier: string, code: string) =>
    apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: { identifier, code },
      throwOnError: false,
    }),

  // Staff login with a Google ID token (credential) from Google Identity Services.
  googleLogin: (idToken: string) =>
    apiFetch('/auth/google', {
      method: 'POST',
      body: { idToken },
      throwOnError: false,
    }),

  // Authenticated: a 401 here flows through apiFetch's session-expiry handling.
  getCurrentUser: () => apiFetch('/auth/me'),

  // Tells the backend to clear the httpOnly session cookie. Always resolves
  // (the user is logged out locally regardless of network outcome).
  logout: () =>
    apiFetch('/auth/logout', { method: 'POST', throwOnError: false }),
};
