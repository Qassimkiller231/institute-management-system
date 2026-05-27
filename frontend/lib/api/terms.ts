import { apiFetch } from './client';

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  programId: string;
  isActive: boolean;
  isCurrent: boolean;
  program?: {
    id: string;
    name: string;
  };
  _count?: {
    groups: number;
  };
}

export interface CreateTermDto {
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isCurrent?: boolean;
}

export interface UpdateTermDto {
  programId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isCurrent?: boolean;
}

export const termsAPI = {
  getAll: (params?: { programId?: string; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.programId) searchParams.append('programId', params.programId);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    const qs = searchParams.toString();
    return apiFetch(`/terms${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch(`/terms/${id}`),

  create: (data: CreateTermDto) =>
    apiFetch('/terms', { method: 'POST', body: data }),

  update: (id: string, data: UpdateTermDto) =>
    apiFetch(`/terms/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/terms/${id}`, { method: 'DELETE' }),

  reactivate: (id: string) =>
    apiFetch(`/terms/${id}`, { method: 'PUT', body: { isActive: true } }),

  setCurrentTerm: (id: string) =>
    apiFetch(`/terms/${id}/set-current`, { method: 'PATCH' }),
};
