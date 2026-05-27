import { apiFetch } from './client';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  createdAt: string;
}

export interface CreateTeacherDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization?: string;
}

export interface UpdateTeacherDto {
  firstName?: string;
  lastName?: string;
  specialization?: string;
  isActive?: boolean;
}

export const teachersAPI = {
  getAll: (params?: { isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    const qs = searchParams.toString();
    return apiFetch(`/teachers${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch(`/teachers/${id}`),

  create: (data: CreateTeacherDto) =>
    apiFetch('/teachers', { method: 'POST', body: data }),

  update: (id: string, data: UpdateTeacherDto) =>
    apiFetch(`/teachers/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/teachers/${id}`, { method: 'DELETE' }),
};
