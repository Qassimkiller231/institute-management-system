import { API_URL, getHeaders } from './client';

export interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateTermDto {
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdateTermDto {
  programId?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const termsAPI = {
  // Get all terms
  getAll: async (isActive?: boolean) => {
    const url = isActive !== undefined
      ? `${API_URL}/terms?isActive=${isActive}`
      : `${API_URL}/terms`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch terms');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch term');
    return res.json();
  },

  // Create term
  create: async (data: CreateTermDto) => {
    const res = await fetch(`${API_URL}/terms`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create term');
    }
    return res.json();
  },

  // Update term
  update: async (id: string, data: UpdateTermDto) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update term');
    }
    return res.json();
  },

  // Delete term
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete term');
    return res.json();
  }
};