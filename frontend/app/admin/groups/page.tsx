'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import GroupCard, { GroupCardData } from '@/components/shared/GroupCard';

export default function AdminGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = getToken();

      // Admin fetches ALL groups (no teacherId filter)
      const response = await fetch('http://localhost:3001/api/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch groups');

      const data = await response.json();
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
      const token = getToken();
      const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete group');

      // Refresh list
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold">Error loading groups</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={fetchGroups}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Manage Groups</h1>
              <p className="text-blue-100">View and manage all teaching groups</p>
            </div>
            <button
              onClick={() => router.push('/admin/groups/create')}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              + Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by group code, name, or level..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Total Groups</p>
            <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Active Students</p>
            <p className="text-3xl font-bold text-green-600">
              {groups.reduce((sum, g) => sum + g._count.enrollments, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Avg. Students/Group</p>
            <p className="text-3xl font-bold text-blue-600">
              {groups.length > 0
                ? Math.round(groups.reduce((sum, g) => sum + g._count.enrollments, 0) / groups.length)
                : 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Capacity Usage</p>
            <p className="text-3xl font-bold text-orange-600">
              {groups.length > 0
                ? Math.round(
                    (groups.reduce((sum, g) => sum + g._count.enrollments, 0) /
                      groups.reduce((sum, g) => sum + g.capacity, 0)) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'No groups match your search.' : 'No groups created yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => router.push('/admin/groups/create')}
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                showTeacher={true}        // Admin SEES teacher
                showActions={true}         // Admin CAN edit/delete
                showTeacherActions={false} // Admin doesn't need attendance buttons
                onEdit={(id) => router.push(`/admin/groups/${id}/edit`)}
                onDelete={handleDelete}
                onClick={(id) => router.push(`/admin/groups/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}