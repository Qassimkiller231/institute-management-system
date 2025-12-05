'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  currentLevel?: string;
  isActive: boolean;
  user: {
    email: string;
    phone?: string;
    role: string;
  };
  enrollments?: Array<{
    group: {
      level: {
        id: string;
        name: string;
      };
      venue?: {
        id: string;
        name: string;
      };
    };
  }>;
}

interface Level {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
}

export default function StudentManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    cpr: '',
    firstName: '',
    secondName: '',
    thirdName: '',
    dateOfBirth: '',
    gender: 'MALE',
    currentLevelId: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const token = getToken();
      const [levelsRes, venuesRes] = await Promise.all([
        fetch('http://localhost:3001/api/levels', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/venues', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const levelsData = await levelsRes.json();
      const venuesData = await venuesRes.json();

      setLevels(levelsData.data || []);
      setVenues(venuesData.data || []);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      // Build query params
      const params = new URLSearchParams();
      if (levelFilter) params.append('levelId', levelFilter);
      if (venueFilter) params.append('venueId', venueFilter);
      
      const queryString = params.toString();
      const url = `http://localhost:3001/api/students${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      setStudents(data.data || []);
    } catch (err: any) {
      alert('Error loading students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchStudents();
  }, [levelFilter, venueFilter]);

  const handleCreate = async () => {
    // Validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.cpr || !formData.dateOfBirth) {
      alert('Please fill in all required fields (Email, Phone, First Name, CPR, Date of Birth)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Phone validation (basic)
    if (formData.phone.length < 8) {
      alert('Please enter a valid phone number');
      return;
    }

    // CPR validation (9 digits)
    if (formData.cpr.length !== 9 || !/^\d+$/.test(formData.cpr)) {
      alert('CPR must be exactly 9 digits');
      return;
    }

    // Age validation (minimum 6 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      // Subtract 1 from age if birthday hasn't occurred this year
    }
    if (age < 6) {
      alert('Student must be at least 6 years old');
      return;
    }

    try {
      const token = getToken();
      
      // Find the selected level name from currentLevelId
      const selectedLevel = levels.find(l => l.id === formData.currentLevelId);
      
      const response = await fetch('http://localhost:3001/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          currentLevel: selectedLevel?.name || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create student');
      }

      alert('Student created successfully!');
      setShowModal(false);
      resetForm();
      resetFilters();
      fetchStudents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedStudent) return;

    // Validation
    if (!formData.email || !formData.phone || !formData.firstName || !formData.cpr || !formData.dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const token = getToken();
      
      // Find the selected level name
      const selectedLevel = levels.find(l => l.id === formData.currentLevelId);
      
      const response = await fetch(`http://localhost:3001/api/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          secondName: formData.secondName,
          thirdName: formData.thirdName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          email: formData.email,
          phone: formData.phone,
          cpr: formData.cpr,
          currentLevel: selectedLevel?.name || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update student');
      }

      alert('Student updated successfully!');
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to deactivate student');

      alert('Student deactivated successfully!');
      fetchStudents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: true })
      });

      if (!response.ok) throw new Error('Failed to reactivate student');

      alert('Student reactivated successfully!');
      fetchStudents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (student: Student) => {
    setModalMode('edit');
    setSelectedStudent(student);
    
    // Find the level ID from the student's currentLevel name
    const currentLevel = levels.find(l => l.name === student.currentLevel);
    
    setFormData({
      email: student.user.email,
      phone: student.user.phone || '',
      cpr: student.cpr,
      firstName: student.firstName,
      secondName: student.secondName || '',
      thirdName: student.thirdName || '',
      dateOfBirth: student.dateOfBirth.split('T')[0],
      gender: student.gender,
      currentLevelId: currentLevel?.id || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      phone: '',
      cpr: '',
      firstName: '',
      secondName: '',
      thirdName: '',
      dateOfBirth: '',
      gender: 'MALE',
      currentLevelId: ''
    });
    setSelectedStudent(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('');
    setStatusFilter('');
    setLevelFilter('');
    setVenueFilter('');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.secondName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cpr || '').includes(searchTerm) ||
      (s.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !genderFilter || s.gender === genderFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && s.isActive) || 
                         (statusFilter === 'inactive' && !s.isActive);
    return matchesSearch && matchesGender && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Student
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
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
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search by name, CPR, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Levels</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            <select
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">All Venues</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {student.firstName} {student.secondName} {student.thirdName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.cpr}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.user?.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {student.currentLevel ? (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                          {student.currentLevel}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.enrollments?.[0]?.group?.level?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.enrollments?.[0]?.group?.venue?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(student)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      {student.isActive ? (
                        <button
                          onClick={() => handleDelete(student.id, student.firstName)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(student.id, student.firstName)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-900">
                No students found
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {modalMode === 'create' ? 'Add New Student' : 'Edit Student'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPR Number *</label>
                <input
                  type="text"
                  value={formData.cpr}
                  onChange={(e) => setFormData({ ...formData, cpr: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  maxLength={9}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Name</label>
                <input
                  type="text"
                  value={formData.secondName}
                  onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Third Name</label>
                <input
                  type="text"
                  value={formData.thirdName}
                  onChange={(e) => setFormData({ ...formData, thirdName: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  min={(() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 100);
                    return date.toISOString().split('T')[0];
                  })()}
                  max={(() => {
                    const date = new Date();
                    date.setFullYear(date.getFullYear() - 6);
                    return date.toISOString().split('T')[0];
                  })()}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                />
                <p className="text-xs text-gray-600 mt-1">Student must be between 6 and 100 years old</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Level (Optional)</label>
                <select
                  value={formData.currentLevelId}
                  onChange={(e) => setFormData({ ...formData, currentLevelId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Not Set</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">Set after placement test or manually assign</p>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {modalMode === 'create' ? 'Create Student' : 'Update Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}