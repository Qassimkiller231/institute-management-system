// frontend/lib/api/criteria.ts
import { API_URL, getHeaders } from './client';

export const criteriaAPI = {
  // Get all criteria (optionally filtered by level or group)
  getAll: async (filters?: { levelId?: string; groupId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.levelId) params.append('levelId', filters.levelId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    
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
 getStudentProgress: async (studentId: string) => {
    const res = await fetch(`${API_URL}/progress-criteria/student/${studentId}/progress`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch student progress');
    return res.json();
  },

  // Set criteria completion
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
