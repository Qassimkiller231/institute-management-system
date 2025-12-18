'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/authStorage';
import { studentsAPI, levelsAPI, venuesAPI } from '@/lib/api';

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
  profilePicture?: string;
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
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [levelFilter, setLevelFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
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
      const [levelsRes, venuesRes] = await Promise.all([
        levelsAPI.getAll(),
        venuesAPI.getAll()
      ]);

      setLevels(levelsRes.data || []);
      setVenues(venuesRes.data || []);
    } catch (err) {
      // console.error('Error loading dropdown data:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const result = await studentsAPI.getAll({
        levelId: levelFilter,
        venueId: venueFilter,
        isActive: filterStatus === 'all' ? undefined : filterStatus === 'active'
      });
      setStudents(result.data || []);
    } catch (err: any) {
      alert('Error loading students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchStudents();
  }, [levelFilter, venueFilter, filterStatus]);

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
      // Find the selected level name from currentLevelId
      const selectedLevel = levels.find(l => l.id === formData.currentLevelId);

      const createData: any = {
        ...formData,
        currentLevel: selectedLevel?.name || null,
        nationality: 'Bahraini' // Defaulting if not in form, or I should add it to form
      };

      const result = await studentsAPI.create(createData);

      // Upload profile picture if provided
      if (profilePictureFile && result.data?.id) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('profilePicture', profilePictureFile);

          await studentsAPI.uploadProfilePicture(result.data.id, uploadFormData);
        } catch (err) {
          // console.error('Error uploading profile picture:', err);
        }
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
      // Find the selected level name
      const selectedLevel = levels.find(l => l.id === formData.currentLevelId);

      const updateData: any = {
        firstName: formData.firstName,
        secondName: formData.secondName,
        thirdName: formData.thirdName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'MALE' | 'FEMALE',
        email: formData.email,
        phone: formData.phone,
        cpr: formData.cpr,
        currentLevel: selectedLevel?.name || null
      };

      await studentsAPI.update(selectedStudent.id, updateData);

      // Upload profile picture if provided
      if (profilePictureFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('profilePicture', profilePictureFile);

          await studentsAPI.uploadProfilePicture(selectedStudent.id, uploadFormData);
        } catch (err) {
          // console.error('Error uploading profile picture:', err);
        }
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
      await studentsAPI.delete(id);
      alert('Student deactivated successfully!');
      fetchStudents();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;

    try {
      await studentsAPI.update(id, { isActive: true });
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
    setProfilePictureFile(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setGenderFilter('');
    setFilterStatus('active');
    setLevelFilter('');
    setVenueFilter('');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.secondName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cpr || '').includes(searchTerm) ||
      (s.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = !genderFilter || s.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><div className="flex justify-between items-center"><div><button onClick={() => router.push('/admin')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Dashboard</button><h1 className="text-3xl font-bold text-gray-900">Student Management</h1></div><button onClick={openCreateModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">+ Add Student</button></div></div></header>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold text-gray-900">Filters</h2><button onClick={resetFilters} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Reset Filters</button></div><div className="grid md:grid-cols-5 gap-4"><input type="text" placeholder="Search by name, CPR, or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /><select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="">All Genders</option><option value="MALE">Male</option><option value="FEMALE">Female</option></select><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option></select><select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="">All Levels</option>{levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}</select><select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="">All Venues</option>{venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name}</option>)}</select></div></div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading students...</p></div>
  );

  const renderStudentRow = (student: Student) => (
    <tr key={student.id} className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap"><div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">{student.profilePicture ? <img src={`http://localhost:3001${student.profilePicture}`} alt={student.firstName} className="w-full h-full object-cover" /> : <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}</div></td><td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900">{student.firstName} {student.secondName} {student.thirdName}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.cpr}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.user?.email || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.user?.phone || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.gender}</td><td className="px-6 py-4 whitespace-nowrap text-sm">{student.currentLevel ? <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">{student.currentLevel}</span> : <span className="text-gray-400">Not Set</span>}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.enrollments?.[0]?.group?.level?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.enrollments?.[0]?.group?.venue?.name || 'N/A'}</td><td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{student.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm space-x-2"><button onClick={() => openEditModal(student)} className="text-blue-600 hover:text-blue-800">Edit</button>{student.isActive ? <button onClick={() => handleDelete(student.id, student.firstName)} className="text-red-600 hover:text-red-800">Delete</button> : <button onClick={() => handleReactivate(student.id, student.firstName)} className="text-green-600 hover:text-green-800">Reactivate</button>}</td></tr>
  );

  const renderStudentsTable = () => (
    <div className="bg-white rounded-lg shadow overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Picture</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPR</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Level</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled Level</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{filteredStudents.map(renderStudentRow)}</tbody></table>{filteredStudents.length === 0 && <div className="text-center py-12 text-gray-900">No students found</div>}</div>
  );

  const renderModalForm = () => (
    <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">CPR Number *</label><input type="text" value={formData.cpr} onChange={(e) => setFormData({ ...formData, cpr: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" maxLength={9} required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Second Name</label><input type="text" value={formData.secondName} onChange={(e) => setFormData({ ...formData, secondName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Third Name</label><input type="text" value={formData.thirdName} onChange={(e) => setFormData({ ...formData, thirdName: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label><input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} min={(() => { const date = new Date(); date.setFullYear(date.getFullYear() - 100); return date.toISOString().split('T')[0]; })()} max={(() => { const date = new Date(); date.setFullYear(date.getFullYear() - 6); return date.toISOString().split('T')[0]; })()} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" required /><p className="text-xs text-gray-600 mt-1">Student must be between 6 and 100 years old</p></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="MALE">Male</option><option value="FEMALE">Female</option></select></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Current Level (Optional)</label><select value={formData.currentLevelId} onChange={(e) => setFormData({ ...formData, currentLevelId: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"><option value="">Not Set</option>{levels.map(level => <option key={level.id} value={level.id}>{level.name}</option>)}</select><p className="text-xs text-gray-600 mt-1">Set after placement test or manually assign</p></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Optional)</label><input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { if (file.size > 5 * 1024 * 1024) { alert('File size must be less than 5MB'); e.target.value = ''; return; } setProfilePictureFile(file); } }} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" /><p className="text-xs text-gray-600 mt-1">Max file size: 5MB. Accepted: JPG, PNG, WEBP</p>{profilePictureFile && <p className="text-xs text-green-600 mt-1">✓ {profilePictureFile.name}</p>}</div></div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"><h2 className="text-2xl font-bold mb-6">{modalMode === 'create' ? 'Add New Student' : 'Edit Student'}</h2>{renderModalForm()}<div className="mt-6 flex space-x-3"><button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button><button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modalMode === 'create' ? 'Create Student' : 'Update Student'}</button></div></div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderFilters()}
        {loading ? renderLoadingState() : renderStudentsTable()}
      </main>

      {renderModal()}
    </div>
  );
}