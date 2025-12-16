'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { groupsAPI, UpdateGroupDto, termsAPI, levelsAPI, teachersAPI, venuesAPI } from '@/lib/api';

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [terms, setTerms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);

  const [formData, setFormData] = useState<UpdateGroupDto>({
    termId: '',
    levelId: '',
    teacherId: '',
    venueId: '',
    hallId: '',
    groupCode: '',
    name: '',
    schedule: {
      days: [],
      startTime: '09:00',
      endTime: '11:00'
    },
    capacity: 20,
    isActive: true
  });

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadData();
  }, [groupId]);

  const loadData = async () => {
    try {
      const [groupData, termsData, levelsData, teachersData, venuesData] = await Promise.all([
        groupsAPI.getById(groupId),
        termsAPI.getAll(),
        levelsAPI.getAll(),
        teachersAPI.getAll({ isActive: true }),
        venuesAPI.getAll()
      ]);
      
      const group = groupData.data;
      setFormData({
        termId: group.termId,
        levelId: group.levelId,
        teacherId: group.teacherId || '',
        venueId: group.venueId || '',
        hallId: group.hallId || '',
        groupCode: group.groupCode,
        name: group.name || '',
        schedule: group.schedule || { days: [], startTime: '09:00', endTime: '11:00' },
        capacity: group.capacity,
        isActive: group.isActive
      });
      
      setTerms(termsData.data.data || []);
      setLevels(levelsData.data || []);
      setTeachers(teachersData.data || []);
      setVenues(venuesData.data || []);
      
      // Load halls if venue exists
      if (group.venueId) {
        try {
          const venueData = await venuesAPI.getById(group.venueId);
          setHalls(venueData.data.halls || []);
        } catch (err) {
          console.error('Error loading halls:', err);
        }
      }
    } catch (err: any) {
      alert('Error loading group: ' + err.message);
      router.push('/admin/groups');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const days = formData.schedule?.days || [];
    const newDays = days.includes(day)
      ? days.filter((d: string) => d !== day)
      : [...days, day];
    
    setFormData({
      ...formData,
      schedule: { 
        ...formData.schedule, 
        days: newDays,
        startTime: formData.schedule?.startTime || '09:00',
        endTime: formData.schedule?.endTime || '11:00'
      }
    });
  };

  const handleVenueChange = async (venueId : string) => {
    setFormData({ ...formData, venueId, hallId: '' });
    
    if (venueId) {
      try {
        const venueData = await venuesAPI.getById(venueId);
        setHalls(venueData.data.halls || []);
      } catch (err) {
        console.error('Error loading halls:', err);
        setHalls([]);
      }
    } else {
      setHalls([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.groupCode) {
      alert('Group code is required');
      return;
    }

    try {
      setSaving(true);
      await groupsAPI.update(groupId, formData);
      alert('Group updated successfully!');
      router.push('/admin/groups');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Group</h1>
        <p className="text-gray-600">Update group information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Status Toggle */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Group is Active
          </label>
        </div>

        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term *</label>
              <select
                value={formData.termId}
                onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              >
                <option value="">Select Term</option>
                {terms
                  .filter(term => term.isActive !== false)
                  .map(term => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level *</label>
              <select
                value={formData.levelId}
                onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Code *</label>
              <input
                type="text"
                value={formData.groupCode}
                className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-gray-100 cursor-not-allowed"
                disabled
                title="Group code cannot be changed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                min="1"
                max="30"
                required
              />
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Assignment</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="">No Teacher Assigned</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
              <select
                value={formData.venueId}
                onChange={(e) => handleVenueChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="">No Venue Assigned</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hall</label>
              <select
                value={formData.hallId}
                onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                disabled={!formData.venueId}
              >
                <option value="">No Hall Assigned</option>
                {halls.map(hall => (
                  <option key={hall.id} value={hall.id}>{hall.name}</option>
                ))}
              </select>
              {!formData.venueId && (
                <p className="text-sm text-gray-500 mt-1">Select a venue first</p>
              )}
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Schedule</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Class Days</label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    formData.schedule?.days?.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="time"
                value={formData.schedule?.startTime || '09:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { 
                    ...formData.schedule, 
                    startTime: e.target.value,
                    days: formData.schedule?.days || [],
                    endTime: formData.schedule?.endTime || '11:00'
                  }
                })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input
                type="time"
                value={formData.schedule?.endTime || '11:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { 
                    ...formData.schedule, 
                    endTime: e.target.value,
                    days: formData.schedule?.days || [],
                    startTime: formData.schedule?.startTime || '09:00'
                  }
                })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
