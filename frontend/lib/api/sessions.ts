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
  }
};