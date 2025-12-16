import { API_URL, getHeaders } from './client';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: 'MALE' | 'FEMALE';
  cpr?: string;
  createdAt: string;
}

export interface CreateStudentDto {
  firstName: string;
  secondName?: string;
  thirdName?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  cpr: string;
  nationality?: string;
  currentLevel?: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE';
  cpr?: string;
  nationality?: string;
  isActive?: boolean;
  currentLevel?: string;
}

export const studentsAPI = {
  // Get all students (admin) or by teacher (teacher)
  getAll: async (filters: {
    teacherId?: string;
    levelId?: string;
    venueId?: string;
    isActive?: boolean;
    limit?: number; // Added limit for consistency with usage
    needsSpeakingTest?: boolean; // Added for speaking tests usage
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.levelId) params.append('levelId', filters.levelId);
    if (filters.venueId) params.append('venueId', filters.venueId);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.needsSpeakingTest) params.append('needsSpeakingTest', String(filters.needsSpeakingTest));

    const queryString = params.toString();
    const url = queryString
      ? `${API_URL}/students?${queryString}`
      : `${API_URL}/students`;

    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  // Get by teacher
  getByTeacher: async (teacherId: string) => {
    const res = await fetch(`${API_URL}/students?teacherId=${teacherId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/students/${id}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  // Create student (from old studentAPI)
  create: async (data: CreateStudentDto) => {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: getHeaders(false), // No auth for registration
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create student');
    }
    return res.json();
  },

  // Update student
  update: async (id: string, data: UpdateStudentDto) => {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update student');
    }
    return res.json();
  },

  // Delete student
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete student');
    return res.json();
  },

  // Upload profile picture
  uploadProfilePicture: async (id: string, formData: FormData) => {
    const res = await fetch(`${API_URL}/students/${id}/profile-picture`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    // Note: When sending FormData, do NOT set Content-Type header manually, let the browser set it with boundary
    if (!res.ok) throw new Error('Failed to upload profile picture');
    return res.json();
  }
};

// For backward compatibility with old code using studentAPI
export const studentAPI = studentsAPI;