import { API_URL, getHeaders } from './client';

export interface Session {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  groupId: string;
  group: {
    groupCode: string;
    name?: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateSessionDto {
  groupId: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  hallId?: string;
  topic?: string;
}

export const sessionsAPI = {
  // Get all sessions with optional filters
  getAll: async (params?: { groupId?: string; status?: string }) => {
    let url = `${API_URL}/sessions`;
    const queryParams: string[] = [];
    if (params?.groupId) queryParams.push(`groupId=${params.groupId}`);
    if (params?.status) queryParams.push(`status=${params.status}`);
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  // Get sessions by teacher
  getByTeacher: async (teacherId: string) => {
    const res = await fetch(`${API_URL}/sessions?teacherId=${teacherId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  // Get sessions by student
  getByStudent: async (studentId: string) => {
    const res = await fetch(`${API_URL}/sessions?studentId=${studentId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  // Create a new session
  create: async (data: CreateSessionDto) => {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create session');
    }
    return res.json();
  },

  // Update a session
  update: async (id: string, data: Partial<CreateSessionDto>) => {
    const res = await fetch(`${API_URL}/sessions/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update session');
    }
    return res.json();
  },

  // Delete a session
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/sessions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to delete session');
    }
    return res.json();
  }
};