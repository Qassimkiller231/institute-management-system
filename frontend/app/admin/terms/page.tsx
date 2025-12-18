'use client';

import React, { useState, useEffect } from 'react';
import { termsAPI, CreateTermDto, UpdateTermDto, programsAPI, groupsAPI, enrollmentsAPI } from '@/lib/api';

interface Term {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  programId: string;
  isActive: boolean;
  isCurrent: boolean;
  program?: {
    id: string;
    name: string;
  };
  _count?: {
    groups: number;
  };
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
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'current' | 'non-current'>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  // Drill-down state
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [termGroups, setTermGroups] = useState<Record<string, any[]>>({});
  const [groupStudents, setGroupStudents] = useState<Record<string, any[]>>({});

  const [formData, setFormData] = useState<CreateTermDto>({
    programId: '',
    name: '',
    startDate: '',
    endDate: '',
    isActive: true,
    isCurrent: false
  });

  const [editData, setEditData] = useState<UpdateTermDto>({});

  useEffect(() => { fetchPrograms(); }, []);
  useEffect(() => { fetchTerms(); }, [filterStatus, programFilter, currentFilter]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      let isActiveParam: boolean | undefined = undefined;
      if (filterStatus === 'active') isActiveParam = true;
      else if (filterStatus === 'inactive') isActiveParam = false;

      // console.log('🔍 TERMS DEBUG:', { filterStatus, isActiveParam });

      const response = await termsAPI.getAll(isActiveParam !== undefined ? { isActive: isActiveParam } : undefined);
      // console.log('📦 TERMS RESPONSE:', response);

      // Handle nested structure: response.data.data for paginated responses
      const termsData = response.data?.data || response.data || [];

      // Apply client-side filters
      let filtered = termsData;

      // Filter by program
      if (programFilter !== 'all') {
        filtered = filtered.filter((t: Term) => t.programId === programFilter);
      }

      // Filter by current status
      if (currentFilter === 'current') {
        filtered = filtered.filter((t: Term) => t.isCurrent);
      } else if (currentFilter === 'non-current') {
        filtered = filtered.filter((t: Term) => !t.isCurrent);
      }

      setTerms(filtered.sort((a: Term, b: Term) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
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
      // console.error('Error fetching programs:', err.message);
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

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Reactivate "${name}"?`)) return;
    try {
      await termsAPI.reactivate(id);
      alert('Term reactivated successfully!');
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

  const handleSetCurrent = async (termId: string) => {
    try {
      await termsAPI.setCurrentTerm(termId);
      await fetchTerms();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Drill-down fetch functions
  const fetchTermGroups = async (termId: string) => {
    if (termGroups[termId]) return;
    try {
      const response = await groupsAPI.getAll();
      const allGroups = response.data?.data || response.data || [];
      const filtered = allGroups.filter((g: any) => g.termId === termId && g.isActive);
      setTermGroups(prev => ({ ...prev, [termId]: filtered }));
    } catch (err) {
      // console.error('Error fetching groups:', err);
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

  const handleTermClick = (termId: string) => {
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
      endDate: term.endDate.split('T')[0],
      isCurrent: term.isCurrent
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ programId: '', name: '', startDate: '', endDate: '', isActive: true, isCurrent: false });
    setEditData({});
    setSelectedTerm(null);
  };

  const filteredTerms = terms.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6 flex justify-between items-center"><div><h1 className="text-3xl font-bold mb-2">Terms Management</h1><p className="text-gray-600">Manage academic terms</p></div><button onClick={openCreateModal} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">+ Create Term</button></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow mb-6 p-4"><div className="flex gap-4 items-center"><input type="text" placeholder="Search terms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg text-gray-900" /><select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border rounded-lg text-gray-900"><option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option></select><select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-gray-900 min-w-[180px]"><option value="all">All Programs</option>{programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><select value={currentFilter} onChange={(e) => setCurrentFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg text-gray-900 min-w-[150px]"><option value="all">All Terms</option><option value="current">Current Only</option><option value="non-current">Non-Current</option></select><button onClick={() => { setSearchTerm(''); setProgramFilter('all'); setCurrentFilter('all'); setFilterStatus('active'); }} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Reset</button></div></div>
  );

  const renderLoadingState = () => (
    <div className="p-8">Loading...</div>
  );

  const renderStudentExpansion = (group: any) => expandedGroup !== group.id ? null : (
    <div className="ml-8 mt-2 space-y-1 bg-gray-100 p-3 rounded"><h5 className="font-semibold text-xs text-gray-900 mb-2">Students in {group.groupCode}:</h5>{groupStudents[group.id]?.length > 0 ? groupStudents[group.id].map((student: any) => <div key={student.id} className="text-xs text-gray-700 flex items-center gap-2 p-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span><strong>{student.name}</strong><span className="text-gray-400">•</span><span>{student.email}</span>{student.currentLevel && <><span className="text-gray-400">•</span><span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{student.currentLevel}</span></>}</div>) : <p className="text-xs text-gray-400">No students enrolled</p>}</div>
  );

  const renderGroupExpansion = (term: Term) => expandedTerm !== term.id ? null : (
    <tr><td colSpan={7} className="px-6 py-4 bg-gray-50"><div className="ml-8"><h4 className="font-semibold text-gray-900 mb-2">Groups in {term.name}:</h4>{termGroups[term.id]?.length > 0 ? <div className="space-y-2">{termGroups[term.id].map((group: any) => <div key={group.id}><div onClick={(e) => handleGroupClick(group.id, e)} className="p-2 bg-white rounded hover:bg-gray-100 cursor-pointer"><div className="flex items-center gap-2"><span className="text-gray-400 text-xs">{expandedGroup === group.id ? '▼' : '▶'}</span><strong className="text-sm text-gray-900">{group.groupCode}</strong><span className="text-xs text-gray-600">Level: {group.level?.name || 'N/A'}</span><span className="text-xs text-gray-600">Teacher: {group.teacher?.firstName} {group.teacher?.lastName}</span></div></div>{renderStudentExpansion(group)}</div>)}</div> : <p className="text-sm text-gray-500">No groups in this term</p>}</div></td></tr>
  );

  const renderTermRow = (term: Term) => (
    <React.Fragment key={term.id}><tr onClick={() => handleTermClick(term.id)} className="hover:bg-gray-50 cursor-pointer"><td className="px-6 py-4 font-medium text-gray-900"><div className="flex items-center gap-2"><span className="text-gray-400">{expandedTerm === term.id ? '▼' : '▶'}</span><span>{term.name}</span></div></td><td className="px-6 py-4 text-gray-700">{term.program?.name || 'N/A'}</td><td className="px-6 py-4 text-gray-700">{new Date(term.startDate).toLocaleDateString()}</td><td className="px-6 py-4 text-gray-700">{new Date(term.endDate).toLocaleDateString()}</td><td className="px-6 py-4 text-gray-700">{term._count?.groups || 0} groups</td><td className="px-6 py-4"><div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); handleToggle(term.id, term.isActive); }} className={`px-3 py-1 rounded-full text-xs font-semibold ${term.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{term.isActive ? 'Active' : 'Inactive'}</button>{term.isCurrent && <span className="text-yellow-500 text-lg" title="Current Term">⭐</span>}<button onClick={(e) => { e.stopPropagation(); handleSetCurrent(term.id); }} className="text-blue-600 hover:underline text-xs">{term.isCurrent ? 'Unset' : 'Set Current'}</button></div></td><td className="px-6 py-4"><button onClick={(e) => { e.stopPropagation(); openEditModal(term); }} className="text-blue-600 hover:underline mr-4">Edit</button>{!term.isActive ? <button onClick={(e) => { e.stopPropagation(); handleReactivate(term.id, term.name); }} className="text-green-600 hover:underline">Reactivate</button> : <button onClick={(e) => { e.stopPropagation(); handleDelete(term.id, term.name); }} className="text-red-600 hover:underline">Delete</button>}</td></tr>{renderGroupExpansion(term)}</React.Fragment>
  );

  const renderTermsTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden"><table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groups</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredTerms.map(renderTermRow)}</tbody></table></div>
  );

  const renderModalForm = () => (
    <div className="space-y-4"><div><label className="block text-sm font-medium text-gray-700 mb-2">Program *</label><select value={modalMode === 'create' ? formData.programId : (editData.programId || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, programId: e.target.value }) : setEditData({ ...editData, programId: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900"><option value="">Select Program</option>{programs.map(program => <option key={program.id} value={program.id}>{program.name} ({program.code})</option>)}</select></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Name *</label><input type="text" value={modalMode === 'create' ? formData.name : (editData.name || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, name: e.target.value }) : setEditData({ ...editData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" placeholder="Fall 2025" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label><input type="date" value={modalMode === 'create' ? formData.startDate : (editData.startDate || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, startDate: e.target.value }) : setEditData({ ...editData, startDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" /></div><div><label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label><input type="date" value={modalMode === 'create' ? formData.endDate : (editData.endDate || '')} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, endDate: e.target.value }) : setEditData({ ...editData, endDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg text-gray-900" /></div><div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg"><input type="checkbox" id="isCurrent" checked={modalMode === 'create' ? (formData.isCurrent || false) : (editData.isCurrent || false)} onChange={(e) => modalMode === 'create' ? setFormData({ ...formData, isCurrent: e.target.checked }) : setEditData({ ...editData, isCurrent: e.target.checked })} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" /><div><label htmlFor="isCurrent" className="block text-sm font-medium text-gray-900">Current Term?</label><p className="text-xs text-gray-500">If checked, this will become the active term for the selected program. Any existing current term for this program will be unset.</p></div></div></div>
  );

  const renderModal = () => !showModal ? null : (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="bg-white rounded-lg p-8 max-w-md w-full"><h2 className="text-2xl font-bold mb-6 text-gray-900">{modalMode === 'create' ? 'Add Term' : 'Edit Term'}</h2>{renderModalForm()}<div className="flex gap-3 mt-6"><button onClick={() => { setShowModal(false); resetForm(); }} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button><button onClick={modalMode === 'create' ? handleCreate : handleUpdate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{modalMode === 'create' ? 'Create' : 'Update'}</button></div></div></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) return renderLoadingState();


  return (
    <div>
      {renderHeader()}
      {renderFilters()}
      {renderTermsTable()}
      {renderModal()}
    </div>
  );
}