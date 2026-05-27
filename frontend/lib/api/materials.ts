import { apiFetch } from './client';

export interface Material {
  id: string;
  title: string;
  description?: string;
  materialType: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER';
  fileUrl?: string;
  fileSizeKb?: number;
  uploadedAt: string;
  groupId: string;
  group: {
    id: string;
    groupCode: string;
    name?: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
  isPublished?: boolean;
  scheduledFor?: string;
}

export interface CreateMaterialDto {
  groupId: string;
  title: string;
  description?: string;
  materialType: string;
  fileUrl: string;
  scheduledFor?: string;
  publishNow?: boolean;
}

export interface UpdateMaterialDto {
  groupId?: string;
  title?: string;
  description?: string;
  materialType?: string;
  fileUrl?: string;
  scheduledFor?: string;
  publishNow?: boolean;
}

export const materialsAPI = {
  getAll: (params?: { groupId?: string }) =>
    apiFetch(`/materials${params?.groupId ? `?groupId=${params.groupId}` : ''}`),

  getByTeacher: (teacherId: string) =>
    apiFetch(`/materials?teacherId=${teacherId}`),

  getByGroup: (groupId: string) => apiFetch(`/materials/group/${groupId}`),

  create: (data: CreateMaterialDto) =>
    apiFetch('/materials', { method: 'POST', body: data }),

  update: (id: string, data: UpdateMaterialDto) =>
    apiFetch(`/materials/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/materials/${id}`, { method: 'DELETE' }),
};
