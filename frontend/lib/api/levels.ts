import { apiFetch } from './client';

export interface Level {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
}

export interface CreateLevelDto {
  name: string;
  description?: string;
  orderNumber?: number;
}

export interface UpdateLevelDto {
  name?: string;
  description?: string;
  orderNumber?: number;
}

export const levelsAPI = {
  getAll: () => apiFetch('/levels'),

  getById: (id: string) => apiFetch(`/levels/${id}`),

  create: (data: CreateLevelDto) =>
    apiFetch('/levels', { method: 'POST', body: data }),

  update: (id: string, data: UpdateLevelDto) =>
    apiFetch(`/levels/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/levels/${id}`, { method: 'DELETE' }),
};
