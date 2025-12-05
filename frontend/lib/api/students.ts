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
}

export const studentsAPI = {
  // Get all students (admin) or by teacher (teacher)
  getAll: async (teacherId?: string) => {
    const url = teacherId 
      ? `${API_URL}/students?teacherId=${teacherId}`
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
  }
};

// For backward compatibility with old code using studentAPI
export const studentAPI = studentsAPI;