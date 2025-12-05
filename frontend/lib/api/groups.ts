import { API_URL, getHeaders } from './client';

export interface Group {
  id: string;
  groupCode: string;
  name?: string;
  capacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate?: string;
  levelId: string;
  termId: string;
  teacherId: string;
  venueId?: string;
  hallId?: string;
  level: {
    name: string;
  };
  term: {
    name: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export interface UpdateGroupDto {
  termId?: string;
  levelId?: string;
  teacherId?: string;
  venueId?: string;
  groupCode?: string;
  name?: string;
  schedule?: any;
  capacity?: number;
  isActive?: boolean;
}

export const groupsAPI = {
  // Get all groups (admin) or by teacherId (teacher)
  getAll: async (params?: { teacherId?: string; isActive?: boolean; termId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.teacherId) searchParams.append('teacherId', params.teacherId);
    if (params?.isActive !== undefined) searchParams.append('isActive', String(params.isActive));
    if (params?.termId) searchParams.append('termId', params.termId);

    const res = await fetch(`${API_URL}/groups?${searchParams.toString()}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch groups');
    return res.json();
  },

  // Get group by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/groups/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch group');
    return res.json();
  },

  // Create group
  create: async (data: UpdateGroupDto) => {
    const res = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create group');
    }
    return res.json();
  },

  // Update group
  update: async (id: string, data: UpdateGroupDto) => {
    const res = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update group');
    }
    return res.json();
  },

  // Delete group
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete group');
    return res.json();
  }
};