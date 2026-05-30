import { apiFetch, API_URL, getHeaders } from './client';

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';

export interface AdminQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType | string;
  options?: string[] | null;
  correctAnswer: string;
  points: number;
  orderNumber: number;
}

export interface AdminTest {
  id: string;
  name: string;
  testType: string;
  levelId?: string | null;
  totalQuestions: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt?: string;
  questions?: AdminQuestion[];
}

export const testsAdminAPI = {
  list: (params: { testType?: string; isActive?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.testType) qs.set('testType', params.testType);
    if (typeof params.isActive === 'boolean') qs.set('isActive', String(params.isActive));
    return apiFetch(`/tests${qs.toString() ? `?${qs}` : ''}`, { throwOnError: false });
  },
  get: (testId: string) =>
    apiFetch(`/tests/${testId}`, { throwOnError: false }),
  create: (body: {
    name: string;
    testType: string;
    levelId?: string | null;
    durationMinutes?: number;
    totalQuestions?: number;
  }) => apiFetch(`/tests`, { method: 'POST', body, throwOnError: false }),
  update: (testId: string, body: Partial<AdminTest>) =>
    apiFetch(`/tests/${testId}`, { method: 'PATCH', body, throwOnError: false }),
  remove: (testId: string) =>
    apiFetch(`/tests/${testId}`, { method: 'DELETE', throwOnError: false }),

  addQuestion: (testId: string, body: Omit<AdminQuestion, 'id'>) =>
    apiFetch(`/tests/${testId}/questions`, { method: 'POST', body, throwOnError: false }),
  updateQuestion: (testId: string, questionId: string, body: Partial<AdminQuestion>) =>
    apiFetch(`/tests/${testId}/questions/${questionId}`, { method: 'PATCH', body, throwOnError: false }),
  deleteQuestion: (testId: string, questionId: string) =>
    apiFetch(`/tests/${testId}/questions/${questionId}`, { method: 'DELETE', throwOnError: false }),
  reorder: (testId: string, orders: { id: string; orderNumber: number }[]) =>
    apiFetch(`/tests/${testId}/questions/reorder`, { method: 'POST', body: { orders }, throwOnError: false }),
};

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
