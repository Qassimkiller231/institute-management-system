import { API_URL, getHeaders } from './client';

export interface Enrollment {
  id: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  studentId: string;
  groupId: string;
  student: {
    firstName: string;
    lastName: string;
  };
  group: {
    groupCode: string;
    name?: string;
  };
}

export interface CreateEnrollmentDto {
  studentId: string;
  groupId: string;
  enrollmentDate?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
}

export interface UpdateEnrollmentDto {
  groupId?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
}

export const enrollmentsAPI = {
  // Get all enrollments with optional filters
  getAll: async (params?: { groupId?: string; status?: string; studentId?: string }) => {
    let url = `${API_URL}/enrollments`;
    const queryParams: string[] = [];
    if (params?.groupId) queryParams.push(`groupId=${params.groupId}`);
    if (params?.status) queryParams.push(`status=${params.status}`);
    if (params?.studentId) queryParams.push(`studentId=${params.studentId}`);
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  // Get by student
  getByStudent: async (studentId: string) => {
    const res = await fetch(`${API_URL}/enrollments?studentId=${studentId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  // Get by group
  getByGroup: async (groupId: string) => {
    const res = await fetch(`${API_URL}/enrollments?groupId=${groupId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch enrollments');
    return res.json();
  },

  // Create enrollment
  create: async (data: CreateEnrollmentDto) => {
    const res = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create enrollment');
    }
    return res.json();
  },

  // Update enrollment
  update: async (id: string, data: UpdateEnrollmentDto) => {
    const res = await fetch(`${API_URL}/enrollments/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update enrollment');
    }
    return res.json();
  },

  // Delete enrollment
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/enrollments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete enrollment');
    return res.json();
  }
};