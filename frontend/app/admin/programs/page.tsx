'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { programsAPI, CreateProgramDto, UpdateProgramDto, termsAPI, groupsAPI, enrollmentsAPI } from '@/lib/api';

// ... (interface definitions remain the same)

export default function ProgramsManagement() {
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [formData, setFormData] = useState<CreateProgramDto>({ name: '', code: '', description: '' });
  const [editData, setEditData] = useState<UpdateProgramDto>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');

  // Expansion states
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Nested data states
  const [programTerms, setProgramTerms] = useState<Record<string, any[]>>({});
  const [termGroups, setTermGroups] = useState<Record<string, any[]>>({});
  const [groupStudents, setGroupStudents] = useState<Record<string, any[]>>({});

  // Fetch functions

  useEffect(() => {
    fetchPrograms();
  }, [filterStatus]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await programsAPI.getAll();
      let data = response.data || [];

      // Filter by status
      if (filterStatus === 'active') data = data.filter((p: any) => p.isActive);
      if (filterStatus === 'inactive') data = data.filter((p: any) => !p.isActive);

      setPrograms(data);
    } catch (err) {
      // console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramTerms = async (programId: string) => {
    if (programTerms[programId]) return;
    try {
      const response = await termsAPI.getAll({ programId });
      setProgramTerms(prev => ({ ...prev, [programId]: response.data.data || [] }));
    } catch (err) {
      // console.error('Error fetching terms:', err);
    }
  };

  const fetchTermGroups = async (termId: string) => {
    if (termGroups[termId]) return;
    try {
      const response = await groupsAPI.getAll({ termId });
      setTermGroups(prev => ({ ...prev, [termId]: response.data || [] }));
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchGroupStudents = async (groupId: string) => {
    if (groupStudents[groupId]) return;
    try {
      const response = await enrollmentsAPI.getByGroup(groupId);
      const students = (response.data || []).map((e: any) => ({
        id: e.student.id,
        name: `${e.student.firstName} ${e.student.secondName || ''}`.trim(),
        email: e.student.user?.email || 'N/A',
        currentLevel: e.student.currentLevel,
        status: e.status
      }));
      setGroupStudents(prev => ({ ...prev, [groupId]: students }));
    } catch (err) {
      // console.error('Error fetching students:', err);
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', code: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (program: any) => {
    setModalMode('edit');
    setSelectedProgram(program);
    setEditData({
      name: program.name,
      code: program.code,
      description: program.description || ''
    });
    setShowModal(true);
  };

  // CRUD handlers
  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      alert('Name and code are required');
      return;
    }
    try {
      await programsAPI.create(formData);
      alert('Program created successfully!');
      setShowModal(false);
      setFormData({ name: '', code: '', description: '' });
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProgram) return;
    try {
      await programsAPI.update(selectedProgram.id, editData);
      alert('Program updated successfully!');
      setShowModal(false);
      setEditData({});
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete program "${name}"? This will also delete all related terms.`)) return;
    try {
      await programsAPI.delete(id);
      alert('Program deleted successfully!');
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await programsAPI.update(id, { isActive: !currentStatus });
      fetchPrograms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('active');
  };

  const handleProgramClick = (programId: string) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
      setExpandedTerm(null);
      setExpandedGroup(null);
    } else {
      setExpandedProgram(programId);
      setExpandedTerm(null);
      setExpandedGroup(null);
      fetchProgramTerms(programId);
    }
  };

  const handleTermClick = (termId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedTerm === termId) {
      setExpandedTerm(null);
      setExpandedGroup(null);
    } else {
      setExpandedTerm(termId);
      setExpandedGroup(null);
      fetchTermGroups(termId);
    }
  };

  const handleGroupClick = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      fetchGroupStudents(groupId);
    }
  };

  const filtered = programs.filter(p => {
    const search = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return search;
  });

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.isActive).length,
    inactive: programs.filter(p => !p.isActive).length
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <header className="bg-white shadow-sm border-b"><div className="max-w-7xl mx-auto px-6 py-4"><div className="flex justify-between items-center"><div><button onClick={() => router.push('/admin')} className="text-indigo-600 hover:text-indigo-800 mb-2">← Back</button><h1 className="text-3xl font-bold text-gray-900">Programs</h1></div><button onClick={openCreateModal} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">+ Add Program</button></div></div></header>
  );

  const renderStats = () => (
    <div className="grid grid-cols-3 gap-6 mb-6"><div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Total</p><p className="text-3xl font-bold text-gray-900">{stats.total}</p></div><div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold text-green-600">{stats.active}</p></div><div className="bg-white rounded-lg shadow p-6"><p className="text-sm text-gray-600">Inactive</p><p className="text-3xl font-bold text-red-600">{stats.inactive}</p></div></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-4 mb-6"><div className="flex justify-between items-center mb-4"><h3 className="text-sm font-semibold text-gray-700">Filters</h3><button onClick={resetFilters} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Reset</button></div><div className="grid grid-cols-2 gap-4"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900"><option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option></select></div></div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div></div>
  );

  const renderStudentRow = (student: any) => (
    <div key={student.id} className="text-xs text-gray-700 flex items-center gap-2 p-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span><strong>{student.name}</strong><span className="text-gray-400">•</span><span>{student.email}</span>{student.currentLevel && <><span className="text-gray-400">•</span><span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{student.currentLevel}</span></>}</div>
  );

  const renderGroupRow = (group: any) => (
    <div key={group.id}><div onClick={(e) => handleGroupClick(group.id, e)} className="p-2 bg-white rounded hover:bg-gray-50 cursor-pointer"><div className="flex items-center gap-2"><span className="text-gray-400 text-xs">{expandedGroup === group.id ? '▼' : '▶'}</span><strong className="text-sm text-gray-900">{group.groupCode}</strong><span className="text-xs text-gray-600">Level: {group.level?.name || 'N/A'}</span><span className="text-xs text-gray-600">Teacher: {group.teacher?.firstName} {group.teacher?.lastName}</span></div></div>{expandedGroup === group.id && <div className="ml-8 mt-2 space-y-1">{groupStudents[group.id]?.length > 0 ? groupStudents[group.id].map(renderStudentRow) : <p className="text-xs text-gray-400 ml-4">No students enrolled</p>}</div>}</div>
  );

  const renderTermRow = (term: any) => (
    <div key={term.id}><div onClick={(e) => handleTermClick(term.id, e)} className="p-2 bg-white rounded hover:bg-gray-100 cursor-pointer flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-gray-400">{expandedTerm === term.id ? '▼' : '▶'}</span><span className="text-sm font-medium text-gray-900">{term.name}</span>{term.isCurrent && <span className="text-yellow-500" title="Current Term">⭐</span>}<span className="text-xs text-gray-500">({term._count?.groups || 0} groups)</span><span className="text-xs text-gray-400">{new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}</span></div></div>{expandedTerm === term.id && <div className="ml-8 mt-2 bg-gray-100 p-3 rounded"><h5 className="font-semibold text-sm text-gray-900 mb-2">Groups in {term.name}:</h5>{termGroups[term.id]?.length > 0 ? <div className="space-y-2">{termGroups[term.id].map(renderGroupRow)}</div> : <p className="text-xs text-gray-500">No groups in this term</p>}</div>}</div>
  );

  const renderProgramRow = (p: any) => (
    <React.Fragment key={p.id}>
      <tr onClick={
        () => handleProgramClick(p.id)} className="hover:bg-gray-50 cursor-pointer">
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">{expandedProgram === p.id ? '▼' : '▶'}</span>
            <span className="font-medium text-gray-900">{p.name}</span>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">{p.description || 'N/A'}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{p._count?.terms || 0} terms</td>
        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
        <td className="px-6 py-4 text-sm space-x-2">
          <button onClick={
            (e) => {
              e.stopPropagation();
              openEditModal(p);
            }} className="text-blue-600 hover:text-blue-800">Edit</button>
          <button onClick={(e) => { e.stopPropagation(); handleToggle(p.id, p.isActive); }} className="text-orange-600 hover:text-orange-800">{p.isActive ? 'Deactivate' : 'Activate'}</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id, p.name); }} className="text-red-600 hover:text-red-800">Delete</button>
        </td>
      </tr>
      {expandedProgram === p.id && <tr>
        <td colSpan={5} className="px-6 py-4 bg-gray-50">
          <div className="ml-8">
            <h4 className="font-semibold text-gray-900 mb-2">Terms in {p.name}:</h4>
            {programTerms[p.id]?.length > 0 ? <div className="space-y-2">{programTerms[p.id].map(renderTermRow)}</div> : <p className="text-sm text-gray-500">No terms in this program</p>}
          </div>
        </td>
      </tr>}
    </React.Fragment>
  );

  const renderTable = () => (
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
        <tbody className="bg-white divide-y divide-gray-200">{filtered.map(renderProgramRow)}</tbody>
      </table>
      {filtered.length === 0 && <div className="text-center py-12 text-gray-900">No programs found</div>}
    </div>
  );

  const renderModalForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <input type="text" value={modalMode === 'create' ? formData.name : editData.name} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, name: e.target.value }) : setEditData({ ...editData, name: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900" placeholder="e.g., IELTS Preparation" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea value={modalMode === 'create' ? formData.description : editData.description} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, description: e.target.value }) : setEditData({ ...editData, description: e.target.value })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
        <input type="text" value={modalMode === 'create' ? formData.code : editData.code} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, code: e.target.value.toUpperCase() }) : setEditData({ ...editData, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border-2 border-gray-400 rounded-lg text-gray-900" placeholder="e.g., IELTS-PREP" />
      </div>
    </div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'create' ? 'Add Program' : 'Edit Program'}</h2>
        {renderModalForm()}
        <div className="mt-6 flex space-x-3">
          <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{modalMode === 'create' ? 'Create' : 'Update'}</button>
        </div>
      </div>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================


  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderStats()}

        {renderFilters()}

        {loading ? renderLoadingState() : renderTable()}
      </main>

      {renderModal()}
    </div>
  );
}