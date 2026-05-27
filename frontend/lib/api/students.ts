import { apiFetch } from './client';

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
  // Address fields
  area?: string;
  houseNo?: string;
  road?: string;
  block?: string;
  // Preference fields
  preferredTiming?: string;
  preferredCenter?: string;
  needsTransport?: boolean;
}

export const studentsAPI = {
  getAll: (filters: {
    teacherId?: string;
    levelId?: string;
    venueId?: string;
    isActive?: boolean;
    limit?: number;
    needsSpeakingTest?: boolean;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.teacherId) params.append('teacherId', filters.teacherId);
    if (filters.levelId) params.append('levelId', filters.levelId);
    if (filters.venueId) params.append('venueId', filters.venueId);
    if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters.limit) params.append('limit', String(filters.limit));
    if (filters.needsSpeakingTest) params.append('needsSpeakingTest', String(filters.needsSpeakingTest));
    const qs = params.toString();
    return apiFetch(`/students${qs ? `?${qs}` : ''}`);
  },

  getByTeacher: (teacherId: string) =>
    apiFetch(`/students?teacherId=${teacherId}`),

  getById: (id: string) => apiFetch(`/students/${id}`),

  // No auth — used during public registration.
  create: (data: CreateStudentDto) =>
    apiFetch('/students', { method: 'POST', body: data, auth: false }),

  update: (id: string, data: UpdateStudentDto) =>
    apiFetch(`/students/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/students/${id}`, { method: 'DELETE' }),

  // FormData upload: apiFetch omits the JSON Content-Type so the browser sets
  // the multipart boundary itself.
  uploadProfilePicture: (id: string, formData: FormData) =>
    apiFetch(`/students/${id}/profile-picture`, { method: 'POST', body: formData }),
};

// For backward compatibility with old code using studentAPI
export const studentAPI = studentsAPI;