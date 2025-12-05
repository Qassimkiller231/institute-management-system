'use client';

import { useState, useEffect } from 'react';
import { termsAPI, CreateTermDto, UpdateTermDto, programsAPI } from '@/lib/api';

interface Term {
  id: string;
  programId: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  _count?: { groups: number };
  program?: { id: string; name: string; code: string };
}

interface Program {
  id: string;
  name: string;
  code: string;
}

export default function TermsManagement() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  const [formData, setFormData] = useState<CreateTermDto>({
    programId: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  const [editData, setEditData] = useState<UpdateTermDto>({});

  useEffect(() => { 
    fetchTerms();
    fetchPrograms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await termsAPI.getAll();
      // Handle nested structure: response.data.data for paginated responses
      const termsData = response.data?.data || response.data || [];
      setTerms(Array.isArray(termsData) ? termsData : []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await programsAPI.getAll(true); // Only active programs
      const programsData = response.data?.data || response.data || [];
      setPrograms(Array.isArray(programsData) ? programsData : []);
    } catch (err: any) {
      console.error('Error fetching programs:', err.message);
    }
  };

  const handleCreate = async () => {
    if (!formData.programId || !formData.name || !formData.startDate || !formData.endDate) {
      return alert('All fields required');
    }
    
    // Date validation
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      return alert('Start date must be before end date');
    }
    
    try {
      await termsAPI.create(formData);
      alert('Created!');
      setShowModal(false);
      resetForm();
      fetchTerms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedTerm) return;
    try {
      await termsAPI.update(selectedTerm.id, editData);
      alert('Updated!');
      setShowModal(false);
      resetForm();
      fetchTerms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await termsAPI.delete(id);
      alert('Deleted!');
      fetchTerms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await termsAPI.update(id, { isActive: !isActive });
      fetchTerms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (term: Term) => {
    setModalMode('edit');
    setSelectedTerm(term);
    setEditData({
      programId: term.programId,
      name: term.name,
      startDate: term.startDate.split('T')[0],
      endDate: term.endDate.split('T')[0]
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ programId: '', name: '', startDate: '', endDate: '', isActive: true });
    setEditData({});
    setSelectedTerm(null);
  };

  const filteredTerms = terms.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms Management</h1>
          <p className="text-gray-600">Manage academic terms</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          + Create Term
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <input
          type="text"
          placeholder="Search terms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTerms.map((term) => (
              <tr key={term.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{term.name}</td>
                <td className="px-6 py-4 text-gray-700">{term.program?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-gray-700">{new Date(term.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-700">{new Date(term.endDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-gray-700">{term._count?.groups || 0}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(term.id, term.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      term.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {term.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => openEditModal(term)} className="text-blue-600 hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(term.id, term.name)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'create' ? 'Add Term' : 'Edit Term'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                <select
                  value={modalMode === 'create' ? formData.programId : (editData.programId || '')}
                  onChange={(e) => modalMode === 'create' 
                    ? setFormData({ ...formData, programId: e.target.value })
                    : setEditData({ ...editData, programId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                >
                  <option value="">Select Program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={modalMode === 'create' ? formData.name : (editData.name || '')}
                  onChange={(e) => modalMode === 'create' 
                    ? setFormData({ ...formData, name: e.target.value })
                    : setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="Fall 2025"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={modalMode === 'create' ? formData.startDate : (editData.startDate || '')}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, startDate: e.target.value })
                    : setEditData({ ...editData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={modalMode === 'create' ? formData.endDate : (editData.endDate || '')}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, endDate: e.target.value })
                    : setEditData({ ...editData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {modalMode === 'create' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
