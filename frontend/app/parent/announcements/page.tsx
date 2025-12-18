'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/authStorage';
import { announcementsAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';

// ========================================
// TYPES
// ========================================

interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  publisher?: {
    email: string;
  };
}

type FilterType = 'all' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'ALL';

export default function ParentAnnouncementsPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Load announcements on mount
   */
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ========================================
  // DATA LOADING
  // ========================================
  
  /**
   * Fetch all announcements from API
   */
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const data = await announcementsAPI.getAll();
      // console.log('=== ANNOUNCEMENT DEBUG ==='); // Debug
      // console.log('Total announcements:', data.data?.length); // Debug
      setAnnouncements(data.data || []);
    } catch (err: any) {
      // console.error('Error loading announcements:', err); // Debug
      // Could show error message to user instead of alert
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Filter announcements based on selected filter
   */
  const getFilteredAnnouncements = (): Announcement[] => {
    return announcements.filter(a => {
      if (filter === 'all') return true;
      if (!a.targetAudience) return false;
      
      // Handle both singular and plural forms
      const audience = a.targetAudience.toUpperCase();
      const filterUpper = filter.toUpperCase();
      
      // Match exact or handle STUDENT/STUDENTS, TEACHER/TEACHERS variations
      return audience === filterUpper || 
             (filterUpper === 'STUDENTS' && audience === 'STUDENT') ||
             (filterUpper === 'TEACHERS' && audience === 'TEACHER');
    });
  };

  /**
   * Get emoji icon for target audience
   */
  const getTypeIcon = (targetAudience: string): string => {
    if (!targetAudience) return '📢';
    switch (targetAudience.toUpperCase()) {
      case 'STUDENTS':
        return '🎓';
      case 'TEACHERS':
        return '👨‍🏫';
      case 'PARENTS':
        return '👪';
      case 'ALL':
        return '🌐';
      default:
        return '📢';
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render header with title and filters
   */
  const renderHeader = () => {
    const filters = [
      { value: 'all', label: 'All' },
      { value: 'ALL', label: 'Institute' },
      { value: 'STUDENTS', label: 'Students' },
      { value: 'TEACHERS', label: 'Teachers' },
      { value: 'PARENTS', label: 'Parents' }
    ];

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcements</h2>
        <p className="text-gray-600 mb-4">Stay updated with the latest news and updates from the institute</p>
        
        <div className="flex gap-2">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as FilterType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render empty state when no announcements
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">📢</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Announcements</h3>
        <p className="text-gray-600">
          {announcements.length === 0 
            ? 'There are no announcements at this time.'
            : 'No announcements match your filter.'}
        </p>
      </div>
    );
  };

  /**
   * Render individual announcement card
   */
  const renderAnnouncementCard = (announcement: Announcement) => {
    return (
      <div key={announcement.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-3xl">{getTypeIcon(announcement.targetAudience)}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {announcement.targetAudience}
                  </span>
                  <span className="text-sm text-gray-500">
                    {announcement.publishedAt 
                      ? new Date(announcement.publishedAt).toLocaleDateString() 
                      : new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-gray-700 mb-3 ml-12">
            <p className="whitespace-pre-wrap">{announcement.content}</p>
          </div>

          {/* Footer */}
          <div className="ml-12 text-sm text-gray-500">
            Posted by {announcement.publisher?.email || 'Administration'}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render announcements list
   */
  const renderAnnouncementsList = () => {
    const filteredAnnouncements = getFilteredAnnouncements();

    if (filteredAnnouncements.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => renderAnnouncementCard(announcement))}
      </div>
    );
  };

  /**
   * Render statistics section
   */
  const renderStats = () => {
    if (announcements.length === 0) return null;

    const stats = [
      {
        label: 'Total',
        value: announcements.length,
      },
      {
        label: 'To Students',
        value: announcements.filter(a => a.targetAudience?.toUpperCase() === 'STUDENTS').length,
      },
      {
        label: 'To Parents',
        value: announcements.filter(a => a.targetAudience?.toUpperCase() === 'PARENTS').length,
      },
      {
        label: 'This Month',
        value: announcements.filter(a => {
          const date = new Date(a.publishedAt || a.createdAt);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
      },
    ];

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Announcement Stats</h3>
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
   * Render main announcements page
   */
  const renderAnnouncementsPage = () => {
    return (
      <div className="space-y-6">
        {renderHeader()}
        {renderAnnouncementsList()}
        {renderStats()}
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading announcements..." />;
  }

  return renderAnnouncementsPage();
}
