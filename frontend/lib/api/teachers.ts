import { API_URL, getHeaders } from './client';

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
  // Get all teachers
  getAll: async (params?: { isActive?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) {
      searchParams.append('isActive', String(params.isActive));
    }

    const url = searchParams.toString() 
      ? `${API_URL}/teachers?${searchParams.toString()}`
      : `${API_URL}/teachers`;

    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch teachers');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch teacher');
    return res.json();
  },

  // Create teacher
  create: async (data: CreateTeacherDto) => {
    const res = await fetch(`${API_URL}/teachers`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create teacher');
    }
    return res.json();
  },

  // Update teacher
  update: async (id: string, data: UpdateTeacherDto) => {
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update teacher');
    }
    return res.json();
  },

  // Delete teacher
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/teachers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete teacher');
    return res.json();
  }
};