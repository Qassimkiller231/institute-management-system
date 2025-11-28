'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Enrollment {
  id: string;
  status: string;
  enrollmentDate: string;
  student: {
    id: string;
    firstName: string;
    secondName?: string;
    thirdName?: string;
  };
  group: {
    id: string;
    groupCode: string;
    name?: string;
    term: {
      name: string;
      program: {
        name: string;
      };
    };
  };
}

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
}

interface Group {
  id: string;
  groupCode: string;
  name?: string;
}

interface Program {
  id: string;
  name: string;
}

export default function EnrollmentManagement() {
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [programFilter, setProgramFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [formData, setFormData] = useState({
    studentId: '',
    groupId: '',
    status: 'ACTIVE',
    enrollmentDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchGroups();
    fetchPrograms();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      console.log('Enrollments response:', data);
      console.log('First enrollment:', data.data?.[0]);
      setEnrollments(data.data || []);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setStudents(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setGroups(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchPrograms = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPrograms(data.data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.studentId || !formData.groupId) {
      alert('Please select student and group');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create enrollment');

      alert('Enrollment created successfully!');
      setShowModal(false);
      resetForm();
      fetchEnrollments();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEnrollment) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/enrollments/${selectedEnrollment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          groupId: formData.groupId,
          status: formData.status
        })
      });

      if (!response.ok) throw new Error('Failed to update enrollment');

      alert('Enrollment updated successfully!');
      setShowModal(false);
      resetForm();
      fetchEnrollments();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, studentName: string) => {
    if (!confirm(`Remove enrollment for ${studentName}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/enrollments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete enrollment');

      alert('Enrollment removed successfully!');
      fetchEnrollments();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openEditModal = (enrollment: Enrollment) => {
    setModalMode('edit');
    setSelectedEnrollment(enrollment);
    setFormData({
      studentId: enrollment.student.id,
      groupId: enrollment.group.id,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate.split('T')[0]
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      groupId: '',
      status: 'ACTIVE',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setSelectedEnrollment(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'WITHDRAWN': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const studentName = `${enrollment.student.firstName} ${enrollment.student.secondName || ''} ${enrollment.student.thirdName || ''}`.toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) || 
                         enrollment.group.groupCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || enrollment.status === statusFilter;
    const matchesGroup = !groupFilter || enrollment.group.id === groupFilter;
    const matchesProgram = !programFilter || enrollment.group.term?.program?.name === programFilter;
    
    return matchesSearch && matchesStatus && matchesGroup && matchesProgram;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button onClick={() => router.push('/admin')} className="text-blue-600 hover:text-blue-800 mb-2">
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Enrollment Management</h1>
            </div>
            <button
              onClick={() => { setModalMode('create'); resetForm(); setShowModal(true); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Enrollment
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by student name or group code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.groupCode}
              </option>
            ))}
          </select>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">All Programs</option>
            {programs.map(program => (
              <option key={program.id} value={program.name}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Enrollments</div>
            <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {enrollments.filter(e => e.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-2xl font-bold text-blue-600">
              {enrollments.filter(e => e.status === 'IN_PROGRESS').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Withdrawn</div>
            <div className="text-2xl font-bold text-red-600">
              {enrollments.filter(e => e.status === 'WITHDRAWN').length}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Enrolled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {enrollment.student.firstName} {enrollment.student.secondName} {enrollment.student.thirdName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.group.groupCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.group.term?.program?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(enrollment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(enrollment.id, `${enrollment.student.firstName} ${enrollment.student.secondName}`)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEnrollments.length === 0 && (
              <div className="text-center py-12 text-gray-900">
                No enrollments found
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {modalMode === 'create' ? 'Add Enrollment' : 'Edit Enrollment'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  disabled={modalMode === 'edit'}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.secondName} {student.thirdName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group *</label>
                <select
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.groupCode} {group.name && `- ${group.name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date *</label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    required
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {modalMode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}