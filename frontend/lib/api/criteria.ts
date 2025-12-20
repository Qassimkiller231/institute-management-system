// frontend/lib/api/criteria.ts
import { API_URL, getHeaders } from './client';

export const criteriaAPI = {
  // Get all criteria (optionally filtered by level or group)
  getAll: async (filters?: { levelId?: string; groupId?: string; isActive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.levelId) params.append('levelId', filters.levelId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const url = params.toString()
      ? `${API_URL}/progress-criteria?${params}`
      : `${API_URL}/progress-criteria`;

    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch criteria');
    return res.json();
  },

  // Get student progress
  getStudentProgress: async (studentId: string, params?: { enrollmentId?: string; levelId?: string }) => {
    let url = `${API_URL}/progress-criteria/student/${studentId}/progress`;
    const searchParams = new URLSearchParams();
    if (params?.enrollmentId) searchParams.append('enrollmentId', params.enrollmentId);
    if (params?.levelId) searchParams.append('levelId', params.levelId);

    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }

    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch student progress');
    return res.json();
  },

  // Create criterion
  create: async (data: {
    name: string;
    description?: string;
    levelId?: string;
    groupId?: string;
    orderNumber?: number;
  }) => {
    const res = await fetch(`${API_URL}/progress-criteria`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create criterion');
    }
    return res.json();
  },

  // Update criterion
  update: async (id: string, data: {
    name?: string;
    description?: string;
    levelId?: string;
    groupId?: string;
    orderNumber?: number;
    isActive?: boolean;
  }) => {
    const res = await fetch(`${API_URL}/progress-criteria/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update criterion');
    }
    return res.json();
  },

  // Delete criterion (soft delete)
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/progress-criteria/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete criterion');
    }
    return res.json();
  },

  // Bulk update progress
  bulkUpdate: async (progressUpdates: any[]) => {
    const res = await fetch(`${API_URL}/progress-criteria/bulk`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify({ progressUpdates })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update progress');
    }
    return res.json();
  },

  // Set criteria completion (single)
  setCompletion: async (data: any) => {
    const res = await fetch(`${API_URL}/progress-criteria/completion`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to set completion');
    return res.json();
  }
};
