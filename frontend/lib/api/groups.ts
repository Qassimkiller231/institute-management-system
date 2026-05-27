import { apiFetch } from './client';

export interface Group {
  id: string;
  groupCode: string;
  name?: string;
  capacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate?: string;
  levelId: string;
  termId: string;
  teacherId: string;
  venueId?: string;
  hallId?: string;
  level: {
    name: string;
  };
  term: {
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export interface UpdateGroupDto {
  termId?: string;
  levelId?: string;
  teacherId?: string;
  venueId?: string;
  hallId?: string;
  groupCode?: string;
  name?: string;
  capacity?: number;
  schedule?: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  isActive?: boolean;
}

export const groupsAPI = {
  getAll: (params?: { teacherId?: string; isActive?: boolean; termId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.teacherId) searchParams.append('teacherId', params.teacherId);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    if (params?.termId) searchParams.append('termId', params.termId);
    return apiFetch(`/groups?${searchParams.toString()}`);
  },

  getById: (id: string) => apiFetch(`/groups/${id}`),

  create: (data: UpdateGroupDto) =>
    apiFetch('/groups', { method: 'POST', body: data }),

  update: (id: string, data: UpdateGroupDto) =>
    apiFetch(`/groups/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/groups/${id}`, { method: 'DELETE' }),

  reactivate: (id: string) =>
    apiFetch(`/groups/${id}`, { method: 'PUT', body: { isActive: true } }),
};