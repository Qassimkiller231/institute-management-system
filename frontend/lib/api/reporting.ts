import { apiFetch, API_URL, getHeaders } from './client';

export const reportingAPI = {
  // Dashboard Analytics
  getDashboardAnalytics: (termId?: string) =>
    apiFetch(termId ? `/reports/dashboard/admin?termId=${termId}` : '/reports/dashboard/admin'),

  getTrends: (monthsBack: number = 6) =>
    apiFetch(`/reports/trends?monthsBack=${monthsBack}`),

  getAnalyticsCharts: () => apiFetch('/reports/charts'),

  // Financial Analytics
  getFinancialAnalytics: (termId?: string) =>
    apiFetch(termId ? `/reports/financial/term/${termId}` : '/reports/financial/overall'),

  // Program Analytics
  getProgramAnalytics: (programId?: string) =>
    apiFetch(programId ? `/analytics/program?programId=${programId}` : '/analytics/program'),

  // Performance Reports
  getPerformanceReports: (params?: { groupId?: string; studentId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.groupId) queryParams.append('groupId', params.groupId);
    if (params?.studentId) queryParams.append('studentId', params.studentId);
    const qs = queryParams.toString();
    return apiFetch(`/reports/performance${qs ? `?${qs}` : ''}`);
  },

  // Attendance Reports
  getAttendanceReport: (groupId: string) =>
    apiFetch(`/reports/group/${groupId}/attendance/preview`),

  downloadAttendancePDF: async (groupId: string, groupCode: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/attendance`, {
      headers: getHeaders(true),
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
  getProgressReport: (groupId: string) =>
    apiFetch(`/reports/group/${groupId}/progress/preview`),

  downloadProgressPDF: async (groupId: string, groupCode: string) => {
    const res = await fetch(`${API_URL}/reports/group/${groupId}/progress`, {
      headers: getHeaders(true),
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
  },
};
