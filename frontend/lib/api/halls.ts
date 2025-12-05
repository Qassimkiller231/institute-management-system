import { API_URL, getHeaders } from './client';

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
  // Get all halls
  getAll: async (venueId?: string) => {
    const url = venueId 
      ? `${API_URL}/halls?venueId=${venueId}`
      : `${API_URL}/halls`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch halls');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/halls/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch hall');
    return res.json();
  },

  // Create hall
  create: async (data: CreateHallDto) => {
    const res = await fetch(`${API_URL}/halls`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create hall');
    }
    return res.json();
  },

  // Update hall
  update: async (id: string, data: UpdateHallDto) => {
    const res = await fetch(`${API_URL}/halls/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update hall');
    }
    return res.json();
  },

  // Delete hall
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/halls/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete hall');
    return res.json();
  }
};