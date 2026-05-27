import { apiFetch } from './client';

export interface Hall {
  id: string;
  name: string;
  code: string;
  capacity: number;
  venueId: string;
  venue?: {
    name: string;
  };
}

export interface CreateHallDto {
  name: string;
  code: string;
  capacity: number;
  venueId: string;
}

export interface UpdateHallDto {
  name?: string;
  code?: string;
  capacity?: number;
  venueId?: string;
}

export const hallsAPI = {
  getAll: (venueId?: string, isActive?: boolean) => {
    const params = new URLSearchParams();
    if (venueId) params.append('venueId', venueId);
    if (isActive !== undefined) params.append('isActive', String(isActive));
    const queryString = params.toString();
    return apiFetch(`/halls${queryString ? `?${queryString}` : ''}`);
  },

  getById: (id: string) => apiFetch(`/halls/${id}`),

  create: (data: CreateHallDto) =>
    apiFetch('/halls', { method: 'POST', body: data }),

  update: (id: string, data: UpdateHallDto) =>
    apiFetch(`/halls/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/halls/${id}`, { method: 'DELETE' }),

  reactivate: (id: string) =>
    apiFetch(`/halls/${id}`, { method: 'PUT', body: { isActive: true } }),
};
