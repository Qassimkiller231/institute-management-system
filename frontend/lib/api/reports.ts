import { apiFetch, API_URL, getHeaders } from './client';

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
  getTeacherDashboard: (params: { teacherId: string; termId?: string }) => {
    let path = `/reports/dashboard/teacher?teacherId=${params.teacherId}`;
    if (params.termId) path += `&termId=${params.termId}`;
    return apiFetch(path);
  },

  getAttendanceReport: (params: { groupId?: string; termId?: string; startDate?: string; endDate?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.groupId) searchParams.append('groupId', params.groupId);
    if (params.termId) searchParams.append('termId', params.termId);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    return apiFetch(`/reports/attendance?${searchParams.toString()}`);
  },

  // Returns a PDF (Blob), so it can't use apiFetch's JSON handling.
  generateGroupReport: async (groupId: string, type: 'attendance' | 'progress' | 'performance') => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/${type}`, {
      headers: getHeaders(true),
    });
    if (!res.ok) throw new Error(`Failed to generate ${type} report`);
    return res.blob();
  },
};
