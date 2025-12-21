'use client';

import { useState, useEffect } from 'react';
import { hallsAPI, venuesAPI, CreateHallDto, UpdateHallDto } from '@/lib/api';

interface Hall {
  id: string;
  name: string;
  code: string;
  capacity: number;
  venueId: string;
  venue?: { name: string };
  _count?: { sessions: number };
}

interface Venue {
  id: string;
  name: string;
}

export default function HallsManagement() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [venueFilter, setVenueFilter] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);

  const [formData, setFormData] = useState<CreateHallDto>({
    name: '',
    code: '',
    capacity: 20,
    venueId: ''
  });

  const [editData, setEditData] = useState<UpdateHallDto>({});

  useEffect(() => {
    fetchVenues();
    fetchHalls();
  }, [filterStatus]);

  const fetchVenues = async () => {
    try {
      const data = await venuesAPI.getAll(true); // Only fetch active venues
      setVenues(data.data || []);
    } catch (err: any) {
      alert('Error fetching venues: ' + err.message);
    }
  };

  const fetchHalls = async () => {
    try {
      setLoading(true);
      let isActiveParam: boolean | undefined = undefined;
      if (filterStatus === 'active') isActiveParam = true;
      else if (filterStatus === 'inactive') isActiveParam = false;

      const data = await hallsAPI.getAll(venueFilter || undefined, isActiveParam);
      setHalls(data.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.code || !formData.venueId) {
      return alert('Name, Code, and Venue are required');
    }
    try {
      await hallsAPI.create(formData);
      alert('Created!');
      setShowModal(false);
      resetForm();
      fetchHalls();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedHall) return;
    try {
      await hallsAPI.update(selectedHall.id, editData);
      alert('Updated!');
      setShowModal(false);
      resetForm();
      fetchHalls();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await hallsAPI.delete(id);
      alert('Deleted!');
      fetchHalls();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Reactivate "${name}"?`)) return;
    try {
      await hallsAPI.reactivate(id);
      alert('Hall reactivated successfully!');
      fetchHalls();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (hall: Hall) => {
    setModalMode('edit');
    setSelectedHall(hall);
    setEditData({
      name: hall.name,
      code: hall.code,
      capacity: hall.capacity,
      venueId: hall.venueId
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', capacity: 20, venueId: '' });
    setEditData({});
    setSelectedHall(null);
  };

  const filteredHalls = halls.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.venue?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVenue = !venueFilter || h.venueId === venueFilter;
    return matchesSearch && matchesVenue;
  });

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderLoadingState = () => <div className="p-8">Loading...</div>;

  const renderHeader = () => (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Halls Management</h1>
        <p className="text-gray-600">Manage classroom halls within venues</p>
      </div>
      <button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">+ Create Hall</button>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow mb-6 p-4 flex gap-4">
      <input type="text" placeholder="Search halls..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400" />
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border rounded-lg text-gray-900">
        <option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option>
      </select>
      <select value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900">
        <option value="">All Venues</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
      </select>
    </div>
  );

  const renderTableRow = (hall: Hall) => (
    <tr key={hall.id} className={`${!(hall as any).isActive ? 'bg-gray-100 opacity-60' : ''} hover:bg-gray-50`}>
      <td className="px-6 py-4 font-medium text-gray-900">{hall.name}{!(hall as any).isActive && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Inactive</span>}</td>
      <td className="px-6 py-4 text-gray-700">{hall.venue?.name || '-'}</td>
      <td className="px-6 py-4 text-gray-700">{hall.capacity}</td>
      <td className="px-6 py-4 text-gray-700">{hall._count?.sessions || 0}</td>
      <td className="px-6 py-4">
        <button onClick={() => openEditModal(hall)} className="text-blue-600 hover:underline mr-4">Edit</button>
        {!(hall as any).isActive ? <button onClick={() => handleReactivate(hall.id, hall.name)} className="text-green-600 hover:underline">Reactivate</button> : <button onClick={() => handleDelete(hall.id, hall.name)} className="text-red-600 hover:underline">Delete</button>}
      </td>
    </tr>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Hall Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Venue</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sessions</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{filteredHalls.map(renderTableRow)}</tbody>
      </table>
    </div>
  );

  const renderModalForm = () => (
    <div className="space-y-4">
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label><select value={modalMode === 'create' ? formData.venueId : (editData.venueId || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, venueId: e.target.value }) : setEditData({ ...editData, venueId: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900"><option value="">Select Venue</option>{venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Hall Name *</label><input type="text" value={modalMode === 'create' ? formData.name : (editData.name || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, name: e.target.value }) : setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="Hall A" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Hall Code *</label><input type="text" value={modalMode === 'create' ? formData.code : (editData.code || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, code: e.target.value }) : setEditData({ ...editData, code: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="A101" /></div>
      <div><label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label><input type="number" value={modalMode === 'create' ? formData.capacity : (editData.capacity || 0)} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 }) : setEditData({ ...editData, capacity: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="20" min="1" /></div>
    </div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{modalMode === 'create' ? 'Create' : 'Edit'} Hall</h2>
        {renderModalForm()}
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modalMode === 'create' ? 'Create' : 'Update'}</button>
        </div>
      </div>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) return renderLoadingState();

  return (
    <div>
      {renderHeader()}
      {renderFilters()}
      {renderTable()}
      {renderModal()}
    </div>
  );
}
