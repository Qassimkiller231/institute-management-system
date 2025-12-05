'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { groupsAPI, UpdateGroupDto, termsAPI, levelsAPI, teachersAPI, venuesAPI, programsAPI } from '@/lib/api';

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);

  const [formData, setFormData] = useState<UpdateGroupDto>({
    termId: '',
    levelId: '',
    groupCode: '',
    name: '',
    capacity: 20,
    teacherId: '',
    venueId: '',
    schedule: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });
  const [selectedProgramId, setSelectedProgramId] = useState('');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [programsData, termsData, levelsData, teachersData, venuesData] = await Promise.all([
        programsAPI.getAll(),
        termsAPI.getAll(),
        levelsAPI.getAll(),
        teachersAPI.getAll({ isActive: true }),
        venuesAPI.getAll()
      ]);
      
      setPrograms(programsData.data || []);
      setTerms(termsData.data.data || []);
      setLevels(levelsData.data || []);
      setTeachers(teachersData.data || []);
      setVenues(venuesData.data || []);
    } catch (err: any) {
      alert('Error loading form data: ' + err.message);
    }
  };

  const toggleDay = (day: string) => {
    const days = formData.schedule?.days || [];
    const newDays = days.includes(day)
      ? days.filter((d: string) => d !== day)
      : [...days, day];
    
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, days: newDays }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.termId || !formData.levelId || !formData.groupCode) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.schedule?.days || formData.schedule.days.length === 0) {
      alert('Please select at least one day');
      return;
    }

    try {
      setLoading(true);
      await groupsAPI.create(formData);
      alert('Group created successfully!');
      router.push('/admin/groups');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Group</h1>
        <p className="text-gray-600">Add a new teaching group to the system</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Program *</label>
              <select
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setFormData({ ...formData, termId: '' }); // Reset term when program changes
                }}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              >
                <option value="">Select Program</option>
                {programs.map(program => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Term *</label>
              <select
                value={formData.termId}
                onChange={(e) => setFormData({ ...formData, termId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
                disabled={!selectedProgramId}
              >
                <option value="">Select Term</option>
                {terms
                  .filter(term => term.programId === selectedProgramId && term.isActive !== false)
                  .map(term => (
                    <option key={term.id} value={term.id}>{term.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Level *</label>
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
              <label className="block text-sm font-medium mb-2">Group Code *</label>
              <input
                type="text"
                value={formData.groupCode}
                onChange={(e) => setFormData({ ...formData, groupCode: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                placeholder="A1-M-SPR"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Group Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                placeholder="A1 Morning Class"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacity *</label>
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
              <label className="block text-sm font-medium mb-2">Teacher</label>
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
              <label className="block text-sm font-medium mb-2">Venue</label>
              <select
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="">No Venue Assigned</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Schedule *</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Class Days</label>
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
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="time"
                value={formData.schedule?.startTime || '09:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, startTime: e.target.value, days: formData.schedule?.days || [] }
                })}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="time"
                value={formData.schedule?.endTime || '11:00'}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: { ...formData.schedule, endTime: e.target.value, days: formData.schedule?.days || [] }
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
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );
}
