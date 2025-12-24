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
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  relationship?: string;
  linkId?: string;
}

export default function MyChildrenPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Load children data on mount
   */
  useEffect(() => {
    fetchChildren();
  }, []);

  // ========================================
  // DATA LOADING
  // ========================================
  
  /**
   * Fetch children linked to parent account
   */
  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const userData = await authAPI.getCurrentUser();

      if (userData.data.parent?.parentStudentLinks) {
        const linkedStudents = userData.data.parent.parentStudentLinks.map((link: any) => ({
          ...link.student,
          relationship: link.relationship,
          linkId: link.id
        }));
        setStudents(linkedStudents);
      }
    } catch (err: any) {
      // console.error('Error loading children:', err); // Debug
      // Could show error message to user instead of alert
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Filter students based on search term
   */
  const getFilteredStudents = (): LinkedStudent[] => {
    return students.filter(s => {
      const matchesSearch = (s.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.secondName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.cpr || '').includes(searchTerm);
      return matchesSearch;
    });
  };

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth?: string): number | string => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render header with search
   */
  const renderHeader = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Children</h2>
        <p className="text-gray-600 mb-4">View and track your children&apos;s educational progress</p>
        
        <input
          type="text"
          placeholder="Search by name or CPR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">👶</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h3>
        <p className="text-gray-600">
          {students.length === 0 
            ? 'No children are linked to your account yet. Contact the administration to link your children.'
            : 'No children match your search criteria.'}
        </p>
      </div>
    );
  };

  /**
   * Render individual student card
   */
  const renderStudentCard = (student: LinkedStudent) => {
    return (
      <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {student.firstName} {student.secondName} {student.thirdName}
              </h3>
              {student.relationship && (
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {student.relationship}
                </span>
              )}
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${
              student.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {student.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-24">CPR:</span>
              <span className="text-gray-900 font-medium">{student.cpr}</span>
            </div>
            {student.email && (
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Email:</span>
                <span className="text-gray-900">{student.email}</span>
              </div>
            )}
            <div className="flex items-center text-sm">
              <span className="text-gray-600 w-24">Age:</span>
              <span className="text-gray-900">{calculateAge(student.dateOfBirth)} years</span>
            </div>
            {student.gender && (
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Gender:</span>
                <span className="text-gray-900">{student.gender}</span>
              </div>
            )}
            {student.currentLevel && (
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Level:</span>
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                  {student.currentLevel}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push(`/parent/children/${student.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              View Details
            </button>
            <button
              onClick={() => router.push(`/parent/children/${student.id}/progress`)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render children list
   */
  const renderChildrenList = () => {
    const filteredStudents = getFilteredStudents();

    if (filteredStudents.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {filteredStudents.map((student) => renderStudentCard(student))}
      </div>
    );
  };

  /**
   * Render statistics section
   */
  const renderStats = () => {
    if (students.length === 0) return null;

    const stats = [
      {
        label: 'Total Children',
        value: students.length,
      },
      {
        label: 'Active',
        value: students.filter(s => s.isActive).length,
      },
      {
        label: 'With Level',
        value: students.filter(s => s.currentLevel).length,
      },
      {
        label: 'Average Age',
        value: Math.round(students.reduce((sum, s) => sum + (calculateAge(s.dateOfBirth) as number || 0), 0) / students.length),
      },
    ];

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-blue-100 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render main children page
   */
  const renderChildrenPage = () => {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderChildrenList()}
        {renderStats()}
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading children..." />;
  }

  return renderChildrenPage();
}
