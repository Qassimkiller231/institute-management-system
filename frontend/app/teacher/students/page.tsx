'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getTeacherId } from '@/lib/auth';
interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  dateOfBirth: string;
  gender: string;
  user: {
    email: string;
    phone?: string;
  };
  enrollment: {
    id: string;
    enrollmentDate: string;
    status: string;
    group: {
      id: string;
      groupCode: string;
      name?: string;
    };
  };
  attendanceRate?: number;
}

interface Group {
  id: string;
  groupCode: string;
  name?: string;
}

export default function ViewStudents() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedGroup !== 'all') {
      fetchStudents();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const token = getToken();
      const teacherId = getTeacherId();
      
      const response = await fetch(`http://localhost:3001/api/groups?teacherId=${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setGroups(data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const teacherId = getTeacherId();
      
      // Get all groups for this teacher
      const groupsRes = await fetch(
        `http://localhost:3001/api/groups?teacherId=${teacherId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const groupsData = await groupsRes.json();
      const teacherGroups = groupsData.data || [];

      // Get enrollments for all groups (or selected group)
      let allStudents: Student[] = [];
      
      if (selectedGroup === 'all') {
        // Fetch students from all groups
        for (const group of teacherGroups) {
          const enrollRes = await fetch(
            `http://localhost:3001/api/enrollments?groupId=${group.id}&status=ACTIVE`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const enrollData = await enrollRes.json();
          const enrollments = enrollData.data || [];
          
          enrollments.forEach((enrollment: any) => {
            allStudents.push({
              ...enrollment.student,
              enrollment: {
                id: enrollment.id,
                enrollmentDate: enrollment.enrollmentDate,
                status: enrollment.status,
                group: {
                  id: group.id,
                  groupCode: group.groupCode,
                  name: group.name
                }
              }
            });
          });
        }
      } else {
        // Fetch students from selected group only
        const enrollRes = await fetch(
          `http://localhost:3001/api/enrollments?groupId=${selectedGroup}&status=ACTIVE`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const enrollData = await enrollRes.json();
        const enrollments = enrollData.data || [];
        
        const group = teacherGroups.find((g: any) => g.id === selectedGroup);
        enrollments.forEach((enrollment: any) => {
          allStudents.push({
            ...enrollment.student,
            enrollment: {
              id: enrollment.id,
              enrollmentDate: enrollment.enrollmentDate,
              status: enrollment.status,
              group: {
                id: group?.id,
                groupCode: group?.groupCode,
                name: group?.name
              }
            }
          });
        });
      }

      setStudents(allStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const openStudentModal = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const filteredStudents = students.filter(s =>
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.secondName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollment.group.groupCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/teacher')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.groupCode} {group.name && `- ${group.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Students</div>
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Active Groups</div>
            <div className="text-3xl font-bold text-green-600">{groups.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Filtered Results</div>
            <div className="text-3xl font-bold text-purple-600">{filteredStudents.length}</div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Group
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.secondName} {student.thirdName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.enrollment.group.groupCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {student.enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openStudentModal(student)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
            No students found
          </div>
        )}
      </main>

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Student Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <p className="font-medium">
                    {selectedStudent.firstName} {selectedStudent.secondName} {selectedStudent.thirdName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">CPR Number</label>
                  <p className="font-medium">{selectedStudent.cpr}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="font-medium">{selectedStudent.user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="font-medium">{selectedStudent.user.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Date of Birth</label>
                  <p className="font-medium">
                    {new Date(selectedStudent.dateOfBirth).toLocaleDateString()} 
                    ({calculateAge(selectedStudent.dateOfBirth)} years old)
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Gender</label>
                  <p className="font-medium">{selectedStudent.gender}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Enrollment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Group</label>
                    <p className="font-medium">
                      {selectedStudent.enrollment.group.groupCode}
                      {selectedStudent.enrollment.group.name && ` - ${selectedStudent.enrollment.group.name}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Enrollment Date</label>
                    <p className="font-medium">
                      {new Date(selectedStudent.enrollment.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}