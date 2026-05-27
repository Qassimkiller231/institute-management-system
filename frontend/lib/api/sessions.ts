import { apiFetch } from './client';

export interface Session {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  groupId: string;
  group: {
    groupCode: string;
    name?: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateSessionDto {
  groupId: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  hallId?: string;
  topic?: string;
}

export const sessionsAPI = {
  getAll: (params?: { groupId?: string; status?: string }) => {
    const queryParams: string[] = [];
    if (params?.groupId) queryParams.push(`groupId=${params.groupId}`);
    if (params?.status) queryParams.push(`status=${params.status}`);
    const qs = queryParams.join('&');
    return apiFetch(`/sessions${qs ? `?${qs}` : ''}`);
  },

  getByTeacher: (teacherId: string) =>
    apiFetch(`/sessions?teacherId=${teacherId}`),

  getByStudent: (studentId: string) =>
    apiFetch(`/sessions?studentId=${studentId}`),

  create: (data: CreateSessionDto) =>
    apiFetch('/sessions', { method: 'POST', body: data }),

  update: (id: string, data: Partial<CreateSessionDto>) =>
    apiFetch(`/sessions/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/sessions/${id}`, { method: 'DELETE' }),
};
