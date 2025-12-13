'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetType: string;
  priority: string;
  isActive: boolean;
  createdAt: string;
  author: {
    email: string;
  };
}

export default function ParentAnnouncementsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filter, setFilter] = useState<'all' | 'general' | 'academic' | 'administrative'>('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('http://localhost:3001/api/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch announcements');
      
      const data = await res.json();
      setAnnouncements(data.data || []);
    } catch (err: any) {
      console.error('Error loading announcements:', err);
      alert('Error loading announcements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'all') return true;
    return a.type.toLowerCase() === filter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'GENERAL':
        return '📢';
      case 'ACADEMIC':
        return '📚';
      case 'ADMINISTRATIVE':
        return '📋';
      case 'EVENT':
        return '📅';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Announcements</h2>
        <p className="text-gray-600 mb-4">Stay updated with the latest news and updates from the institute</p>
        
        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'general', 'academic', 'administrative'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Announcements</h3>
          <p className="text-gray-600">
            {announcements.length === 0 
              ? 'There are no announcements at this time.'
              : 'No announcements match your filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{getTypeIcon(announcement.type)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {announcement.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority} Priority
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {announcement.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
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
                  Posted by {announcement.author?.email || 'Administration'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Announcement Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Total</p>
              <p className="text-3xl font-bold">{announcements.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">High Priority</p>
              <p className="text-3xl font-bold">
                {announcements.filter(a => a.priority.toUpperCase() === 'HIGH').length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Academic</p>
              <p className="text-3xl font-bold">
                {announcements.filter(a => a.type.toUpperCase() === 'ACADEMIC').length}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">This Month</p>
              <p className="text-3xl font-bold">
                {announcements.filter(a => {
                  const date = new Date(a.createdAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
