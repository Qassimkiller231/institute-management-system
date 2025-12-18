'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId } from '@/lib/authStorage';
import { groupsAPI } from '@/lib/api';
import GroupCard, { GroupCardData } from '@/components/shared/GroupCard';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

export default function TeacherGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      if (!teacherId) {
        setError('Teacher ID not found');
        return;
      }

      const data = await groupsAPI.getAll({ teacherId });
      setGroups(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/teacher')}
            className="mb-4 text-indigo-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">My Groups</h1>
          <p className="text-indigo-100">Manage your assigned teaching groups</p>
        </div>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-600 text-lg">No groups assigned yet.</p>
      </div>
    );
  };

  /**
   * Render groups grid
   */
  const renderGroupsGrid = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            showTeacher={false}
            showActions={false}
            showTeacherActions={true}
            onClick={(id) => router.push(`/teacher/groups/${id}`)}
          />
        ))}
      </div>
    );
  };

  /**
   * Render groups section
   */
  const renderGroupsSection = () => {
    if (groups.length === 0) {
      return renderEmptyState();
    }

    return renderGroupsGrid();
  };

  /**
   * Render main groups page
   */
  const renderGroupsPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderGroupsSection()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading groups..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Error loading groups"
        message={error}
        onRetry={fetchGroups}
      />
    );
  }

  return renderGroupsPage();
}