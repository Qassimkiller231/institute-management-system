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
  }
};
