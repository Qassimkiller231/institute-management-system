'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import { authAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';

// ========================================
// TYPES
// ========================================

interface LinkedStudent {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  email?: string;
  currentLevel?: string;
  relationship?: string;
}

interface ParentInfo {
  parent?: {
    firstName: string;
    lastName: string;
    parentStudentLinks?: Array<{
      id: string;
      relationship: string;
      student: any;
    }>;
  };
}

export default function ParentDashboard() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [students, setStudents] = useState<LinkedStudent[]>([]);

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Load parent data on mount
   */
  useEffect(() => {
    fetchParentData();
  }, []);

  // ========================================
  // DATA LOADING
  // ========================================
  
  /**
   * Fetch parent and linked student data
   */
  const fetchParentData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Get current user info (includes parent data)
      const userData = await authAPI.getCurrentUser();
      setParentInfo(userData.data);

      // Extract linked students from parent data
      if (userData.data.parent?.parentStudentLinks) {
        const linkedStudents = userData.data.parent.parentStudentLinks.map((link: any) => ({
          ...link.student,
          relationship: link.relationship,
          linkId: link.id
        }));
        setStudents(linkedStudents);
      }
    } catch (err: any) {
      // console.error('Error loading parent data:', err); // Debug
      // Could show error message to user instead of alert
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Welcome card with parent name
   */
  const renderWelcomeCard = () => {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {parentInfo?.parent?.firstName} {parentInfo?.parent?.lastName}!
        </h2>
        <p className="text-blue-100">
          View and manage your children's educational progress
        </p>
      </div>
    );
  };

  /**
   * Individual stat card
   */
  const renderStatCard = (stat: { label: string; value: number | string; icon: string; color: string }) => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
          <div className={`${stat.color} p-3 rounded-full`}>
            <span className="text-2xl">{stat.icon}</span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Stats cards section
   */
  const renderStatsCards = () => {
    const stats = [
      {
        label: 'Linked Children',
        value: students.length,
        icon: '👶',
        color: 'bg-blue-100',
      },
      {
        label: 'Active Enrollments',
        value: 0,
        icon: '📚',
        color: 'bg-green-100',
      },
      {
        label: 'Pending Payments',
        value: '$0',
        icon: '💳',
        color: 'bg-yellow-100',
      },
    ];

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index}>
            {renderStatCard(stat)}
          </div>
        ))}
      </div>
    );
  };

  /**
   * Individual student card
   */
  const renderStudentCard = (student: LinkedStudent) => {
    return (
      <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">
              {student.firstName} {student.secondName} {student.thirdName}
            </h4>
            <p className="text-sm text-gray-600 mt-1">CPR: {student.cpr}</p>
            {student.email && (
              <p className="text-sm text-gray-600">Email: {student.email}</p>
            )}
            {student.currentLevel && (
              <p className="text-sm text-blue-600 mt-2">
                Current Level: <span className="font-medium">{student.currentLevel}</span>
              </p>
            )}
          </div>
          {student.relationship && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {student.relationship}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push(`/parent/children/${student.id}`)}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          View Details
        </button>
      </div>
    );
  };

  /**
   * Linked students section
   */
  const renderLinkedStudents = () => {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">My Children</h3>
        </div>
        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No children linked yet</p>
              <p className="text-sm">Contact the administration to link your children to your account</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {students.map((student) => renderStudentCard(student))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Individual quick action button
   */
  const renderQuickActionButton = (action: {
    icon: string;
    title: string;
    description: string;
    path: string;
    hoverColor: string;
  }) => {
    return (
      <button
        onClick={() => router.push(action.path)}
        className={`p-4 border-2 border-gray-200 rounded-lg ${action.hoverColor} transition text-left`}
      >
        <span className="text-2xl mb-2 block">{action.icon}</span>
        <h4 className="font-semibold text-gray-900">{action.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
      </button>
    );
  };

  /**
   * Quick actions section
   */
  const renderQuickActions = () => {
    const actions = [
      {
        icon: '📢',
        title: 'View Announcements',
        description: 'Stay updated with latest news',
        path: '/parent/announcements',
        hoverColor: 'hover:border-blue-500 hover:bg-blue-50',
      },
      {
        icon: '📚',
        title: 'Access Materials',
        description: 'View learning resources',
        path: '/parent/materials',
        hoverColor: 'hover:border-green-500 hover:bg-green-50',
      },
      {
        icon: '💳',
        title: 'Make Payment',
        description: 'Pay fees and view history',
        path: '/parent/payments',
        hoverColor: 'hover:border-yellow-500 hover:bg-yellow-50',
      },
    ];

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6 grid md:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <div key={index}>
              {renderQuickActionButton(action)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render main dashboard content
   */
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        {renderWelcomeCard()}
        {renderStatsCards()}
        {renderLinkedStudents()}
        {renderQuickActions()}
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return renderDashboard();
}
