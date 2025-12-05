import { API_URL, getHeaders } from './client';

export interface Material {
  id: string;
  title: string;
  description?: string;
  materialType: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE' | 'OTHER';
  fileUrl?: string;
  fileSizeKb?: number;
  uploadedAt: string;
  groupId: string;
  group: {
    id: string;
    groupCode: string;
    name?: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateMaterialDto {
  groupId: string;
  title: string;
  description?: string;
  materialType: string;
  fileUrl: string;
}

export interface UpdateMaterialDto {
  groupId?: string;
  title?: string;
  description?: string;
  materialType?: string;
  fileUrl?: string;
}

export const materialsAPI = {
  // Get all materials (admin) or filtered by groupId (teacher)
  getAll: async (params?: { groupId?: string }) => {
    let url = `${API_URL}/materials`;
    if (params?.groupId) {
      url += `?groupId=${params.groupId}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  // Get materials for teacher's groups
  getByTeacher: async (teacherId: string) => {
    const res = await fetch(`${API_URL}/materials?teacherId=${teacherId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  // Create new material
  create: async (data: CreateMaterialDto) => {
    const res = await fetch(`${API_URL}/materials`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create material');
    }
    return res.json();
  },

  // Update material
  update: async (id: string, data: UpdateMaterialDto) => {
    const res = await fetch(`${API_URL}/materials/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update material');
    }
    return res.json();
  },

  // Delete material
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete material');
    return res.json();
  }
};