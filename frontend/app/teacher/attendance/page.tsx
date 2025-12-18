'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId } from '@/lib/authStorage';
import { groupsAPI, sessionsAPI, enrollmentsAPI, attendanceAPI } from '@/lib/api';

interface Group {
  id: string;
  groupCode: string;
  name?: string;
}

interface Session {
  id: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  topic?: string;
  status: string;
}

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  user: {
    email: string;
  };
  enrollmentId: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  notes?: string;
}

export default function RecordAttendance() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchSessions();
      fetchStudents();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedSession && students.length > 0) {
      fetchExistingAttendance();
    }
  }, [selectedSession, students]);

  const fetchExistingAttendance = async () => {
    try {
      const data = await attendanceAPI.getBySession(selectedSession);
      const existingRecords = data.data || [];
      
      // Pre-populate attendance state with existing data
      const attendanceMap: Record<string, AttendanceRecord> = {};
      existingRecords.forEach((record: any) => {
        attendanceMap[record.studentId] = {
          studentId: record.studentId,
          status: record.status,
          notes: record.notes || ''
        };
      });

      // Add default entries for students without attendance
      students.forEach(student => {
        if (!attendanceMap[student.id]) {
          attendanceMap[student.id] = {
            studentId: student.id,
            status: 'PRESENT',
            notes: ''
          };
        }
      });

      setAttendance(attendanceMap);
    } catch (err) {
      // console.error('Error fetching existing attendance:', err);
      // Initialize default attendance if fetch fails
      initializeDefaultAttendance();
    }
  };

  const initializeDefaultAttendance = () => {
    const defaultAttendance: Record<string, AttendanceRecord> = {};
    students.forEach(student => {
      defaultAttendance[student.id] = {
        studentId: student.id,
        status: 'PRESENT',
        notes: ''
      };
    });
    setAttendance(defaultAttendance);
  };

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

  const fetchSessions = async () => {
    try {
      const data = await sessionsAPI.getAll({ 
        groupId: selectedGroup, 
        status: 'SCHEDULED' 
      });
      setSessions(data.data || []);
    } catch (err) {
      // console.error('Error fetching sessions:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await enrollmentsAPI.getAll({ 
        groupId: selectedGroup, 
        status: 'ACTIVE' 
      });
      const enrollments = data.data || [];
      
      setStudents(enrollments.map((e: any) => ({
        ...e.student,
        enrollmentId: e.id
      })));
    } catch (err) {
      // console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes }
    }));
  };

  const handleMarkAll = (status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    const updatedAttendance: Record<string, AttendanceRecord> = {};
    students.forEach(student => {
      updatedAttendance[student.id] = {
        ...attendance[student.id],
        status
      };
    });
    setAttendance(updatedAttendance);
  };

  const handleSubmit = async () => {
    if (!selectedSession) {
      alert('Please select a session');
      return;
    }

    try {
      setSaving(true);
      const teacherId = getTeacherId();
      if (!teacherId) return;

      const records = Object.values(attendance).map(record => ({
        studentId: record.studentId,
        status: record.status,
        notes: record.notes || undefined
      }));

      await attendanceAPI.markBulk({
        classSessionId: selectedSession,
        records,
        teacherId
      });

      alert('Attendance saved successfully!');
      router.push('/teacher');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-300';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-300';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/teacher')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Record Attendance</h1>
        </div>
      </header>
    );
  };

  /**
   * Render group and session selectors
   */
  const renderSelectors = () => {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Group Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Group *
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedSession('');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          >
            <option value="" className="text-gray-700">Choose a group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.groupCode} {group.name && `- ${group.name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Session Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Session *
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500"
            disabled={!selectedGroup}
          >
            <option value="" className="text-gray-700">Choose a session</option>
            {sessions.map(session => (
              <option key={session.id} value={session.id}>
                Session {session.sessionNumber} - {new Date(session.sessionDate).toLocaleDateString()} 
                {session.topic && ` - ${session.topic}`}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  /**
   * Render quick actions buttons
   */
  const renderQuickActions = () => {
    if (!selectedGroup || students.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleMarkAll('PRESENT')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Mark All Present
          </button>
          <button
            onClick={() => handleMarkAll('ABSENT')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Mark All Absent
          </button>
          <button
            onClick={() => handleMarkAll('LATE')}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Mark All Late
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render single student row
   */
  const renderStudentRow = (student: Student) => {
    return (
      <tr key={student.id}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-900">
            {student.firstName} {student.secondName} {student.thirdName}
          </div>
          <div className="text-sm text-gray-900">{student.user.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(student.id, status)}
                className={`px-3 py-1 text-xs font-medium rounded-full border-2 transition ${
                  attendance[student.id]?.status === status
                    ? getStatusColor(status)
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={attendance[student.id]?.notes || ''}
            onChange={(e) => handleNotesChange(student.id, e.target.value)}
            placeholder="Optional notes..."
            className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </td>
      </tr>
    );
  };

  /**
   * Render students table
   */
  const renderStudentsTable = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map(student => renderStudentRow(student))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading students...</p>
      </div>
    );
  };

  /**
   * Render empty group state
   */
  const renderEmptyGroupState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-800 text-lg font-semibold">No students found in this group</p>
      </div>
    );
  };

  /**
   * Render no selection state
   */
  const renderNoSelectionState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-800 text-lg font-semibold">Please select a group to view students</p>
      </div>
    );
  };

  /**
   * Render students section
   */
  const renderStudentsSection = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (students.length > 0) {
      return renderStudentsTable();
    }

    if (selectedGroup) {
      return renderEmptyGroupState();
    }

    return renderNoSelectionState();
  };

  /**
   * Render submit button
   */
  const renderSubmitButton = () => {
    if (students.length === 0) return null;

    return (
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={saving || !selectedSession}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {saving ? 'Saving...' : 'Save Attendance'}
        </button>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderSelectors()}
          {renderQuickActions()}
          {renderStudentsSection()}
          {renderSubmitButton()}
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  

return renderAttendancePage();
}