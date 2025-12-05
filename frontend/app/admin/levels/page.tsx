'use client';

import { useState, useEffect } from 'react';
import { levelsAPI, CreateLevelDto, UpdateLevelDto } from '@/lib/api';

interface Level {
  id: string;
  name: string;
  description?: string;
  orderNumber: number;
  _count?: { groups: number };
}

export default function LevelsManagement() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const [formData, setFormData] = useState<CreateLevelDto>({
    name: '',
    description: '',
    orderNumber: 0
  });

  const [editData, setEditData] = useState<UpdateLevelDto>({});

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const data = await levelsAPI.getAll();
      setLevels((data.data || []).sort((a: Level, b: Level) => a.orderNumber - b.orderNumber));
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return alert('Name required');
    
    // Check for duplicate orderNumber
    const existingOrder = levels.find(l => l.orderNumber === formData.orderNumber);
    if (existingOrder) {
      alert(`A level with order index ${formData.orderNumber} already exists (${existingOrder.name})`);
      return;
    }
    
    try {
      await levelsAPI.create(formData);
      alert('Created!');
      setShowModal(false);
      resetForm();
      fetchLevels();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedLevel) return;
    try {
      await levelsAPI.update(selectedLevel.id, editData);
      alert('Updated!');
      setShowModal(false);
      resetForm();
      fetchLevels();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await levelsAPI.delete(id);
      alert('Deleted!');
      fetchLevels();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setFormData({ name: '', description: '', orderNumber: levels.length + 1 });
    setShowModal(true);
  };

  const openEditModal = (level: Level) => {
    setModalMode('edit');
    setSelectedLevel(level);
    setEditData({
      name: level.name,
      description: level.description || '',
      orderNumber: level.orderNumber
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', orderNumber: 0 });
    setEditData({});
    setSelectedLevel(null);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Levels Management</h1>
          <p className="text-gray-600">Manage proficiency levels (A1, A2, B1, B2, etc.)</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          + Create Level
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {levels.map((level) => (
              <tr key={level.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{level.orderNumber}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{level.name}</td>
                <td className="px-6 py-4 text-gray-600">{level.description || '-'}</td>
                <td className="px-6 py-4 text-gray-900">{level._count?.groups || 0}</td>
                <td className="px-6 py-4">
                  <button onClick={() => openEditModal(level)} className="text-blue-600 hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(level.id, level.name)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{modalMode === 'create' ? 'Create' : 'Edit'} Level</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={modalMode === 'create' ? formData.name : (editData.name || '')}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, name: e.target.value })
                    : setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  placeholder="A1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={modalMode === 'create' ? formData.description : (editData.description || '')}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, description: e.target.value })
                    : setEditData({ ...editData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Beginner level"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order Index *</label>
                <input
                  type="number"
                  value={modalMode === 'create' ? formData.orderNumber : (editData.orderNumber || 0)}
                  onChange={(e) => modalMode === 'create'
                    ? setFormData({ ...formData, orderNumber: parseInt(e.target.value) })
                    : setEditData({ ...editData, orderNumber: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 border rounded-lg text-gray-900"
                  min="1"
                />
                <p className="text-xs text-gray-600 mt-1">Must be unique</p>
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
