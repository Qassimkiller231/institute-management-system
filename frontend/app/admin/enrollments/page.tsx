'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import { studentsAPI, groupsAPI, programsAPI, enrollmentsAPI } from '@/lib/api';

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
        id: string;
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
  term: {
    program: {
      id: string;
    };
  };
}

interface Program {
  id: string;
  name: string;
}

export default function EnrollmentManagement() {
  // ========================================
  // STATE & HOOKS
  // ========================================
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
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<Set<string>>(new Set());
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchGroups();
    fetchPrograms();
  }, []);

  // Track students with ANY active enrollment
  useEffect(() => {
    const enrolled = new Set(
      enrollments
        .filter(e => e.status === 'ACTIVE')
        .map(e => e.student.id)
    );
    setEnrolledStudentIds(enrolled);
  }, [enrollments]);

  // ========================================
  // DATA FETCHING
  // ========================================
  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const result = await enrollmentsAPI.getAll();
      setEnrollments(result.data || []);
    } catch (err) {
      alert('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await studentsAPI.getAll();
      setStudents(result.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchGroups = async () => {
    try {
      const result = await groupsAPI.getAll({ isActive: true });
      setGroups(result.data || []);
    } catch (err) {
      // ignore
    }
  };

  const fetchPrograms = async () => {
    try {
      const result = await programsAPI.getAll(true);
      setPrograms(result.data || []);
    } catch (err) {
      // ignore
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  const handleCreate = async () => {
    if (!formData.studentId || !formData.groupId) {
      alert('Please select both student and group');
      return;
    }

    try {
      await enrollmentsAPI.create({
        ...formData,
        status: formData.status as 'ACTIVE' | 'COMPLETED' | 'DROPPED' | undefined
      });
      alert('Enrollment created successfully!');
      setShowModal(false);
      resetForm();
      resetFilters();
      fetchEnrollments();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEnrollment) return;

    try {
      await enrollmentsAPI.update(selectedEnrollment.id, {
        groupId: formData.groupId,
        status: formData.status as 'ACTIVE' | 'COMPLETED' | 'DROPPED'
      });

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
      await enrollmentsAPI.delete(id);

      alert('Enrollment removed successfully!');
      fetchEnrollments();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openEditModal = (enrollment: Enrollment) => {
    setModalMode('edit');
    setSelectedEnrollment(enrollment);

    // Set the program ID based on the group's term program
    const programId = enrollment.group.term.program?.id || '';
    setSelectedProgramId(programId);

    setFormData({
      studentId: enrollment.student.id,
      groupId: enrollment.group.id,
      status: enrollment.status,
      enrollmentDate: enrollment.enrollmentDate.split('T')[0]
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedProgramId('');
    setStudentSearchTerm('');
    setFormData({
      studentId: '',
      groupId: '',
      status: 'ACTIVE',
      enrollmentDate: new Date().toISOString().split('T')[0]
    });
    setSelectedEnrollment(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setGroupFilter('');
    setProgramFilter('');
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

  // Filter students for modal
  const filteredStudentsForModal = students.filter(student => {
    if (modalMode === 'edit') return student.id === formData.studentId;

    // Only show students with NO active enrollments
    if (enrolledStudentIds.has(student.id)) return false;

    // Filter by search
    if (!studentSearchTerm.trim()) return true;
    const searchLower = studentSearchTerm.toLowerCase();
    const fullName = `${student.firstName} ${student.secondName || ''} ${student.thirdName || ''}`.toLowerCase();
    const cpr = (student as any).cpr?.toLowerCase() || '';
    return fullName.includes(searchLower) || cpr.includes(searchLower);
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/admin')}
                className="text-blue-600 hover:text-blue-800 mb-2"
              >
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
    );
  };

  const renderFilters = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Reset Filters
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
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
            {groups.map(group => <option key={group.id} value={group.id}>{group.groupCode}</option>)}
          </select>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">All Programs</option>
            {programs.map(program => <option key={program.id} value={program.name}>{program.name}</option>)}
          </select>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    return (
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Enrollments</div>
          <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Active</div>
          <div className="text-2xl font-bold text-green-600">{enrollments.filter(e => e.status === 'ACTIVE').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{enrollments.filter(e => e.status === 'IN_PROGRESS').length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Withdrawn</div>
          <div className="text-2xl font-bold text-red-600">{enrollments.filter(e => e.status === 'WITHDRAWN').length}</div>
        </div>
      </div>
    );
  };

  const renderTableRow = (enrollment: Enrollment) => {
    return (
      <tr key={enrollment.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
          {enrollment.student.firstName} {enrollment.student.secondName} {enrollment.student.thirdName}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enrollment.group.groupCode}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{enrollment.group.term?.program?.name || 'N/A'}</td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(enrollment.status)}`}>
            {enrollment.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {new Date(enrollment.enrollmentDate).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
          <button onClick={() => openEditModal(enrollment)} className="text-blue-600 hover:text-blue-800">Edit</button>
          <button onClick={() => handleDelete(enrollment.id, `${enrollment.student.firstName} ${enrollment.student.secondName}`)} className="text-red-600 hover:text-red-800">Delete</button>
        </td>
      </tr>
    );
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      );
    }

    return (
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
            {filteredEnrollments.map(renderTableRow)}
          </tbody>
        </table>
        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12 text-gray-900">No enrollments found</div>
        )}
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'create' ? 'Add Enrollment' : 'Edit Enrollment'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
              <select value={selectedProgramId} onChange={(e) => { setSelectedProgramId(e.target.value); setFormData({ ...formData, groupId: '', studentId: '' }); }} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required>
                <option value="">Select Program</option>
                {programs.map(program => <option key={program.id} value={program.id}>{program.name}</option>)}
              </select>
            </div>
            {modalMode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                <input type="text" placeholder="Search by name or CPR..." value={studentSearchTerm} onChange={(e) => setStudentSearchTerm(e.target.value)} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student * {modalMode === 'create' && `(${filteredStudentsForModal.length} available)`}</label>
              <select value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" disabled={modalMode === 'edit'} required>
                <option value="">Select Student</option>
                {filteredStudentsForModal.map(student => <option key={student.id} value={student.id}>{student.firstName} {student.secondName} {student.thirdName} {(student as any).cpr && `(CPR: ${(student as any).cpr})`}</option>)}
              </select>
              {modalMode === 'create' && filteredStudentsForModal.length === 0 && <p className="text-sm text-red-600 mt-1">{studentSearchTerm ? 'No students match your search' : 'No students available (all have active enrollments)'}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group *</label>
              <select value={formData.groupId} onChange={(e) => setFormData({ ...formData, groupId: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required disabled={!selectedProgramId}>
                <option value="">Select Group</option>
                {groups.filter(group => !selectedProgramId || group.term.program.id === selectedProgramId).map(group => <option key={group.id} value={group.id}>{group.groupCode} {group.name && `- ${group.name}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>
            {modalMode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date *</label>
                <input type="date" value={formData.enrollmentDate} onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required />
              </div>
            )}
          </div>
          <div className="mt-6 flex space-x-3">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modalMode === 'create' ? 'Create' : 'Update'}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderEnrollmentContent = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderFilters()}
          {renderStats()}
          {renderTable()}
        </main>
        {renderModal()}
      </div>
    );
  };

  // ========================================
  // MAIN RETURN
  // ========================================

  return renderEnrollmentContent();
}