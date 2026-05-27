import { apiFetch } from './client';

export interface Attendance {
  id: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  studentId: string;
  sessionId: string;
  student: {
    firstName: string;
    lastName: string;
  };
  session: {
    sessionDate: string;
    startTime: string;
    endTime: string;
  };
}

export interface MarkAttendanceDto {
  sessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export const attendanceAPI = {
  getAll: () => apiFetch('/attendance'),

  getByGroup: (groupId: string) => apiFetch(`/attendance?groupId=${groupId}`),

  getBySession: (sessionId: string) => apiFetch(`/attendance/session/${sessionId}`),

  getByStudent: (studentId: string) => apiFetch(`/attendance/student/${studentId}`),

  getStudentStats: (studentId: string) =>
    apiFetch(`/attendance/student/${studentId}/stats`),

  mark: (data: MarkAttendanceDto) =>
    apiFetch('/attendance', { method: 'POST', body: data }),

  markBulk: (data: {
    classSessionId: string;
    records: Array<{ studentId: string; status: string; notes?: string }>;
    teacherId: string;
  }) => apiFetch('/attendance/bulk', { method: 'POST', body: data }),

  update: (id: string, data: Partial<MarkAttendanceDto>) =>
    apiFetch(`/attendance/${id}`, { method: 'PUT', body: data }),

  delete: (id: string) => apiFetch(`/attendance/${id}`, { method: 'DELETE' }),

  // CSV upload: apiFetch detects FormData and omits the JSON Content-Type so
  // the browser sets the multipart boundary. (207 Multi-Status counts as ok.)
  uploadBulk: (formData: FormData) =>
    apiFetch('/attendance/bulk-upload', { method: 'POST', body: formData }),
};
