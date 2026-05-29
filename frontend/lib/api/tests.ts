import { apiFetch, API_URL, getHeaders } from './client';

export const testAPI = {
  getPlacementTests: () =>
    apiFetch('/tests?testType=PLACEMENT&isActive=true', { throwOnError: false }),

  startSession: (studentId: string, testId: string) =>
    apiFetch('/test-sessions/start', {
      method: 'POST',
      body: { studentId, testId },
      throwOnError: false,
    }),

  getSessionQuestions: (sessionId: string) =>
    apiFetch(`/test-sessions/${sessionId}/questions`, { throwOnError: false }),

  submitMCQ: (sessionId: string, answers: Record<string, string>) =>
    apiFetch(`/test-sessions/${sessionId}/submit-mcq`, {
      method: 'POST',
      body: { answers },
      throwOnError: false,
    }),

  // These map a 404 to a valid "no session" result, so they need the raw
  // status code (which apiFetch intentionally hides) — keep plain fetch.
  getActiveSession: async (studentId: string) => {
    const res = await fetch(`${API_URL}/test-sessions/active?studentId=${studentId}`, {
      credentials: 'include',
      headers: getHeaders(true),
    });
    if (res.status === 404) return { success: true, session: null };
    return res.json();
  },

  getLastSession: async (studentId: string, testId: string) => {
    const res = await fetch(
      `${API_URL}/test-sessions/last-session?studentId=${studentId}&testId=${testId}`,
      { headers: getHeaders(true) }
    );
    if (res.status === 404) return { success: true, session: null };
    return res.json();
  },
};
