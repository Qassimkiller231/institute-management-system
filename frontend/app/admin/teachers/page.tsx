'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/authStorage';
import { teachersAPI, levelsAPI, venuesAPI } from '@/lib/api';

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  isActive: boolean;
  user: {
    email: string;
    phone?: string;
  };
  groups?: Array<{
    level: {
      id: string;
      name: string;
    };
    venue?: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    groups: number;
  };
}

interface Level {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
}

export default function TeacherManagement() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [levelFilter, setLevelFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    specialization: ''
  });

  useEffect(() => {
    fetchTeachers();
    fetchDropdownData();
  }, [filterStatus]);

  const fetchDropdownData = async () => {
    try {
      const [levelsResult, venuesResult] = await Promise.all([
        levelsAPI.getAll(),
        venuesAPI.getAll()
      ]);

      setLevels(levelsResult.data || []);
      setVenues(venuesResult.data || []);
    } catch (err) {
      // console.error('Error loading dropdown data:', err);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const result = await teachersAPI.getAll({
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
      });
      setTeachers(result.data || []);
    } catch (err: any) {
      alert('Error loading teachers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // Validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields (Email, Phone, First Name, Last Name)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation
    if (formData.phone.length < 8) {
      alert('Please enter a valid phone number');
      return;
    }

    try {
      await teachersAPI.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization
      });

      alert('Teacher created successfully!');
      setShowModal(false);
      resetForm();
      resetFilters();
      fetchTeachers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTeacher) return;

    try {
      await teachersAPI.update(selectedTeacher.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization
      });

      alert('Teacher updated successfully!');
      setShowModal(false);
      resetForm();
      fetchTeachers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      await teachersAPI.delete(id);
      alert('Teacher deactivated successfully!');
      fetchTeachers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;

    try {
      await teachersAPI.update(id, { isActive: true });
      alert('Teacher reactivated successfully!');
      fetchTeachers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setModalMode('edit');
    setSelectedTeacher(teacher);
    setFormData({
      email: teacher.user.email,
      phone: teacher.user.phone || '',
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      specialization: teacher.specialization || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      specialization: ''
    });
    setSelectedTeacher(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('active');
    setLevelFilter('');
    setVenueFilter('');
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Level filter: check if teacher teaches any group with this level
    const matchesLevel = !levelFilter ||
      (t.groups && t.groups.some(g => g.level.id === levelFilter));

    // Venue filter: check if teacher teaches any group at this venue
    const matchesVenue = !venueFilter ||
      (t.groups && t.groups.some(g => g.venue?.id === venueFilter));

    return matchesSearch && matchesLevel && matchesVenue;
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><div className="flex justify-between items-center"><div><button onClick={() => router.push('/admin')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Dashboard</button><h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1></div><button onClick={openCreateModal} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">+ Add Teacher</button></div></div></header>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-gray-900">Filters</h2><button onClick={resetFilters} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Reset Filters</button></div><div className="grid md:grid-cols-4 gap-4"><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"><option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option></select><select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"><option value="">All Levels</option>{levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}</select><select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"><option value="">All Venues</option>{venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></div></div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading teachers...</p></div>
  );

  const renderTeacherRow = (teacher: Teacher) => (
    <tr key={teacher.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{teacher.firstName} {teacher.lastName}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.user.email}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.user.phone || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.specialization || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.groups?.[0]?.level?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.groups?.[0]?.venue?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher._count?.groups || 0} groups</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{teacher.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm space-x-2"><button onClick={() => openEditModal(teacher)} className="text-blue-600 hover:text-blue-800">Edit</button>{teacher.isActive ? <button onClick={() => handleDelete(teacher.id, `${teacher.firstName} ${teacher.lastName}`)} className="text-red-600 hover:text-red-800">Delete</button> : <button onClick={() => handleReactivate(teacher.id, `${teacher.firstName} ${teacher.lastName}`)} className="text-green-600 hover:text-green-800">Reactivate</button>}</td></tr>
  );

  const renderTeachersTable = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredTeachers.map(renderTeacherRow)}</tbody></table>{filteredTeachers.length === 0 && <div className="text-center py-12 text-gray-900">No teachers found</div>}</div>
  );

  const renderModalForm = () => (
    <div className="space-y-4">{modalMode === 'create' && <><div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" required /></div></>}<div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label><input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900" placeholder="e.g., English Language Teaching, IELTS Preparation" /></div></div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold text-gray-900 mb-6">{modalMode === 'create' ? 'Add New Teacher' : 'Edit Teacher'}</h2>{renderModalForm()}<div className="mt-6 flex space-x-3"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">{modalMode === 'create' ? 'Create Teacher' : 'Update Teacher'}</button></div></div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderFilters()}
        {loading ? renderLoadingState() : renderTeachersTable()}
      </main>

      {renderModal()}
    </div>
  );
}