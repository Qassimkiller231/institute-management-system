import { API_URL, getHeaders } from './client';

// Export types for use in components
export interface DashboardStats {
  teacherId: string;
  teacherName: string;
  assignedGroups: Array<{
    groupId: string;
    groupName: string;
    totalStudents: number;
    averageAttendance: number;
    upcomingClasses: number;
  }>;
  todaySchedule: Array<{
    groupName: string;
    startTime: string;
    endTime: string;
    date: string;
    venue: string | null;
    hall: string | null;
  }>;
  pendingTasks: {
    attendanceToMark: number;
    progressToUpdate: number;
    speakingTestsScheduled: number;
  };
}

export const reportsAPI = {
  // Get teacher dashboard stats
  getTeacherDashboard: async (params: { teacherId: string; termId?: string }) => {
    let url = `${API_URL}/reports/dashboard/teacher?teacherId=${params.teacherId}`;
    if (params.termId) {
      url += `&termId=${params.termId}`;
    }
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error('Failed to fetch dashboard');
    }
    return res.json();
  },

  // Get attendance report
  getAttendanceReport: async (params: { groupId?: string; termId?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.groupId) searchParams.append('groupId', params.groupId);
    if (params.termId) searchParams.append('termId', params.termId);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const res = await fetch(`${API_URL}/reports/attendance?${searchParams.toString()}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  // Generate Group Reports (PDF)
  generateGroupReport: async (groupId: string, type: 'attendance' | 'progress' | 'performance') => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/${type}`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error(`Failed to generate ${type} report`);
    return res.blob();
  }
};
