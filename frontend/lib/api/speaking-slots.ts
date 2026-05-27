import { apiFetch } from './client';

export const speakingSlotAPI = {
  getAvailable: () => apiFetch('/speaking-slots/available', { throwOnError: false }),

  getAll: () => apiFetch('/speaking-slots', { throwOnError: false }),

  getByTeacher: (teacherId: string) =>
    apiFetch(`/speaking-slots/teacher/${teacherId}`, { throwOnError: false }),

  submitResult: (data: {
    slotId: string;
    sessionId: string;
    mcqLevel: string;
    speakingLevel: string;
    finalLevel: string;
    feedback?: string;
  }) =>
    apiFetch('/speaking-slots/submit-result', {
      method: 'POST',
      body: data,
      throwOnError: false,
    }),

  cancel: (slotId: string, sessionId: string) =>
    apiFetch(`/speaking-slots/${slotId}/cancel`, {
      method: 'PUT',
      body: { sessionId },
      throwOnError: false,
    }),

  book: (slotId: string, sessionId: string, studentId: string) =>
    apiFetch('/speaking-slots/book', {
      method: 'POST',
      body: { slotId, sessionId, studentId },
      throwOnError: false,
    }),
};
