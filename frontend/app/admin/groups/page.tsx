'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import GroupCard, { GroupCardData } from '@/components/shared/GroupCard';
import { groupsAPI } from '@/lib/api';
export default function AdminGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'all' | 'inactive'>('active');

  useEffect(() => {
    fetchGroups();
  }, [filterStatus]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus === 'active') params.isActive = true;
      else if (filterStatus === 'inactive') params.isActive = false;
      
      const data = await groupsAPI.getAll(params);

      setGroups(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await groupsAPI.delete(id);
      fetchGroups();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleReactivate = async (id: string, name: string) => {
    if (!confirm(`Reactivate "${name}"?`)) return;

    try {
      await groupsAPI.reactivate(id);
      fetchGroups();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.groupCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.level.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderLoadingState = () => <div className="p-8">Loading...</div>;

  const renderErrorState = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <p className="text-red-800 font-semibold">Error loading groups</p>
      <p className="text-red-600 mt-2">{error}</p>
      <button onClick={fetchGroups} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Try Again</button>
    </div>
  );

  const renderHeader = () => (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Groups Management</h1>
        <p className="text-gray-600">View and manage all teaching groups</p>
      </div>
      <button onClick={() => router.push('/admin/groups/create')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">+ Create Group</button>
    </div>
  );

  const renderSearchBar = () => (
    <div className="mb-6 flex gap-4">
      <input type="text" placeholder="Search by group code, name, or level..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900">
        <option value="active">Active Only</option><option value="all">All Items</option><option value="inactive">Inactive Only</option>
      </select>
      <button onClick={() => setSearchTerm('')} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Reset</button>
    </div>
  );

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Total Groups</p><p className="text-3xl font-bold text-gray-900">{groups.length}</p></div>
      <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Active Students</p><p className="text-3xl font-bold text-green-600">{groups.reduce((sum, g) => sum + g._count.enrollments, 0)}</p></div>
      <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Avg. Students/Group</p><p className="text-3xl font-bold text-blue-600">{groups.length > 0 ? Math.round(groups.reduce((sum, g) => sum + g._count.enrollments, 0) / groups.length) : 0}</p></div>
      <div className="bg-white rounded-lg shadow p-4"><p className="text-gray-600 text-sm mb-1">Capacity Usage</p><p className="text-3xl font-bold text-orange-600">{groups.length > 0 ? Math.round((groups.reduce((sum, g) => sum + g._count.enrollments, 0) / groups.reduce((sum, g) => sum + g.capacity, 0)) * 100) : 0}%</p></div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <p className="text-gray-600 text-lg">{searchTerm ? 'No groups match your search.' : 'No groups created yet.'}</p>
      {!searchTerm && <button onClick={() => router.push('/admin/groups/create')} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create First Group</button>}
    </div>
  );

  const renderGroupsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGroups.map((group) => (
        <GroupCard key={group.id} group={group} showTeacher={true} showActions={true} showTeacherActions={false} onEdit={(id) => router.push(`/admin/groups/${id}/edit`)} onDelete={handleDelete} onReactivate={handleReactivate} />
      ))}
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  return (
    <div>
      {renderHeader()}
      {renderSearchBar()}
      {renderStats()}
      {filteredGroups.length === 0 ? renderEmptyState() : renderGroupsGrid()}
    </div>
  );
}