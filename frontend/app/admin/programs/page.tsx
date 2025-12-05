'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { programsAPI, CreateProgramDto, UpdateProgramDto } from '@/lib/api';

interface Program {
  id: string;
  name: string;
  code?: string;
  description?: string;
  duration?: number;
  isActive: boolean;
  _count?: { terms: number };
}

export default function ProgramsManagement() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const [formData, setFormData] = useState<CreateProgramDto>({
    name: '',
    code: '',
    description: ''
  });

  const [editData, setEditData] = useState<UpdateProgramDto>({
    name: '',
    code: '',
    description: ''
  });

  useEffect(() => { fetchPrograms(); }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await programsAPI.getAll();
      setPrograms(data.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return alert('Name required');
    try {
      await programsAPI.create(formData);
      alert('Created!');
      setShowModal(false);
      resetForm();
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProgram) return;
    try {
      await programsAPI.update(selectedProgram.id, editData);
      alert('Updated!');
      setShowModal(false);
      resetForm();
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await programsAPI.delete(id);
      alert('Deleted!');
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await programsAPI.update(id, { isActive: !isActive });
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (program: Program) => {
    setModalMode('edit');
    setSelectedProgram(program);
    setEditData({
      name: program.name,
      code: program.code || '',
      description: program.description || '',
      duration: program.duration || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      duration: 0
    });
    setEditData({
      name: '',
      code: '',
      description: '',
      duration: 0
    });
    setSelectedProgram(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const filtered = programs.filter(p => {
    const search = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const status = !statusFilter || 
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive);
    return search && status;
  });

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.isActive).length,
    inactive: programs.filter(p => !p.isActive).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button onClick={() => router.push('/admin')} className="text-indigo-600 hover:text-indigo-800 mb-2">
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
            </div>
            <button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              + Add Program
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
            <button onClick={resetFilters} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{p.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p.description || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{p._count?.terms || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button onClick={() => openEditModal(p)} className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={() => handleToggle(p.id, p.isActive)} className="text-orange-600 hover:text-orange-800">
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center py-12 text-gray-900">No programs found</div>}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'create' ? 'Add Program' : 'Edit Program'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={modalMode === 'create' ? formData.name : editData.name}
                  onChange={(e) => modalMode === 'create' 
                    ? setFormData({ ...formData, name: e.target.value })
                    : setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  placeholder="e.g., IELTS Preparation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={modalMode === 'create' ? formData.description : editData.description}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, description: e.target.value })
                    : setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={modalMode === 'create' ? formData.code : editData.code}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    : setEditData({ ...editData, code: e.target.value.toUpperCase() })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900"
                  placeholder="e.g., IELTS-PREP"
                />
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button
                onClick={modalMode === 'create' ? handleCreate : handleUpdate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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