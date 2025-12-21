'use client';

import { useState, useEffect } from 'react';
import { venuesAPI, CreateVenueDto, UpdateVenueDto } from '@/lib/api';

interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  capacity?: number;
  _count?: { halls: number };
}

export default function VenuesManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const [formData, setFormData] = useState<CreateVenueDto>({
    name: '',
    code: '',
    address: '',
    city: '',
    capacity: 0
  });

  const [editData, setEditData] = useState<UpdateVenueDto>({});

  useEffect(() => { fetchVenues(); }, [filterStatus]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      let isActiveParam: boolean | undefined = undefined;
      if (filterStatus === 'active') isActiveParam = true;
      else if (filterStatus === 'inactive') isActiveParam = false;

      const data = await venuesAPI.getAll(isActiveParam);
      setVenues(data.data || []);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name) return alert('Name required');
    try {
      await venuesAPI.create(formData);
      alert('Created!');
      setShowModal(false);
      resetForm();
      fetchVenues();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedVenue) return;
    try {
      await venuesAPI.update(selectedVenue.id, editData);
      alert('Updated!');
      setShowModal(false);
      resetForm();
      fetchVenues();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await venuesAPI.delete(id);
      alert('Deleted!');
      fetchVenues();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Reactivate "${name}"?`)) return;
    try {
      await venuesAPI.reactivate(id);
      alert('Venue reactivated successfully!');
      fetchVenues();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (venue: Venue) => {
    setModalMode('edit');
    setSelectedVenue(venue);
    setEditData({
      name: venue.name,
      address: venue.address || '',
      city: venue.city || '',
      capacity: venue.capacity || 0
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', address: '', city: '', capacity: 0 });
    setEditData({});
    setSelectedVenue(null);
  };

  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.city && v.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Venues Management</h1>
        <p className="text-gray-600">Manage teaching venues and locations</p>
      </div>
      <div className="flex gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border rounded-lg text-gray-900">
          <option value="active">Active Only</option>
          <option value="all">All Items</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">+ Create Venue</button>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="bg-white rounded-lg shadow mb-6 p-4">
      <div className="flex gap-3">
        <input type="text" placeholder="Search venues..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg text-gray-900" />
        <button onClick={() => setSearchTerm('')} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Reset</button>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="p-8">Loading...</div>
  );

  const renderVenueRow = (venue: Venue) => (
    <tr key={venue.id} className={`${!(venue as any).isActive ? 'bg-gray-100 opacity-60' : ''} hover:bg-gray-50`}><td className="px-6 py-4 font-medium text-gray-900">{venue.name}{!(venue as any).isActive && <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Inactive</span>}</td><td className="px-6 py-4 text-sm text-gray-600">{venue.address || '-'}</td><td className="px-6 py-4 text-gray-900">{venue._count?.halls || 0}</td><td className="px-6 py-4"><button onClick={() => openEditModal(venue)} className="text-blue-600 hover:underline mr-4">Edit</button>{!(venue as any).isActive ? <button onClick={() => handleReactivate(venue.id, venue.name)} className="text-green-600 hover:underline">Reactivate</button> : <button onClick={() => handleDelete(venue.id, venue.name)} className="text-red-600 hover:underline">Delete</button>}</td></tr>
  );

  const renderVenuesTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden"><table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Halls</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredVenues.map(renderVenueRow)}</tbody></table></div>
  );

  const renderModalForm = () => (
    <div className="space-y-4">
      <div><label className="block text-base text-gray-900 font-medium mb-2">Name *</label><input type="text" value={modalMode === 'create' ? formData.name : (editData.name || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, name: e.target.value }) : setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="Main Campus" /></div>
      {modalMode === 'create' && <div><label className="block text-base text-gray-900 font-medium mb-1">Venue Code *</label><input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. MAIN-HALL" required /></div>}
      <div><label className="block text-base text-gray-900 font-medium mb-2">Address</label><input type="text" value={modalMode === 'create' ? formData.address : (editData.address || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, address: e.target.value }) : setEditData({ ...editData, address: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="Building 123, Road 456" /></div>
    </div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{modalMode === 'create' ? 'Create' : 'Edit'} Venue</h2>
        {renderModalForm()}
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
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
      {renderSearch()}
      {renderVenuesTable()}
      {renderModal()}
    </div>
  );
}