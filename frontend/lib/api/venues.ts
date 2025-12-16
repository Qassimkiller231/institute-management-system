import { API_URL, getHeaders } from './client';

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
  // Get all venues
  getAll: async (isActive?: boolean) => {
    const url = isActive !== undefined
      ? `${API_URL}/venues?isActive=${isActive}`
      : `${API_URL}/venues`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch venues');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/venues/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch venue');
    return res.json();
  },

  // Create venue
  create: async (data: CreateVenueDto) => {
    const res = await fetch(`${API_URL}/venues`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create venue');
    }
    return res.json();
  },

  // Update venue
  update: async (id: string, data: UpdateVenueDto) => {
    const res = await fetch(`${API_URL}/venues/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update venue');
    }
    return res.json();
  },

  // Delete venue (soft delete)
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/venues/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete venue');
    return res.json();
  },

  // Reactivate venue
  reactivate: async (id: string) => {
    const res = await fetch(`${API_URL}/venues/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ isActive: true })
    });
    if (!res.ok) throw new Error('Failed to reactivate venue');
    return res.json();
  }
};