"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getStudentId } from "@/lib/authStorage";
import { attendanceAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

interface AttendanceRecord {
  id: string;
  status: string;
  markedAt: string;
  notes: string | null;
  classSession: {
    sessionDate: string;
    sessionNumber: number;
    startTime: string;
    endTime: string;
    group: {
      name: string;
    };
  };
}

interface AttendanceStats {
  totalSessions: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  >("all");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const studentId = getStudentId();

        if (!studentId) {
          router.push("/login");
          return;
        }

        const data = await attendanceAPI.getByStudent(studentId);
        const records = data.data || [];
        setRecords(records);

        // Calculate stats
        const totalSessions = records.length;
        const present = records.filter((r: AttendanceRecord) => r.status === "PRESENT").length;
        const absent = records.filter((r: AttendanceRecord) => r.status === "ABSENT").length;
        const late = records.filter((r: AttendanceRecord) => r.status === "LATE").length;
        const excused = records.filter((r: AttendanceRecord) => r.status === "EXCUSED").length;
        const percentage = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

        setStats({ totalSessions, present, absent, late, excused, percentage });
      } catch (err) {
        // console.error("Error fetching attendance:", err);
        setError(err instanceof Error ? err.message : "Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [router]);

  const getFilteredRecords = () => {
    if (filterStatus === "all") return records;
    return records.filter((r) => r.status === filterStatus);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200";
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXCUSED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "✓";
      case "ABSENT":
        return "✗";
      case "LATE":
        return "⏰";
      case "EXCUSED":
        return "E";
      default:
        return "?";
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80)
      return { bg: "bg-green-100", text: "text-green-800", badge: "On Track" };
    if (percentage >= 70)
      return { bg: "bg-yellow-100", text: "text-yellow-800", badge: "Warning" };
    return { bg: "bg-red-100", text: "text-red-800", badge: "At Risk" };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.push("/student")}
            className="mb-4 text-green-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">My Attendance</h1>
          <p className="text-green-100">
            Track your class attendance and participation
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render attendance stats card
   */
  const renderStats = () => {
    if (!stats) return null;
    const statusColors = getStatusColor(stats.percentage);

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Percentage */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Attendance Rate
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke={
                      stats.percentage >= 80
                        ? "#10b981"
                        : stats.percentage >= 70
                        ? "#f59e0b"
                        : "#ef4444"
                    }
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 56 * (1 - stats.percentage / 100)
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {stats.percentage}%
                  </span>
                </div>
              </div>
              <div>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors.bg} ${statusColors.text}`}
                >
                  {statusColors.badge}
                </span>
                <p className="text-gray-600 mt-2">
                  {stats.present} of {stats.totalSessions} sessions attended
                </p>
              </div>
            </div>
          </div>

          {/* Right: Breakdown */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Breakdown
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span className="text-gray-700">Present</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.present}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                    ✗
                  </span>
                  <span className="text-gray-700">Absent</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.absent}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                    ⏰
                  </span>
                  <span className="text-gray-700">Late</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.late}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                    E
                  </span>
                  <span className="text-gray-700">Excused</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {stats.excused}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        {stats.percentage < 80 && (
          <div
            className={`mt-6 ${
              statusColors.bg
            } border ${statusColors.text.replace(
              "text-",
              "border-"
            )} rounded-lg p-4`}
          >
            <p className="font-semibold mb-1">⚠️ Attendance Alert</p>
            <p className="text-sm">
              Your attendance is below 80%. Please improve your attendance to
              stay on track with your learning goals.
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilters = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({records.length})
          </button>
          <button
            onClick={() => setFilterStatus("PRESENT")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "PRESENT"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Present ({stats?.present || 0})
          </button>
          <button
            onClick={() => setFilterStatus("ABSENT")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "ABSENT"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Absent ({stats?.absent || 0})
          </button>
          <button
            onClick={() => setFilterStatus("LATE")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "LATE"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Late ({stats?.late || 0})
          </button>
          <button
            onClick={() => setFilterStatus("EXCUSED")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === "EXCUSED"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Excused ({stats?.excused || 0})
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render single attendance record
   */
  const renderAttendanceRecord = (record: AttendanceRecord) => {
    return (
      <div
        key={record.id}
        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${getStatusBadge(
                record.status
              )}`}
            >
              {getStatusIcon(record.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">
                  Session {record.classSession.sessionNumber}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  📅 {formatDate(record.classSession.sessionDate)}
                </span>
                <span className="flex items-center gap-1">
                  ⏰ {formatTime(record.classSession.startTime)} -{" "}
                  {formatTime(record.classSession.endTime)}
                </span>
                <span className="flex items-center gap-1">
                  📚 {record.classSession.group.name}
                </span>
              </div>
              {record.notes && (
                <p className="text-sm text-gray-500 mt-2">
                  Note: {record.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render attendance records list
   */
  const renderRecords = () => {
    const filteredRecords = getFilteredRecords();

    if (filteredRecords.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">
            No attendance records found.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {filteredRecords
          .sort(
            (a, b) =>
              new Date(b.classSession.sessionDate).getTime() -
              new Date(a.classSession.sessionDate).getTime()
          )
          .map((record) => renderAttendanceRecord(record))}
      </div>
    );
  };

  /**
   * Render main attendance page
   */
  const renderAttendancePage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderStats()}
          {renderFilters()}
          {renderRecords()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) {
    return <LoadingState message="Loading attendance records..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Error Loading Attendance"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!stats) return null;

  return renderAttendancePage();
}
