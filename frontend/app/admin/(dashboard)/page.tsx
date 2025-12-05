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
      console.log('Dashboard response:', response); // Debug log
      
      if (response.success && response.dashboard) {
        setStats(response.dashboard);
      } else {
        setError('No dashboard data received');
      }
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
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
  }

  if (!stats) return null;

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-blue-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overview.totalStudents || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">Registered students</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-green-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overview.totalTeachers || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">Active teachers</p>
          </div>

          {/* Active Groups */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-purple-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Groups</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overview.activeGroups || 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">Running classes</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-l-4 border-emerald-600">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{(stats.overview.totalRevenue || 0).toFixed(2)} <span className="text-xl text-gray-600">BD</span></p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">Total collected</p>
          </div>
        </div>

        {/* Enrollment Stats */}
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

        {/* Attendance */}
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

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/students')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition group"
            >
              <div className="mb-3">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900">Manage Students</div>
              <div className="text-sm text-gray-500 mt-1">Add, edit, view students</div>
            </button>

            <button
              onClick={() => router.push('/admin/teachers')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition group"
            >
              <div className="mb-3">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-green-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900">Manage Teachers</div>
              <div className="text-sm text-gray-500 mt-1">Add, edit, view teachers</div>
            </button>

            <button
              onClick={() => router.push('/admin/groups')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition group"
            >
              <div className="mb-3">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-purple-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900">Manage Groups</div>
              <div className="text-sm text-gray-500 mt-1">Create, edit groups</div>
            </button>

            <button
              onClick={() => router.push('/admin/enrollments')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition group"
            >
              <div className="mb-3">
                <svg className="w-10 h-10 text-gray-400 group-hover:text-orange-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="font-semibold text-gray-900">Enrollments</div>
              <div className="text-sm text-gray-500 mt-1">Manage enrollments</div>
            </button>
          </div>
        </div>
      </div>
    );
}