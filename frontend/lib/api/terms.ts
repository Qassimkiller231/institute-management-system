import { API_URL, getHeaders } from './client';

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
  // Get all terms
  getAll: async (params?: { programId?: string; isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.programId) searchParams.append('programId', params.programId);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));

    const url = searchParams.toString()
      ? `${API_URL}/terms?${searchParams.toString()}`
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
  },

  // Reactivate term
  reactivate: async (id: string) => {
    const res = await fetch(`${API_URL}/terms/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify({ isActive: true })
    });
    if (!res.ok) throw new Error('Failed to reactivate term');
    return res.json();
  },

  // Set term as current (exclusive per program)
  setCurrentTerm: async (id: string) => {
    const res = await fetch(`${API_URL}/terms/${id}/set-current`, {
      method: 'PATCH',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to set current term');
    return res.json();
  }
};
