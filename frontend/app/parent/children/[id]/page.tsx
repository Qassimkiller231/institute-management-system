'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface AttendanceStats {
  totalClasses: number;
  attended: number;
  late: number;
  absent: number;
  excused: number;
  attendanceRate: number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  session: {
    classType: string;
    description?: string;
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
  enrollments?: Array<{
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
  }>;
}

export default function ChildDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'attendance' | 'progress'>('overview');
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [progressData, setProgressData] = useState<ProgressCriteria[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  useEffect(() => {
    if (activeTab === 'attendance' && !attendanceStats) {
      fetchAttendanceData();
    }
    if (activeTab === 'progress' && progressData.length === 0) {
      fetchProgressData();
    }
  }, [activeTab]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`http://localhost:3001/api/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch student details');
      
      const data = await res.json();
      setStudent(data.data);
    } catch (err: any) {
      console.error('Error loading student:', err);
      alert('Error loading student details: ' + err.message);
      router.push('/parent/children');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoadingAttendance(true);
      const token = getToken();
      
      if (!token) return;

      // Fetch attendance stats
      const statsRes = await fetch(`http://localhost:3001/api/attendance/student/${studentId}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAttendanceStats(statsData.data);
      }

      // Fetch attendance records
      const recordsRes = await fetch(`http://localhost:3001/api/attendance/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setAttendanceRecords(recordsData.data || []);
      }
    } catch (err: any) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      setLoadingProgress(true);
      const token = getToken();
      
      if (!token) return;

      // Get groupId or levelId from student's active enrollment
      const activeEnrollment = student?.enrollments?.find(e => e.status === 'ACTIVE');
      
      if (!activeEnrollment) {
        console.log('No active enrollment found for progress tracking');
        setProgressData([]);
        return;
      }

      const groupId = activeEnrollment.group.id;
      const levelId = activeEnrollment.group.level.id;

      const res = await fetch(
        `http://localhost:3001/api/progress-criteria/student/${studentId}/progress?groupId=${groupId}&levelId=${levelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        setProgressData(data.data || []);
      } else {
        console.error('Failed to fetch progress:', res.status);
        setProgressData([]);
      }
    } catch (err: any) {
      console.error('Error loading progress:', err);
      setProgressData([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  const calculateAge = (dateOfBirth?: string) => {
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

  const getAttendanceStatusColor = (status: string) => {
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

  if (loading || !student) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading student details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/parent/children')}
        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
      >
        ← Back to Children
      </button>

      {/* Student Header */}
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'enrollments', label: 'Enrollments', icon: '📚' },
              { id: 'attendance', label: 'Attendance', icon: '✓' },
              { id: 'progress', label: 'Progress', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
                        <span className="text-gray-900">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
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
          )}

          {/* Enrollments Tab */}
          {activeTab === 'enrollments' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Enrollments</h3>
              {student.enrollments && student.enrollments.length > 0 ? (
                <div className="space-y-4">
                  {student.enrollments.map((enrollment) => (
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
                        <p>Period: {new Date(enrollment.group.term.startDate).toLocaleDateString()} - {new Date(enrollment.group.term.endDate).toLocaleDateString()}</p>
                        {enrollment.group.venue && (
                          <p>Venue: {enrollment.group.venue.name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No active enrollments</p>
              )}
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Records</h3>
              
              {loadingAttendance ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading attendance...</p>
                </div>
              ) : (
                <>
                  {/* Attendance Stats */}
                  {attendanceStats && (
                    <div className="grid md:grid-cols-5 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-blue-600 text-sm font-medium">Total Classes</p>
                        <p className="text-2xl font-bold text-blue-900">{attendanceStats.totalClasses}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-green-600 text-sm font-medium">Present</p>
                        <p className="text-2xl font-bold text-green-900">{attendanceStats.attended}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-yellow-600 text-sm font-medium">Late</p>
                        <p className="text-2xl font-bold text-yellow-900">{attendanceStats.late}</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-red-600 text-sm font-medium">Absent</p>
                        <p className="text-2xl font-bold text-red-900">{attendanceStats.absent}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <p className="text-indigo-600 text-sm font-medium">Attendance Rate</p>
                        <p className="text-2xl font-bold text-indigo-900">{attendanceStats.attendanceRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  )}

                  {/* Attendance Records */}
                  {attendanceRecords.length > 0 ? (
                    <div className="space-y-2">
                      {attendanceRecords.slice(0, 10).map((record) => (
                        <div key={record.id} className="border rounded-lg p-3 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{record.session.group.name}</p>
                            <p className="text-sm text-gray-600">{record.session.classType} - {new Date(record.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAttendanceStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-8">No attendance records found</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress</h3>
              
              {loadingProgress ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading progress...</p>
                </div>
              ) : progressData.length > 0 ? (
                <div>
                  {/* Progress Summary */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white mb-6">
                    <p className="text-sm mb-1">Completion Rate</p>
                    <div className="flex items-center gap-4">
                      <p className="text-3xl font-bold">
                        {Math.round((progressData.filter(p => p.completed).length / progressData.length) * 100)}%
                      </p>
                      <p className="text-sm">
                        {progressData.filter(p => p.completed).length} of {progressData.length} criteria completed
                      </p>
                    </div>
                  </div>

                  {/* Progress Criteria List */}
                  <div className="space-y-2">
                    {progressData.map((criteria) => (
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
                            {new Date(criteria.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No progress data available</p>
                  <button
                    onClick={() => router.push(`/parent/children/${studentId}/progress`)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Full Progress Report
                  </button>
                </div>
              )}

              {progressData.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => router.push(`/parent/children/${studentId}/progress`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View Full Progress Report
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
