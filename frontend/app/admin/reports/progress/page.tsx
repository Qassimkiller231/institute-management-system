'use client';

import { useState, useEffect } from 'react';
import { groupsAPI, reportingAPI, programsAPI } from '@/lib/api';

export default function ProgressReportsPage() {
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
      const result = await reportingAPI.getProgressReport(selectedGroup);
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
      await reportingAPI.downloadProgressPDF(selectedGroup, reportData.groupCode);
    } catch (err: any) {
      alert('Error exporting PDF: ' + err.message);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Reports</h1><p className="text-gray-700">Track student learning progress and criteria completion</p></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-4">Select Group</h2><div className="grid md:grid-cols-3 gap-4 mb-4"><div><label className="block text-sm font-medium text-gray-900 mb-2">Program</label><select value={selectedProgram} onChange={(e) => { setSelectedProgram(e.target.value); setSelectedGroup(''); setReportData(null); }} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="">All Programs</option>{programs.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-900 mb-2">Group</label><select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="">Select group</option>{groups.filter(group => !selectedProgram || group.term?.programId === selectedProgram).map(group => <option key={group.id} value={group.id}>{group.groupCode} - {group.name || 'Unnamed'}</option>)}</select></div><div className="flex items-end"><button onClick={generateReport} disabled={loading || !selectedGroup} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? 'Loading...' : 'Generate'}</button></div></div></div>
  );

  const renderOverallProgress = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-6 rounded-lg mb-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-700">Overall Progress</p><p className="text-4xl font-bold text-gray-900 mt-1">{reportData.overallProgress}%</p></div><div className="w-32 h-32"><svg viewBox="0 0 36 36" className="w-full h-full"><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" /><path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray={`${reportData.overallProgress}, 100`} /><text x="18" y="20.35" className="text-[0.5em] font-bold fill-gray-900" textAnchor="middle">{reportData.overallProgress}%</text></svg></div></div></div>
  );

  const renderCriteriaRow = (criterion: any, idx: number) => {
    const percentage = (criterion.completed / criterion.total) * 100;
    return (
      <div key={idx} className="bg-gray-50 p-4 rounded-lg"><div className="flex justify-between items-center mb-2"><span className="font-medium text-gray-900">{criterion.name}</span><span className="text-sm font-semibold text-gray-900">{criterion.completed} / {criterion.total} students ({percentage.toFixed(0)}%)</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} /></div></div>
    );
  };

  const renderCriteriaProgress = () => (
    <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Criteria Progress</h3>{reportData.criteria.map(renderCriteriaRow)}</div>
  );

  const renderReport = () => !reportData ? null : (
    <div className="bg-white rounded-lg shadow p-6"><div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-gray-900">Progress Report - {reportData.groupCode}</h2><button onClick={exportPDF} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📄 Export PDF</button></div>{renderOverallProgress()}{renderCriteriaProgress()}</div>
  );

  const renderEmptyState = () => !reportData && !loading ? (
    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center"><p className="text-gray-600 text-lg">Configure report settings and click "Generate" to view progress data</p></div>
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
