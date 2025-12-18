'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import { studentsAPI, attendanceAPI, criteriaAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';

// ========================================
// TYPES
// ========================================

interface AttendanceStats {
  totalSessions: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

interface AttendanceRecord {
  id: string;
  markedAt: string;
  status: string;
  classSession: {
    sessionDate: string;
    topic?: string;
    group: {
      name: string;
    };
  };
}

interface ProgressCriteria {
  id: string;
  criterion: string;
  completed: boolean;
  completedAt?: string;
}

interface Enrollment {
  id: string;
  status: string;
  group: {
    id: string;
    name: string;
    level: {
      id: string;
      name: string;
    };
    term: {
      id: string;
      name: string;
      startDate: string;
      endDate: string;
    };
    venue?: {
      id: string;
      name: string;
    };
  };
}

interface StudentDetail {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  email?: string;
  currentLevel?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  isActive: boolean;
  enrollments?: Enrollment[];
}

type TabType = 'overview' | 'enrollments' | 'attendance' | 'progress';

export default function ChildDetailPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [progressData, setProgressData] = useState<ProgressCriteria[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Load student details on mount
   */
  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  /**
   * Effect: Load tab-specific data when tab changes
   */
  useEffect(() => {
    if (activeTab === 'attendance' && !attendanceStats) {
      fetchAttendanceData();
    }
    if (activeTab === 'progress' && progressData.length === 0) {
      fetchProgressData();
    }
  }, [activeTab]);

  // ========================================
  // DATA LOADING
  // ========================================
  
  /**
   * Fetch student details from API
   */
  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await studentsAPI.getById(studentId);
      setStudent(data.data);
    } catch (err: any) {
      // console.error('Error loading student:', err); // Debug
      // Could show error message to user instead of alert
      router.push('/parent/children');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch attendance data and stats
   */
  const fetchAttendanceData = async () => {
    try {
      setLoadingAttendance(true);
      
      // Fetch attendance stats and records in parallel
      const [statsRes, recordsRes] = await Promise.all([
        attendanceAPI.getStudentStats(studentId),
        attendanceAPI.getByStudent(studentId)
      ]);

      if (statsRes.data) {
        setAttendanceStats(statsRes.data);
      }

      if (recordsRes.data) {
        setAttendanceRecords(recordsRes.data || []);
      }
    } catch (err: any) {
      // console.error('Error loading attendance:', err); // Debug
    } finally {
      setLoadingAttendance(false);
    }
  };

  /**
   * Fetch progress/criteria data
   */
  const fetchProgressData = async () => {
    try {
      setLoadingProgress(true);
      
      // Get groupId or levelId from student's active enrollment
      const activeEnrollment = student?.enrollments?.find(e => e.status === 'ACTIVE');
      
      if (!activeEnrollment) {
        // console.log('No active enrollment found for progress tracking'); // Debug
        setProgressData([]);
        return;
      }

      const groupId = activeEnrollment.group.id;
      const levelId = activeEnrollment.group.level.id;

      const res = await criteriaAPI.getStudentProgress(studentId, {
        groupId,
        levelId
      } as any);

      if (res.data) {
        setProgressData(res.data.criteria || res.data || []);
      } else {
        setProgressData([]);
      }
    } catch (err: any) {
      // console.error('Error loading progress:', err); // Debug
      setProgressData([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth?: string): number | string => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Get color class for attendance status
   */
  const getAttendanceStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PRESENT':
        return 'bg-green-100 text-green-800';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ABSENT':
        return 'bg-red-100 text-red-800';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Safely format date string
   */
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render back button
   */
  const renderBackButton = () => {
    return (
      <button
        onClick={() => router.push('/parent/children')}
        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Children
      </button>
    );
  };

  /**
   * Render student header with name and status
   */
  const renderStudentHeader = () => {
    if (!student) return null;

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {student.firstName} {student.secondName} {student.thirdName}
            </h1>
            <div className="flex items-center gap-4 text-blue-100">
              <span>CPR: {student.cpr}</span>
              {student.currentLevel && (
                <span className="px-3 py-1 bg-white/20 rounded-full text-white font-medium">
                  {student.currentLevel}
                </span>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            student.isActive
              ? 'bg-green-400 text-green-900'
              : 'bg-red-400 text-red-900'
          }`}>
            {student.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    );
  };

  /**
   * Render tab navigation
   */
  const renderTabs = () => {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: '📋' },
      { id: 'enrollments', label: 'Enrollments', icon: '📚' },
      { id: 'attendance', label: 'Attendance', icon: '✓' },
      { id: 'progress', label: 'Progress', icon: '📈' }
    ];

    return (
      <div className="border-b">
        <nav className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  /**
   * Render overview tab content
   */
  const renderOverviewTab = () => {
    if (!student) return null;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex">
                <span className="text-gray-600 w-32">Full Name:</span>
                <span className="text-gray-900 font-medium">
                  {student.firstName} {student.secondName} {student.thirdName}
                </span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">CPR:</span>
                <span className="text-gray-900">{student.cpr}</span>
              </div>
              <div className="flex">
                <span className="text-gray-600 w-32">Age:</span>
                <span className="text-gray-900">{calculateAge(student.dateOfBirth)} years</span>
              </div>
              {student.dateOfBirth && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Date of Birth:</span>
                  <span className="text-gray-900">{formatDate(student.dateOfBirth)}</span>
                </div>
              )}
              {student.gender && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Gender:</span>
                  <span className="text-gray-900">{student.gender}</span>
                </div>
              )}
              {student.nationality && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Nationality:</span>
                  <span className="text-gray-900">{student.nationality}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {student.email && (
                <div className="flex">
                  <span className="text-gray-600 w-32">Email:</span>
                  <span className="text-gray-900">{student.email}</span>
                </div>
              )}
              <div className="flex">
                <span className="text-gray-600 w-32">Status:</span>
                <span className={`font-medium ${student.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render single enrollment card
   */
  const renderEnrollmentCard = (enrollment: Enrollment) => {
    return (
      <div key={enrollment.id} className="border rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">{enrollment.group.name}</h4>
            <p className="text-sm text-gray-600">{enrollment.group.level.name}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            enrollment.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {enrollment.status}
          </span>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Term: {enrollment.group.term.name}</p>
          <p>Period: {formatDate(enrollment.group.term.startDate)} - {formatDate(enrollment.group.term.endDate)}</p>
          {enrollment.group.venue && (
            <p>Venue: {enrollment.group.venue.name}</p>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render enrollments tab content
   */
  const renderEnrollmentsTab = () => {
    if (!student) return null;

    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Enrollments</h3>
        {student.enrollments && student.enrollments.length > 0 ? (
          <div className="space-y-4">
            {student.enrollments.map((enrollment) => renderEnrollmentCard(enrollment))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No active enrollments</p>
        )}
      </div>
    );
  };

  /**
   * Render attendance stats cards
   */
  const renderAttendanceStats = () => {
    if (!attendanceStats) return null;

    const stats = [
      { label: 'Total Classes', value: attendanceStats.totalSessions, color: 'blue' },
      { label: 'Present', value: attendanceStats.present, color: 'green' },
      { label: 'Late', value: attendanceStats.late, color: 'yellow' },
      { label: 'Absent', value: attendanceStats.absent, color: 'red' },
      { label: 'Attendance Rate', value: `${attendanceStats.attendanceRate.toFixed(1)}%`, color: 'indigo' },
    ];

    return (
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-${stat.color}-50 rounded-lg p-4`}>
            <p className={`text-${stat.color}-600 text-sm font-medium`}>{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.value}</p>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Render single attendance record
   */
  const renderAttendanceRecord = (record: AttendanceRecord) => {
    return (
      <div key={record.id} className="border rounded-lg p-3 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900">{record.classSession?.group?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600">
            {record.classSession?.topic || 'Class'} - {formatDate(record.classSession?.sessionDate)}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(record.status)}`}>
          {record.status}
        </span>
      </div>
    );
  };

  /**
   * Render attendance tab content
   */
  const renderAttendanceTab = () => {
    if (loadingAttendance) {
      return <LoadingState message="Loading attendance..." />;
    }

    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Records</h3>
        
        {renderAttendanceStats()}

        {attendanceRecords.length > 0 ? (
          <div className="space-y-2">
            {attendanceRecords
              .filter(record => record.classSession && record.classSession.sessionDate)
              .slice(0, 10)
              .map((record) => renderAttendanceRecord(record))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No attendance records found</p>
        )}
      </div>
    );
  };

  /**
   * Render progress summary card
   */
  const renderProgressSummary = () => {
    if (progressData.length === 0) return null;

    const completionRate = Math.round((progressData.filter(p => p.completed).length / progressData.length) * 100);
    const completedCount = progressData.filter(p => p.completed).length;

    return (
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white mb-6">
        <p className="text-sm mb-1">Completion Rate</p>
        <div className="flex items-center gap-4">
          <p className="text-3xl font-bold">{completionRate}%</p>
          <p className="text-sm">
            {completedCount} of {progressData.length} criteria completed
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render single progress criterion
   */
  const renderProgressCriterion = (criteria: ProgressCriteria) => {
    return (
      <div key={criteria.id} className="border rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            criteria.completed ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {criteria.completed && <span className="text-white text-sm">✓</span>}
          </div>
          <p className={`font-medium ${criteria.completed ? 'text-gray-900' : 'text-gray-600'}`}>
            {criteria.criterion}
          </p>
        </div>
        {criteria.completedAt && (
          <span className="text-xs text-gray-500">
            {formatDate(criteria.completedAt)}
          </span>
        )}
      </div>
    );
  };

  /**
   * Render progress tab content
   */
  const renderProgressTab = () => {
    if (loadingProgress) {
      return <LoadingState message="Loading progress..." />;
    }

    if (progressData.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No progress data available</p>
          <button
            onClick={() => router.push(`/parent/children/${studentId}/progress`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Full Progress Report
          </button>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
        
        {renderProgressSummary()}

        <div className="space-y-2">
          {progressData.map((criteria) => renderProgressCriterion(criteria))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push(`/parent/children/${studentId}/progress`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Full Progress Report
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render tab content based on active tab
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'enrollments':
        return renderEnrollmentsTab();
      case 'attendance':
        return renderAttendanceTab();
      case 'progress':
        return renderProgressTab();
      default:
        return null;
    }
  };

  /**
   * Render main child detail page
   */
  const renderChildDetailPage = () => {
    return (
      <div className="space-y-6">
        {renderBackButton()}
        {renderStudentHeader()}

        <div className="bg-white rounded-lg shadow">
          {renderTabs()}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading || !student) {
    return <LoadingState message="Loading student details..." />;
  }

  return renderChildDetailPage();
}
