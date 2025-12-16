import { API_URL, getHeaders } from './client';

export const reportingAPI = {
  // Dashboard Analytics
  getDashboardAnalytics: async (termId?: string) => {
    const url = termId
      ? `${API_URL}/reports/dashboard/admin?termId=${termId}`
      : `${API_URL}/reports/dashboard/admin`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
    return res.json();
  },

  // Financial Analytics
  getFinancialAnalytics: async (termId?: string) => {
    // Use overall endpoint for all terms, specific term endpoint otherwise
    const url = termId
      ? `${API_URL}/reports/financial/term/${termId}`
      : `${API_URL}/reports/financial/overall`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch financial analytics');
    return res.json();
  },

  // Program Analytics
  getProgramAnalytics: async (programId?: string) => {
    const url = programId
      ? `${API_URL}/analytics/program?programId=${programId}`
      : `${API_URL}/analytics/program`;
    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch program analytics');
    return res.json();
  },

  // Performance Reports
  getPerformanceReports: async (params?: { groupId?: string; studentId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.groupId) queryParams.append('groupId', params.groupId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);

    const url = queryParams.toString()
      ? `${API_URL}/reports/performance?${queryParams}`
      : `${API_URL}/reports/performance`;

    const res = await fetch(url, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch performance reports');
    return res.json();
  },

  // Attendance Reports
  getAttendanceReport: async (groupId: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/attendance/preview`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch attendance report');
    return res.json();
  },

  downloadAttendancePDF: async (groupId: string, groupCode: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/attendance`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to generate PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${groupCode}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Progress Reports
  getProgressReport: async (groupId: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/progress/preview`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to fetch progress report');
    return res.json();
  },

  downloadProgressPDF: async (groupId: string, groupCode: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/progress`, {
      headers: getHeaders(true)
    });
    if (!res.ok) throw new Error('Failed to generate PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${groupCode}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};