import { API_URL, getHeaders } from './client';

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
  // Get all programs
  getAll: async (isActive?: boolean) => {
    const url = isActive !== undefined
      ? `${API_URL}/programs?isActive=${isActive}`
      : `${API_URL}/programs`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch programs');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/programs/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch program');
    return res.json();
  },

  // Create program
  create: async (data: CreateProgramDto) => {
    const res = await fetch(`${API_URL}/programs`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create program');
    }
    return res.json();
  },

  // Update program
  update: async (id: string, data: UpdateProgramDto) => {
    const res = await fetch(`${API_URL}/programs/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update program');
    }
    return res.json();
  },

  // Delete program
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/programs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete program');
    return res.json();
  }
};