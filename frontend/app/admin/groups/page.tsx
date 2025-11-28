'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, logout } from '@/lib/auth';

interface Group {
  id: string;
  groupCode: string;
  name?: string;
  capacity: number;
  isActive: boolean;
  term: {
    id: string;
    name: string;
    program: {
      id: string;
      name: string;
    };
  };
  level: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  venue?: {
    id: string;
    name: string;
  };
  _count?: {
    enrollments: number;
  };
}

interface Term {
  id: string;
  name: string;
  program: { 
    id: string;
    name: string;
  };
}

interface Level {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

interface Venue {
  id: string;
  name: string;
}

export default function GroupManagement() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    termId: '',
    levelId: '',
    teacherId: '',
    venueId: '',
    groupCode: '',
    name: '',
    capacity: 15
  });

  useEffect(() => {
    fetchGroups();
    fetchDropdownData();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch groups');

      const data = await response.json();
      console.log('Groups data:', data.data);
      setGroups(data.data || []);
    } catch (err: any) {
      alert('Error loading groups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const token = getToken();

      const [termsRes, levelsRes, teachersRes, venuesRes] = await Promise.all([
        fetch('http://localhost:3001/api/terms', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/levels', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/teachers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3001/api/venues', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const termsData = await termsRes.json();
      const levelsData = await levelsRes.json();
      const teachersData = await teachersRes.json();
      const venuesData = await venuesRes.json();

      console.log('Terms response:', termsData);
      console.log('Levels response:', levelsData);
      console.log('Teachers response:', teachersData);
      console.log('Venues response:', venuesData);

      // Terms API returns { data: { data: [], pagination: {} } } - need extra .data
      setTerms(termsData.data?.data || []);
      setLevels(levelsData.data || []);
      setTeachers(teachersData.data || []);
      setVenues(venuesData.data || []);
    } catch (err) {
      console.error('Error loading dropdown data:', err);
    }
  };

  const handleCreate = async () => {
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3001/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          teacherId: formData.teacherId || undefined,
          venueId: formData.venueId || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create group');
      }

      alert('Group created successfully!');
      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedGroup) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/groups/${selectedGroup.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          capacity: formData.capacity,
          teacherId: formData.teacherId || undefined,
          venueId: formData.venueId || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update group');
      }

      alert('Group updated successfully!');
      setShowModal(false);
      resetForm();
      fetchGroups();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete group');

      alert('Group deactivated successfully!');
      fetchGroups();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to reactivate ${name}?`)) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: true })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reactivate group');
      }

      alert('Group reactivated successfully!');
      fetchGroups();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (group: Group) => {
    console.log('Opening edit modal for group:', group);
    setModalMode('edit');
    setSelectedGroup(group);
    setFormData({
      termId: group.term?.id || '',
      levelId: group.level?.id || '',
      teacherId: group.teacher?.id || '',
      venueId: group.venue?.id || '',
      groupCode: group.groupCode,
      name: group.name || '',
      capacity: group.capacity
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      termId: '',
      levelId: '',
      teacherId: '',
      venueId: '',
      groupCode: '',
      name: '',
      capacity: 15
    });
    setSelectedGroup(null);
  };

  const filteredGroups = groups.filter(g => {
    const searchLower = searchTerm.toLowerCase();
    return g.groupCode.toLowerCase().includes(searchLower) ||
      g.name?.toLowerCase().includes(searchLower) ||
      g.term?.program?.name?.toLowerCase().includes(searchLower);
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
              <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
            </div>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              + Add Group
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="Search by group code, name, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
          />
        </div>

        {/* Groups Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading groups...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {group.groupCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.term?.program?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.level?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.teacher
                        ? `${group.teacher.firstName} ${group.teacher.lastName}`
                        : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group._count?.enrollments || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {group.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        group.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => openEditModal(group)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      {group.isActive ? (
                        <button
                          onClick={() => handleDelete(group.id, group.groupCode)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(group.id, group.groupCode)}
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

            {filteredGroups.length === 0 && (
              <div className="text-center py-12 text-gray-900">
                No groups found
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
              {modalMode === 'create' ? 'Create New Group' : 'Edit Group'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                <select
                  value={formData.termId}
                  onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  required
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select Term</option>
                  {Array.isArray(terms) && terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {term?.program?.name || 'N/A'} - {term.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
                <select
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  required
                  disabled={modalMode === 'edit'}
                >
                  <option value="">Select Level</option>
                  {Array.isArray(levels) && levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Code *</label>
                  <input
                    type="text"
                    value={formData.groupCode}
                    onChange={(e) => setFormData({ ...formData, groupCode: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                    placeholder="e.g., A1-MON-EVE"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  placeholder="e.g., Beginners Monday Evening"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                >
                  <option value="">Unassigned</option>
                  {Array.isArray(teachers) && teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.firstName} {teacher.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                >
                  <option value="">No Venue</option>
                  {Array.isArray(venues) && venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                  min="1"
                  max="50"
                  required
                />
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
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {modalMode === 'create' ? 'Create Group' : 'Update Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}