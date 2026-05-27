import { apiFetch } from './client';

export interface Program {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  isActive: boolean;
}

export interface CreateProgramDto {
  name: string;
  code: string;
  description?: string;
  duration?: number;
}

export interface UpdateProgramDto {
  name?: string;
  code?: string;
  description?: string;
  duration?: number;
  isActive?: boolean;
}

export const programsAPI = {
  getAll: (isActive?: boolean) =>
    apiFetch(isActive !== undefined ? `/programs?isActive=${isActive}` : '/programs'),

  getById: (id: string) => apiFetch(`/programs/${id}`),

  create: (data: CreateProgramDto) =>
    apiFetch('/programs', { method: 'POST', body: data }),

  update: (id: string, data: UpdateProgramDto) =>
    apiFetch(`/programs/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/programs/${id}`, { method: 'DELETE' }),
};
