import { API_URL, getHeaders } from './client';

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
  // Get all levels
  getAll: async () => {
    const res = await fetch(`${API_URL}/levels`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch levels');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/levels/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch level');
    return res.json();
  },

  // Create level
  create: async (data: CreateLevelDto) => {
    const res = await fetch(`${API_URL}/levels`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create level');
    }
    return res.json();
  },

  // Update level
  update: async (id: string, data: UpdateLevelDto) => {
    const res = await fetch(`${API_URL}/levels/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update level');
    }
    return res.json();
  },

  // Delete level
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/levels/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete level');
    return res.json();
  }
};