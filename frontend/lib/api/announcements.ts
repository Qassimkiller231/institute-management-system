import { apiFetch } from './client';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: 'GROUP' | 'PROGRAM' | 'ALL';
  createdAt: string;
  groupId?: string;
  programId?: string;
  group?: {
    id: string;
    groupCode: string;
    name?: string;
  };
  program?: {
    id: string;
    name: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: 'GROUP' | 'PROGRAM' | 'ALL';
  groupId?: string;
  programId?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const announcementsAPI = {
  getAll: (filters?: { teacherId?: string; groupId?: string; isPublished?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.isPublished !== undefined) params.append('isPublished', String(filters.isPublished));
    const qs = params.toString();
    return apiFetch(`/announcements${qs ? `?${qs}` : ''}`);
  },

  getByProgram: (programId: string) =>
    apiFetch(`/announcements?programId=${programId}`),

  create: (data: CreateAnnouncementDto) =>
    apiFetch('/announcements', { method: 'POST', body: data }),

  update: (id: string, data: UpdateAnnouncementDto) =>
    apiFetch(`/announcements/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/announcements/${id}`, { method: 'DELETE' }),
};
