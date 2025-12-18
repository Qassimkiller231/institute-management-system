'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { getTeacherId } from '@/lib/authStorage';
import { groupsAPI, reportsAPI } from '@/lib/api';

interface Group {
  id: string;
  groupCode: string;
  name: string | null;
}

export default function TeacherReportsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [reportType, setReportType] = useState<'attendance' | 'progress' | 'performance'>('attendance');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const teacherId = getTeacherId();
      if (!teacherId) return;

      const data = await groupsAPI.getAll({ teacherId });
      setGroups(data.data || []);
    } catch (err) {
      // console.error('Error fetching groups:', err);
    }
  };

  const generateReport = async () => {
    if (!selectedGroup) {
      alert('Please select a group');
      return;
    }

    setLoading(true);
    try {

      const blob = await reportsAPI.generateGroupReport(selectedGroup, reportType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // console.error('Error generating report:', err);
      alert('Failed to generate report. This feature is coming soon.');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/teacher')}
            className="mb-4 text-purple-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Reports</h1>
          <p className="text-purple-100">Generate reports for your groups</p>
        </div>
      </div>
    );
  };

  /**
   * Render report type selection buttons
   */
  const renderReportTypeButtons = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Report Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setReportType('attendance')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              reportType === 'attendance'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-gray-900">Attendance Report</div>
            <div className="text-sm text-gray-600">View attendance statistics</div>
          </button>

          <button
            onClick={() => setReportType('progress')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              reportType === 'progress'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">📈</div>
            <div className="font-semibold text-gray-900">Progress Report</div>
            <div className="text-sm text-gray-600">Student progress overview</div>
          </button>

          <button
            onClick={() => setReportType('performance')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              reportType === 'performance'
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900">Performance Report</div>
            <div className="text-sm text-gray-600">Overall class performance</div>
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render group selector
   */
  const renderGroupSelector = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Group *
        </label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a group...</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.groupCode} {group.name ? `- ${group.name}` : ''}
            </option>
          ))}
        </select>
      </div>
    );
  };

  /**
   * Render generate button
   */
  const renderGenerateButton = () => {
    return (
      <button
        onClick={generateReport}
        disabled={loading || !selectedGroup}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
          loading || !selectedGroup
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generating Report...
          </span>
        ) : (
          'Generate Report'
        )}
      </button>
    );
  };

  /**
   * Render info box
   */
  const renderInfoBox = () => {
    return (
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Reports will be downloaded as PDF files. Make sure you have selected a group before generating.
        </p>
      </div>
    );
  };

  /**
   * Render stats grid
   */
  const renderStatsGrid = () => {
    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Groups</h3>
          <p className="text-3xl font-bold text-blue-600">{groups.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Reports</h3>
          <p className="text-sm text-gray-600">Generate detailed analytics</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Insights</h3>
          <p className="text-sm text-gray-600">Track student performance</p>
        </div>
      </div>
    );
  };

  /**
   * Render main reports page
   */
  const renderReportsPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Report</h2>

            {renderReportTypeButtons()}
            {renderGroupSelector()}
            {renderGenerateButton()}
            {renderInfoBox()}
          </div>

          {renderStatsGrid()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return renderReportsPage();
}