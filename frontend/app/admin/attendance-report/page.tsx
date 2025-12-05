'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface AttendanceData {
  studentName: string;
  groupCode: string;
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export default function AttendanceReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AttendanceData[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    groupId: '',
    termId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const token = getToken();
      const [groupsRes, termsRes] = await Promise.all([
        fetch('http://localhost:3001/api/groups', { headers: { Authorization: `Bearer ${token}` }}),
        fetch('http://localhost:3001/api/terms', { headers: { Authorization: `Bearer ${token}` }})
      ]);
      
      const groupsData = await groupsRes.json();
      const termsData = await termsRes.json();
      
      setGroups(groupsData.data || []);
      setTerms(termsData.data || []);
    } catch (err) {
      console.error('Error loading filters:', err);
    }
  };

  const generateReport = async () => {
    if (!filters.groupId && !filters.termId) {
      alert('Please select at least a group or term');
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams();
      if (filters.groupId) params.append('groupId', filters.groupId);
      if (filters.termId) params.append('termId', filters.termId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`http://localhost:3001/api/reports/attendance?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReportData(data.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;

    const headers = ['Student,Group,Total Sessions,Present,Absent,Late,Excused,Attendance %'];
    const rows = reportData.map(row => 
      `${row.studentName},${row.groupCode},${row.totalSessions},${row.present},${row.absent},${row.late},${row.excused},${row.percentage}%`
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Report</h1>
          <p className="text-gray-600">Generate detailed attendance reports</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Report Filters</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group</label>
              <select
                value={filters.groupId}
                onChange={(e) => setFilters({ ...filters, groupId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="">All Groups</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.groupCode} - {g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
              <select
                value={filters.termId}
                onChange={(e) => setFilters({ ...filters, termId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                <option value="">All Terms</option>
                {terms.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            {reportData.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export to CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Table */}
        {reportData.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Group</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Late</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Excused</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{row.studentName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.groupCode}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{row.totalSessions}</td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">{row.present}</td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold">{row.absent}</td>
                      <td className="px-6 py-4 text-sm text-yellow-600 font-semibold">{row.late}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{row.excused}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          row.percentage >= 80 ? 'bg-green-100 text-green-800' :
                          row.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && reportData.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-600">
            Select filters and click "Generate Report" to view attendance data
          </div>
        )}
      </main>
    </div>
  );
}
