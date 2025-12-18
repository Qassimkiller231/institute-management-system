'use client';

import { useState, useEffect } from 'react';
import { reportingAPI, groupsAPI, programsAPI } from '@/lib/api';

export default function AttendanceReportsPage() {
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    loadPrograms();
    loadGroups();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await programsAPI.getAll(true);
      setPrograms(data.data || []);
    } catch (err: any) {
      alert('Error loading programs: ' + err.message);
    }
  };

  const loadGroups = async () => {
    try {
      const data = await groupsAPI.getAll({ isActive: true });
      setGroups(data.data || []);
    } catch (err: any) {
      alert('Error loading groups: ' + err.message);
    }
  };

  const generateReport = async () => {
    if (!selectedGroup) {
      alert('Please select a group');
      return;
    }

    try {
      setLoading(true);
      const result = await reportingAPI.getAttendanceReport(selectedGroup);
      setReportData(result.data);
    } catch (err: any) {
      alert('Error generating report: ' + err.message);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!selectedGroup || !reportData) return;

    try {
      await reportingAPI.downloadAttendancePDF(selectedGroup, reportData.groupCode);
    } catch (err: any) {
      alert('Error exporting PDF: ' + err.message);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Reports</h1><p className="text-gray-700">Generate and view attendance reports by group</p></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-4">Select Group</h2><div className="grid md:grid-cols-3 gap-4"><div><label className="block text-sm font-medium text-gray-900 mb-2">Program</label><select value={selectedProgram} onChange={(e) => { setSelectedProgram(e.target.value); setSelectedGroup(''); setReportData(null); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="">All Programs</option>{programs.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-900 mb-2">Group</label><select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="">Select a group</option>{groups.filter(group => !selectedProgram || group.term?.programId === selectedProgram).map(group => <option key={group.id} value={group.id}>{group.groupCode} - {group.name || 'Unnamed'}</option>)}</select></div><div className="flex items-end"><button onClick={generateReport} disabled={loading || !selectedGroup} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? 'Generating...' : 'Generate Report'}</button></div></div></div>
  );

  const renderSummaryStats = () => (
    <div className="grid md:grid-cols-3 gap-4 mb-6"><div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded"><p className="text-sm font-medium text-gray-700">Total Sessions</p><p className="text-3xl font-bold text-gray-900">{reportData.totalSessions}</p></div><div className="bg-green-50 border-l-4 border-green-600 p-4 rounded"><p className="text-sm font-medium text-gray-700">Average Attendance</p><p className="text-3xl font-bold text-gray-900">{reportData.averageAttendance}%</p></div><div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded"><p className="text-sm font-medium text-gray-700">Total Students</p><p className="text-3xl font-bold text-gray-900">{reportData.totalStudents}</p></div></div>
  );

  const renderStudentRow = (student: any, idx: number) => (
    <tr key={idx} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td><td className="px-6 py-4 text-center text-sm text-gray-900">{student.present}</td><td className="px-6 py-4 text-center text-sm text-gray-900">{student.absent}</td><td className="px-6 py-4 text-center text-sm text-gray-900">{student.late}</td><td className="px-6 py-4 text-center"><span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${student.percentage >= 90 ? 'bg-green-100 text-green-800' : student.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{student.percentage}%</span></td></tr>
  );

  const renderStudentTable = () => (
    <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Present</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Absent</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Late</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Attendance %</th></tr></thead><tbody className="divide-y divide-gray-200">{reportData.students.map(renderStudentRow)}</tbody></table></div>
  );

  const renderReport = () => !reportData ? null : (
    <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Attendance Report - {reportData.groupCode}</h2><button onClick={exportPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📄 Export PDF</button></div>{renderSummaryStats()}{renderStudentTable()}</div>
  );

  const renderEmptyState = () => !reportData && !loading ? (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"><p className="text-gray-600 text-lg">Select a group and click "Generate Report" to view attendance data</p></div>
  ) : null;

  // ========================================
  // MAIN RENDER
  // ========================================


  return (
    <div>
      {renderHeader()}


      {renderFilters()}

      {renderReport()}

      {renderEmptyState()}
    </div>
  );
}
