import { API_URL, getHeaders } from './client';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: 'GROUP' | 'PROGRAM' | 'ALL';
  createdAt: string;
  groupId?: string;
  programId?: string;
  group?: {
    id: string;
    groupCode: string;
    name?: string;
  };
  program?: {
    id: string;
    name: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  targetAudience: 'GROUP' | 'PROGRAM' | 'ALL';
  groupId?: string;
  programId?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const announcementsAPI = {
  // Get all announcements
  getAll: async (filters?: { 
    teacherId?: string; 
    groupId?: string;
    isPublished?: boolean;
  }) => {
    let url = `${API_URL}/announcements`;
    const params = new URLSearchParams();
    
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.groupId) params.append('groupId', filters.groupId);
    if (filters?.isPublished !== undefined) params.append('isPublished', String(filters.isPublished));
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  // Get announcements by program
  getByProgram: async (programId: string) => {
    const res = await fetch(`${API_URL}/announcements?programId=${programId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return res.json();
  },

  // Create new announcement
  create: async (data: CreateAnnouncementDto) => {
    const res = await fetch(`${API_URL}/announcements`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create announcement');
    }
    return res.json();
  },

  // Update announcement
  update: async (id: string, data: UpdateAnnouncementDto) => {
    const res = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update announcement');
    }
    return res.json();
  },

  // Delete announcement
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/announcements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return res.json();
  }
};