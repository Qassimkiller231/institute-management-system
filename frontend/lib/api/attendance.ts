import { API_URL, getHeaders } from './client';

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
  // Get all attendance records
  getAll: async () => {
    const res = await fetch(`${API_URL}/attendance`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  // Get by group
  getByGroup: async (groupId: string) => {
    const res = await fetch(`${API_URL}/attendance?groupId=${groupId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  // Get by session
  getBySession: async (sessionId: string) => {
    const res = await fetch(`${API_URL}/attendance/session/${sessionId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  // Get by student
  getByStudent: async (studentId: string) => {
    const res = await fetch(`${API_URL}/attendance/student/${studentId}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch attendance');
    return res.json();
  },

  // Mark attendance
  mark: async (data: MarkAttendanceDto) => {
    const res = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to mark attendance');
    }
    return res.json();
  },

  // Bulk mark attendance
  markBulk: async (data: { classSessionId: string; records: Array<{ studentId: string; status: string; notes?: string }>; teacherId: string }) => {
    const res = await fetch(`${API_URL}/attendance/bulk`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to mark bulk attendance');
    }
    return res.json();
  },

  // Update attendance
  update: async (id: string, data: Partial<MarkAttendanceDto>) => {
    const res = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to update attendance');
    }
    return res.json();
  },

  // Delete attendance
  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/attendance/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to delete attendance');
    return res.json();
  }
};