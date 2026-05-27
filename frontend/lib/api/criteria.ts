// frontend/lib/api/criteria.ts
import { apiFetch } from './client';

export const criteriaAPI = {
  getAll: (filters?: { levelId?: string; groupId?: string; isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.levelId) params.append('levelId', filters.levelId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    const qs = params.toString();
    return apiFetch(`/progress-criteria${qs ? `?${qs}` : ''}`);
  },

  getStudentProgress: (studentId: string, params?: { enrollmentId?: string; levelId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.enrollmentId) searchParams.append('enrollmentId', params.enrollmentId);
    if (params?.levelId) searchParams.append('levelId', params.levelId);
    const qs = searchParams.toString();
    return apiFetch(`/progress-criteria/student/${studentId}/progress${qs ? `?${qs}` : ''}`);
  },

  create: (data: {
    name: string;
    description?: string;
    levelId?: string;
    groupId?: string;
    orderNumber?: number;
  }) => apiFetch('/progress-criteria', { method: 'POST', body: data }),

  update: (id: string, data: {
    name?: string;
    description?: string;
    levelId?: string;
    groupId?: string;
    orderNumber?: number;
    isActive?: boolean;
  }) => apiFetch(`/progress-criteria/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/progress-criteria/${id}`, { method: 'DELETE' }),

  bulkUpdate: (progressUpdates: any[]) =>
    apiFetch('/progress-criteria/bulk', { method: 'POST', body: { progressUpdates } }),

  setCompletion: (data: any) =>
    apiFetch('/progress-criteria/completion', { method: 'POST', body: data }),
};
