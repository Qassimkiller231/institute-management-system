'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { announcementsAPI, programsAPI, groupsAPI } from '@/lib/api';
import AnnouncementCard, { AnnouncementCardData } from '@/components/shared/AnnouncementCard';

interface Program {
  id: string;
  name: string;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementCardData[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementCardData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    targetAudience: 'PROGRAM' as 'PROGRAM' | 'GROUP' | 'ALL',
    programId: '',
    groupId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [announcementsData, programsData, groupsData] = await Promise.all([
        announcementsAPI.getAll(),
        programsAPI.getAll(true), // Only active programs
        groupsAPI.getAll() // Use groupsAPI for proper auth
      ]);
      setAnnouncements(announcementsData.data || []);
      setPrograms(programsData.data || []);
      // Extract groups from response
      const extractedGroups = groupsData.data || [];
      console.log('Groups fetched:', extractedGroups);
      setGroups(Array.isArray(extractedGroups) ? extractedGroups : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await announcementsAPI.delete(id);
      alert('Announcement deleted successfully!');
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (announcement: AnnouncementCardData) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetAudience: 'PROGRAM',
      programId: '',
      groupId: ''
    });
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      priority: 'MEDIUM',
      targetAudience: 'PROGRAM',
      programId: '',
      groupId: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    if (formData.targetAudience === 'PROGRAM' && !formData.programId) {
      alert('Please select a program');
      return;
    }

    if (formData.targetAudience === 'GROUP' && !formData.groupId) {
      alert('Please select a group');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingAnnouncement) {
        // Update existing
        await announcementsAPI.update(editingAnnouncement.id, {
          title: formData.title,
          content: formData.content,
          priority: formData.priority
        });
        alert('Announcement updated successfully!');
      } else {
        // Create new - construct payload based on target audience
        const payload: any = {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          targetAudience: formData.targetAudience,
          publishNow: true
        };

        // Add appropriate ID based on target
        if (formData.targetAudience === 'PROGRAM') {
          // For program-wide: need to find a term in that program
          // This is a simplified approach - ideally select term too
          payload.programId = formData.programId;
        } else if (formData.targetAudience === 'GROUP') {
          payload.groupId = formData.groupId;
        }
        // For 'ALL' - no extra IDs needed

        await announcementsAPI.create(payload);
        alert('Announcement created successfully!');
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'MEDIUM',
      targetAudience: 'PROGRAM',
      programId: '',
      groupId: ''
    });
    setEditingAnnouncement(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterPriority('all');
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.group?.groupCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 h-32"></div>
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
            <p className="text-red-800 font-semibold">Error loading announcements</p>
            <p className="text-red-600 mt-2">{error}</p>
            <button
              onClick={fetchData}
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Announcements</h1>
              <p className="text-orange-100">Manage all announcements across all programs</p>
            </div>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition shadow-lg"
            >
              + New Announcement
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Search & Filter</h3>
            <button onClick={resetFilters} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              Reset
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search by title, content, or group..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{announcements.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">High Priority</p>
            <p className="text-3xl font-bold text-red-600">
              {announcements.filter(a => a.priority === 'HIGH').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Medium Priority</p>
            <p className="text-3xl font-bold text-yellow-600">
              {announcements.filter(a => a.priority === 'MEDIUM').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm mb-1">Low Priority</p>
            <p className="text-3xl font-bold text-green-600">
              {announcements.filter(a => a.priority === 'LOW').length}
            </p>
          </div>
        </div>

        {/* Announcements List */}
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterPriority !== 'all' ? 'No announcements match your filters' : 'No announcements yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterPriority !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Announcements will appear here once teachers create them'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                canDelete={true}
                canEdit={true}
                showTeacher={true}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>

            <div className="space-y-4">
              {!editingAnnouncement && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience *
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                    >
                      <option value="PROGRAM">Specific Program</option>
                      <option value="GROUP">Specific Group</option>
                      <option value="ALL">All Institute</option>
                    </select>
                  </div>

                  {formData.targetAudience === 'PROGRAM' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program *
                      </label>
                      <select
                        value={formData.programId}
                        onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                        required
                      >
                        <option value="">Select Program</option>
                        {programs.map(program => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.targetAudience === 'GROUP' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group *
                      </label>
                      <select
                        value={formData.groupId}
                        onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                        required
                      >
                        <option value="">Select Group</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.id}>
                            {group.groupCode} - {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  placeholder="e.g., Important: Class Schedule Change"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                  rows={6}
                  placeholder="Announcement details..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
                >
                  <option value="LOW">🟢 Low Priority</option>
                  <option value="MEDIUM">🟡 Medium Priority</option>
                  <option value="HIGH">🔴 High Priority</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
              >
                {submitting ? 'Saving...' : editingAnnouncement ? 'Update' : 'Create'} Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}