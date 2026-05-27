import { apiFetch } from './client';

export const testSessionAPI = {
  getAll: () => apiFetch('/test-sessions', { throwOnError: false }),

  getByStudent: (studentId: string) =>
    apiFetch(`/test-sessions?studentId=${studentId}`, { throwOnError: false }),

  getById: (sessionId: string) =>
    apiFetch(`/test-sessions/${sessionId}`, { throwOnError: false }),
};
