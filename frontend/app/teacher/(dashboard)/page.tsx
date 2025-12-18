"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout, getTeacherId } from "@/lib/authStorage";
import { reportsAPI, speakingSlotAPI, type DashboardStats } from "@/lib/api";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";

interface AssignedGroup {
  groupId: string;
  groupName: string;
  totalStudents: number;
  averageAttendance: number;
  upcomingClasses: number;
}

interface TodayClass {
  groupName: string;
  startTime: string;
  endTime: string;
  date: string;
  venue: string | null;
  hall: string | null;
}

interface PendingTasks {
  attendanceToMark: number;
  progressToUpdate: number;
  speakingTestsScheduled: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");
  const [speakingTestsCount, setSpeakingTestsCount] = useState(0);
  
  useEffect(() => {
    loadSpeakingTestsCount();
  }, []);
  
  const loadSpeakingTestsCount = async () => {
    const teacherId = getTeacherId();
    if (!teacherId) return;
    
    try {
      const result = await speakingSlotAPI.getByTeacher(teacherId);
      const booked = result.data.filter(
        (s: any) => s.status === "BOOKED"
      ).length;
      setSpeakingTestsCount(booked);
    } catch (err) {
      // console.error('Error loading speaking tests:', err);
    }
  };
  
  useEffect(() => {
    fetchDashboard();
  }, [selectedTerm]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();

      // Check if teacherId exists
      if (!teacherId) {
        setError("Teacher ID not found. Please log in again.");
        router.push("/login");
        return;
      }

      const params: { teacherId: string; termId?: string } = { teacherId };
      if (selectedTerm) {
        params.termId = selectedTerm;
      }

      const data = await reportsAPI.getTeacherDashboard(params);
      setStats(data.dashboard);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Session expired')) {
        router.push("/login");
      }
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
    if (!stats) return null;

    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Welcome, {stats.teacherName}</p>
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
    );
  };

  /**
   * Render stats grid
   */
  const renderStatsGrid = () => {
    if (!stats) return null;

    const totalStudents = stats.assignedGroups.reduce(
      (sum, g) => sum + g.totalStudents,
      0
    );

    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Assigned Groups */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">My Groups</h3>
            <span className="text-3xl">👥</span>
          </div>
          <p className="text-4xl font-bold text-blue-600">
            {stats.assignedGroups.length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Assigned groups</p>
        </div>

        {/* Total Students */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">My Students</h3>
            <span className="text-3xl">🎓</span>
          </div>
          <p className="text-4xl font-bold text-green-600">
            {totalStudents}
          </p>
          <p className="text-sm text-gray-500 mt-2">Total students</p>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 font-medium">Today's Classes</h3>
            <span className="text-3xl">📅</span>
          </div>
          <p className="text-4xl font-bold text-purple-600">
            {stats.todaySchedule.length}
          </p>
          <p className="text-sm text-gray-500 mt-2">Scheduled today</p>
        </div>
      </div>
    );
  };

  /**
   * Render single session card
   */
  const renderSessionCard = (session: TodayClass, index: number) => {
    return (
      <div
        key={index}
        className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
      >
        <div>
          <p className="font-semibold text-gray-900">
            {session.groupName}
          </p>
          <p className="text-sm text-gray-600">
            {session.startTime} - {session.endTime}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-700">
            {session.venue || "No venue"}
          </p>
          <p className="text-xs text-gray-500">
            {session.hall || ""}
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render today's schedule section
   */
  const renderTodaySchedule = () => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Today's Schedule
        </h2>
        {stats.todaySchedule.length > 0 ? (
          <div className="space-y-3">
            {stats.todaySchedule.map((session, index) => renderSessionCard(session, index))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No classes scheduled for today
          </p>
        )}
      </div>
    );
  };

  /**
   * Render single group card
   */
  const renderGroupCard = (group: AssignedGroup) => {
    return (
      <div
        key={group.groupId}
        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
      >
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {group.groupName}
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-600">Students:</p>
            <p className="font-semibold text-blue-600">
              {group.totalStudents}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Upcoming:</p>
            <p className="font-semibold text-purple-600">
              {group.upcomingClasses}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render my groups section
   */
  const renderGroupsSection = () => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Groups</h2>
        {stats.assignedGroups.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {stats.assignedGroups.map((group) => renderGroupCard(group))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No groups assigned yet
          </p>
        )}
      </div>
    );
  };

  /**
   * Render pending tasks section
   */
  const renderPendingTasks = () => {
    if (!stats) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Pending Tasks
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pendingTasks.attendanceToMark}
            </p>
            <p className="text-sm text-gray-600 mt-1">Attendance to Mark</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats.pendingTasks.progressToUpdate}
            </p>
            <p className="text-sm text-gray-600 mt-1">Progress to Update</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {speakingTestsCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Speaking Tests</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render main dashboard page
   */
  const renderDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderStatsGrid()}
          {renderTodaySchedule()}
          {renderGroupsSection()}
          {renderPendingTasks()}
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Error loading dashboard"
        message={error}
        onRetry={fetchDashboard}
      />
    );
  }

  if (!stats) return null;


  return renderDashboard();
}
