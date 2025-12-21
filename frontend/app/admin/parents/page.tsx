'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import { parentsAPI, Parent, CreateParentDto, UpdateParentDto } from '@/lib/api/parents';
import { studentsAPI } from '@/lib/api';

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
}

export default function ParentManagement() {
  const router = useRouter();
  const [parents, setParents] = useState<Parent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'linkStudent'>('create');
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });
  const [linkStudentData, setLinkStudentData] = useState({
    studentId: '',
    relationship: ''
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await parentsAPI.getAll({
        isActive: filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined
      });
      
      setParents(response.data || []);
    } catch (err: any) {
      // console.error('Error loading parents:', err);
      alert('Error loading parents: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await studentsAPI.getAll();
      setStudents(result.data || []);
    } catch (err) {
      // console.error('Error loading students:', err);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [filterStatus]);

  const handleCreate = async () => {
    // Validation
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill in First Name and Last Name (required fields)');
      return;
    }

    // Email validation if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    // Phone validation if provided
    if (formData.phone && formData.phone.length < 8) {
      alert('Please enter a valid phone number (minimum 8 digits)');
      return;
    }

    try {
      const data: CreateParentDto = {
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      if (formData.email) data.email = formData.email;
      if (formData.phone) data.phone = formData.phone;

      await parentsAPI.create(data);

      alert('Parent created successfully!');
      setShowModal(false);
      resetForm();
      fetchParents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedParent) return;

    // Validation
    if (!formData.firstName || !formData.lastName) {
      alert('Please fill in First Name and Last Name');
      return;
    }

    try {
      const data: UpdateParentDto = {
        firstName: formData.firstName,
        lastName: formData.lastName
      };
      
      if (formData.email) data.email = formData.email;
      if (formData.phone) data.phone = formData.phone;

      await parentsAPI.update(selectedParent.id, data);

      alert('Parent updated successfully!');
      setShowModal(false);
      resetForm();
      fetchParents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      await parentsAPI.delete(id);
      alert('Parent deactivated successfully!');
      fetchParents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;

    try {
      await parentsAPI.update(id, { isActive: true });
      alert('Parent reactivated successfully!');
      fetchParents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleLinkStudent = async () => {
    if (!selectedParent || !linkStudentData.studentId) {
      alert('Please select a student');
      return;
    }

    try {
      await parentsAPI.linkStudent(selectedParent.id, {
        studentId: linkStudentData.studentId,
        relationship: linkStudentData.relationship || undefined
      });

      alert('Student linked successfully!');
      setShowModal(false);
      setLinkStudentData({ studentId: '', relationship: '' });
      fetchParents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (parent: Parent) => {
    setModalMode('edit');
    setSelectedParent(parent);
    setFormData({
      email: parent.user.email || '',
      phone: parent.user.phone || '',
      firstName: parent.firstName,
      lastName: parent.lastName
    });
    setShowModal(true);
  };

  const openLinkStudentModal = async (parent: Parent) => {
    setModalMode('linkStudent');
    setSelectedParent(parent);
    setLinkStudentData({ studentId: '', relationship: '' });
    await fetchStudents();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      firstName: '',
      lastName: ''
    });
    setSelectedParent(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('active');
  };

  const filteredParents = parents.filter(p => {
    const matchesSearch = (p.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><div className="flex justify-between items-center"><div><button onClick={() => router.push('/admin')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Dashboard</button><h1 className="text-3xl font-bold text-gray-900">Parent Management</h1></div><button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Add Parent</button></div></div></header>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-gray-900">Filters</h2><button onClick={resetFilters} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Reset Filters</button></div><div className="grid md:grid-cols-2 gap-4"><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option></select></div></div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading parents...</p></div>
  );

  const renderTableRow = (parent: Parent) => (
    <tr key={parent.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{parent.firstName} {parent.lastName}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parent.user?.email || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parent.user?.phone || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{parent._count?.parentStudentLinks || 0}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${parent.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{parent.user.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm space-x-2"><button onClick={() => openEditModal(parent)} className="text-blue-600 hover:text-blue-800">Edit</button><button onClick={() => openLinkStudentModal(parent)} className="text-green-600 hover:text-green-800">Link Student</button>{parent.user.isActive ? <button onClick={() => handleDelete(parent.id, parent.firstName)} className="text-red-600 hover:text-red-800">Delete</button> : <button onClick={() => handleReactivate(parent.id, parent.firstName)} className="text-green-600 hover:text-green-800">Reactivate</button>}</td></tr>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredParents.map(renderTableRow)}</tbody></table>{filteredParents.length === 0 && <div className="text-center py-12 text-gray-900">No parents found</div>}</div>
  );

  const renderLinkStudentForm = () => (
    <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Student *</label><select value={linkStudentData.studentId} onChange={(e) => setLinkStudentData({ ...linkStudentData, studentId: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required><option value="">Select Student</option>{students.map(student => <option key={student.id} value={student.id}>{student.firstName} {student.secondName} {student.thirdName} - {student.cpr}</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Relationship (Optional)</label><input type="text" value={linkStudentData.relationship} onChange={(e) => setLinkStudentData({ ...linkStudentData, relationship: e.target.value })} placeholder="e.g., Father, Mother, Guardian" className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /></div><div className="mt-6 flex space-x-3"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={handleLinkStudent} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Link Student</button></div></div>
  );

  const renderParentForm = () => (
    <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /><p className="text-xs text-gray-700 font-medium mt-1">Can share email with student</p></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /></div><div className="mt-6 flex space-x-3"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modalMode === 'create' ? 'Create Parent' : 'Update Parent'}</button></div></div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold text-gray-900 mb-6">{modalMode === 'create' && 'Add New Parent'}{modalMode === 'edit' && 'Edit Parent'}{modalMode === 'linkStudent' && 'Link Student to Parent'}</h2>{modalMode === 'linkStudent' ? renderLinkStudentForm() : renderParentForm()}</div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderFilters()}

        {loading ? renderLoadingState() : renderTable()}
      </main>

      {renderModal()}
    </div>
  );
}
