import { apiFetch } from './client';

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
  getAll: (params?: { groupId?: string; status?: string; studentId?: string }) => {
    const queryParams: string[] = [];
    if (params?.groupId) queryParams.push(`groupId=${params.groupId}`);
    if (params?.status) queryParams.push(`status=${params.status}`);
    if (params?.studentId) queryParams.push(`studentId=${params.studentId}`);
    const qs = queryParams.join('&');
    return apiFetch(`/enrollments${qs ? `?${qs}` : ''}`);
  },

  getByStudent: (studentId: string) =>
    apiFetch(`/enrollments?studentId=${studentId}`),

  getByGroup: (groupId: string) =>
    apiFetch(`/enrollments?groupId=${groupId}`),

  create: (data: CreateEnrollmentDto) =>
    apiFetch('/enrollments', { method: 'POST', body: data }),

  update: (id: string, data: UpdateEnrollmentDto) =>
    apiFetch(`/enrollments/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/enrollments/${id}`, { method: 'DELETE' }),
};
