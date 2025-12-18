'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportingAPI } from '@/lib/api';
interface DashboardStats {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    activeGroups: number;
    totalRevenue: number;
    activeEnrollments: number;
    pendingPayments: number;
  };
  enrollmentStats: {
    pendingTests: number;
    testCompleted: number;
    awaitingSpeaking: number;
    enrolled: number;
    withdrew: number;
  };
  attendanceOverview: {
    averageAttendance: number;
    atRiskStudents: number;
    excellentAttendance: number;
  };
  financialSummary: {
    collectedThisMonth: number;
    expectedThisMonth: number;
    collectionRate: number;
    overdueAmount: number;
  };
  recentActivity: Array<{
    action: string;
    description: string;
    timestamp: string;
    userId: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');

  useEffect(() => {
    fetchDashboard();
  }, [selectedTerm]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await reportingAPI.getDashboardAnalytics(selectedTerm);
      // console.log('Dashboard response:', response); // Debug log
      
      if (response.success && response.dashboard) {
        setStats(response.dashboard);
      } else {
        setError('No dashboard data received');
      }
    } catch (err: any) {
      // console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800 font-semibold">Error loading dashboard</p>
          <p className="text-red-600 mt-2">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render stat card
   */
  const renderStatCard = (config: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    borderColor: string;
    bgColor: string;
    textColor: string;
    subtitle: string;
  }) => {
    return (
      <div className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 ${config.borderColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{config.title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{config.value}</p>
          </div>
          <div className={`${config.bgColor} p-3 rounded-full`}>
            {config.icon}
          </div>
        </div>
        <p className="text-xs text-gray-500">{config.subtitle}</p>
      </div>
    );
  };

  /**
   * Render stats grid
   */
  const renderStatsGrid = () => {
    if (!stats) return null;

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {renderStatCard({
          title: "Total Students",
          value: stats.overview.totalStudents || 0,
          icon: (
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          borderColor: "border-blue-600",
          bgColor: "bg-blue-100",
          textColor: "text-blue-600",
          subtitle: "Registered students"
        })}

        {renderStatCard({
          title: "Total Teachers",
          value: stats.overview.totalTeachers || 0,
          icon: (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
          borderColor: "border-green-600",
          bgColor: "bg-green-100",
          textColor: "text-green-600",
          subtitle: "Active teachers"
        })}

        {renderStatCard({
          title: "Active Groups",
          value: stats.overview.activeGroups || 0,
          icon: (
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          borderColor: "border-purple-600",
          bgColor: "bg-purple-100",
          textColor: "text-purple-600",
          subtitle: "Running classes"
        })}

        {renderStatCard({
          title: "Total Revenue",
          value: `${(stats.overview.totalRevenue || 0).toFixed(2)} BD`,
          icon: (
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          borderColor: "border-emerald-600",
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-600",
          subtitle: "Total collected"
        })}
      </div>
    );
  };

  /**
   * Render enrollment stats
   */
  const renderEnrollmentStats = () => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enrollment Overview</h2>
        <div className="grid md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{stats.enrollmentStats?.pendingTests || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Tests In Progress</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.enrollmentStats?.awaitingSpeaking || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Awaiting Speaking</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.enrollmentStats?.testCompleted || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Tests Completed</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{stats.enrollmentStats?.enrolled || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Enrolled</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{stats.enrollmentStats?.withdrew || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Withdrew</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render attendance overview
   */
  const renderAttendanceOverview = () => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Overall Attendance</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 rounded-full h-8">
            <div
              className="bg-blue-600 h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all"
              style={{ width: `${stats.attendanceOverview.averageAttendance || 0}%` }}
            >
              {stats.attendanceOverview.averageAttendance || 0}%
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">{stats.attendanceOverview.averageAttendance || 0}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Average attendance across all groups</p>
      </div>
    );
  };

  /**
   * Render quick action button
   */
  const renderQuickActionButton = (config: {
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    hoverColor: string;
  }) => {
    return (
      <button
        onClick={config.onClick}
        className={`p-6 border-2 border-gray-300 rounded-lg hover:${config.hoverColor} transition group`}
      >
        <div className="mb-3">
          {config.icon}
        </div>
        <div className="font-semibold text-gray-900">{config.title}</div>
        <div className="text-sm text-gray-500 mt-1">{config.subtitle}</div>
      </button>
    );
  };

  /**
   * Render quick actions
   */
  const renderQuickActions = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {renderQuickActionButton({
            onClick: () => router.push('/admin/students'),
            icon: (
              <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            title: "Manage Students",
            subtitle: "Add, edit, view students",
            hoverColor: "border-blue-600 bg-blue-50"
          })}

          {renderQuickActionButton({
            onClick: () => router.push('/admin/teachers'),
            icon: (
              <svg className="w-10 h-10 text-gray-400 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ),
            title: "Manage Teachers",
            subtitle: "Add, edit, view teachers",
            hoverColor: "border-green-600 bg-green-50"
          })}

          {renderQuickActionButton({
            onClick: () => router.push('/admin/groups'),
            icon: (
              <svg className="w-10 h-10 text-gray-400 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: "Manage Groups",
            subtitle: "Create, edit groups",
            hoverColor: "border-purple-600 bg-purple-50"
          })}

          {renderQuickActionButton({
            onClick: () => router.push('/admin/enrollments'),
            icon: (
              <svg className="w-10 h-10 text-gray-400 group-hover:text-orange-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            title: "Enrollments",
            subtitle: "Manage enrollments",
            hoverColor: "border-orange-600 bg-orange-50"
          })}
        </div>
      </div>
    );
  };

  /**
   * Render main dashboard
   */
  const renderDashboard = () => {
    return (
      <div>
        {renderStatsGrid()}
        {renderEnrollmentStats()}
        {renderAttendanceOverview()}
        {renderQuickActions()}
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (!stats) return null;

  return renderDashboard();
}