import { apiFetch } from './client';

export interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  capacity?: number;
}

export interface CreateVenueDto {
  name: string;
  code: string;
  address?: string;
  city?: string;
  capacity?: number;
}

export interface UpdateVenueDto {
  name?: string;
  address?: string;
  city?: string;
  capacity?: number;
}

export const venuesAPI = {
  getAll: (isActive?: boolean) =>
    apiFetch(isActive !== undefined ? `/venues?isActive=${isActive}` : '/venues'),

  getById: (id: string) => apiFetch(`/venues/${id}`),

  create: (data: CreateVenueDto) =>
    apiFetch('/venues', { method: 'POST', body: data }),

  update: (id: string, data: UpdateVenueDto) =>
    apiFetch(`/venues/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/venues/${id}`, { method: 'DELETE' }),

  reactivate: (id: string) =>
    apiFetch(`/venues/${id}`, { method: 'PUT', body: { isActive: true } }),
};
