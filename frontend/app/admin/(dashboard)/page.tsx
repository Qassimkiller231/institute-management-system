'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';

interface DashboardStats {
  studentsCount: number;
  teachersCount: number;
  activeGroups: number;
  totalRevenue: number;
  enrollmentStats: {
    pendingTests: number;
    testCompleted: number;
    awaitingSpeaking: number;
    enrolled: number;
    withdrew: number;
  };
  averageAttendance: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
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
      const token = getToken();
      const url = selectedTerm 
        ? `http://localhost:3001/api/reports/dashboard/admin?termId=${selectedTerm}`
        : 'http://localhost:3001/api/reports/dashboard/admin';
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard');

      const data = await response.json();
      setStats(data.dashboard);
    } catch (err: any) {
      setError(err.message);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">The Function Institute Management System</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Students</h3>
              <span className="text-3xl">🎓</span>
            </div>
            <p className="text-4xl font-bold text-blue-600">{stats.studentsCount || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Registered students</p>
          </div>

          {/* Total Teachers */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Teachers</h3>
              <span className="text-3xl">👨‍🏫</span>
            </div>
            <p className="text-4xl font-bold text-green-600">{stats.teachersCount || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Active teachers</p>
          </div>

          {/* Active Groups */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Active Groups</h3>
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-purple-600">{stats.activeGroups || 0}</p>
            <p className="text-sm text-gray-500 mt-2">Running classes</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-medium">Total Revenue</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-4xl font-bold text-emerald-600">
              {(stats.totalRevenue || 0).toFixed(2)} BD
            </p>
            <p className="text-sm text-gray-500 mt-2">Total collected</p>
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
                style={{ width: `${stats.averageAttendance || 0}%` }}
              >
                {stats.averageAttendance || 0}%
              </div>
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.averageAttendance || 0}%</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Average attendance across all groups</p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/students')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-3">👨‍🎓</div>
              <div className="font-semibold text-gray-900">Manage Students</div>
              <div className="text-sm text-gray-500 mt-1">Add, edit, view students</div>
            </button>

            <button
              onClick={() => router.push('/admin/teachers')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-600 hover:bg-green-50 transition"
            >
              <div className="text-4xl mb-3">👩‍🏫</div>
              <div className="font-semibold text-gray-900">Manage Teachers</div>
              <div className="text-sm text-gray-500 mt-1">Add, edit, view teachers</div>
            </button>

            <button
              onClick={() => router.push('/admin/groups')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <div className="text-4xl mb-3">📚</div>
              <div className="font-semibold text-gray-900">Manage Groups</div>
              <div className="text-sm text-gray-500 mt-1">Create, edit groups</div>
            </button>

            <button
              onClick={() => router.push('/admin/enrollments')}
              className="p-6 border-2 border-gray-300 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition"
            >
              <div className="text-4xl mb-3">📝</div>
              <div className="font-semibold text-gray-900">Enrollments</div>
              <div className="text-sm text-gray-500 mt-1">Manage enrollments</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}