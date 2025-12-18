'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId, logout } from '@/lib/authStorage';
import { speakingSlotAPI } from '@/lib/api';

interface SpeakingSlot {
  id: string;
  slotDate: string;
  slotTime: string;
  durationMinutes: number;
  status: string;
  score?: number;
  feedback?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
      phone?: string;
    };
  };
  testSession?: {
    id: string;
    score?: number;  // ← Changed from mcqScore
    status: string;
  };
}

export default function TeacherSpeakingTests() {
  const router = useRouter();
  const [slots, setSlots] = useState<SpeakingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'completed'>('upcoming');
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpeakingSlots();
  }, []);

  const loadSpeakingSlots = async () => {
    try {
      const teacherId = getTeacherId();

      if (!teacherId) {
        logout();
        return;
      }

      const result = await speakingSlotAPI.getByTeacher(teacherId);
      // console.log('Speaking slots:', result);
      
      if (result.success) {
        setSlots(result.data || []);
      } else {
        setError(result.message || 'Failed to load speaking slots');
      }
    } catch (err) {
      // console.error('Error loading speaking slots:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSlots = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return slots.filter(slot => {
      // Parse slot date and time properly
      const slotDate = new Date(slot.slotDate);
      const slotTime = new Date(slot.slotTime);
      
      // Combine slotDate and slotTime into a single DateTime
      const slotDateTime = new Date(
        slotDate.getFullYear(),
        slotDate.getMonth(),
        slotDate.getDate(),
        slotTime.getHours(),
        slotTime.getMinutes(),
        slotTime.getSeconds()
      );
      
      // Normalize slotDate to compare with today (remove time)
      const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());

      switch (filter) {
        case 'today':
          // Check if slot is today AND booked
          return slotDateOnly.getTime() === today.getTime() && slot.status === 'BOOKED';
        case 'upcoming':
          // Check if slot datetime is in the future AND booked
          return slotDateTime >= now && slot.status === 'BOOKED';
        case 'completed':
          return slot.status === 'COMPLETED';
        case 'all':
        default:
          // Show only BOOKED and COMPLETED slots (exclude AVAILABLE)
          return slot.status === 'BOOKED' || slot.status === 'COMPLETED';
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-gray-100 text-gray-700';
      case 'BOOKED': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSubmitResult = (slotId: string) => {
    router.push(`/teacher/speaking-tests/${slotId}/submit`);
  };

  const filteredSlots = getFilteredSlots();
  
  // Calculate counts using same logic as filters
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const upcomingCount = slots.filter(s => {
    const slotDate = new Date(s.slotDate);
    const slotTime = new Date(s.slotTime);
    
    // Combine date and time
    const slotDateTime = new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      slotTime.getHours(),
      slotTime.getMinutes(),
      slotTime.getSeconds()
    );
    
    return slotDateTime >= now && s.status === 'BOOKED';
  }).length;
  
  const todayCount = slots.filter(s => {
    const slotDate = new Date(s.slotDate);
    const slotDateOnly = new Date(slotDate.getFullYear(), slotDate.getMonth(), slotDate.getDate());
    return slotDateOnly.getTime() === today.getTime() && s.status === 'BOOKED';
  }).length;
  
  const completedCount = slots.filter(s => s.status === 'COMPLETED').length;
  
  // All count = BOOKED + COMPLETED (exclude AVAILABLE)
  const allCount = slots.filter(s => s.status === 'BOOKED' || s.status === 'COMPLETED').length;

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading speaking tests...</p>
        </div>
      </div>
    );
  };

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Speaking Tests
        </h1>
        <p className="text-gray-600">
          Manage your speaking test appointments
        </p>
      </div>
    );
  };

  /**
   * Render error message
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
        {error}
      </div>
    );
  };

  /**
   * Render stats cards
   */
  const renderStatsCards = () => {
    return (
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Today</p>
              <p className="text-3xl font-bold text-blue-600">{todayCount}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
            </div>
            <div className="text-4xl">🗓️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-600">{completedCount}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render filter tabs
   */
  const renderFilterTabs = () => {
    return (
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('today')}
            className={`px-6 py-3 font-semibold ${
              filter === 'today'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-3 font-semibold ${
              filter === 'upcoming'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming ({upcomingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 font-semibold ${
              filter === 'completed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-semibold ${
              filter === 'all'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({allCount})
          </button>
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
        <div className="text-6xl mb-4">🗣️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No speaking tests found
        </h3>
        <p className="text-gray-600">
          {filter === 'today' && 'No speaking tests scheduled for today'}
          {filter === 'upcoming' && 'No upcoming speaking tests'}
          {filter === 'completed' && 'No completed speaking tests yet'}
          {filter === 'all' && 'No speaking test slots created yet'}
        </p>
      </div>
    );
  };

  /**
   * Render slot card
   */
  const renderSlotCard = (slot: SpeakingSlot) => {
    return (
      <div key={slot.id} className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(slot.status)}`}>
                {slot.status}
              </span>
              <span className="text-gray-600">
                {formatDate(slot.slotDate)}
              </span>
              <span className="text-blue-600 font-semibold">
                {formatTime(slot.slotTime)}
              </span>
              <span className="text-gray-500">
                ({slot.durationMinutes} min)
              </span>
            </div>

            {slot.student ? (
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Student</p>
                  <p className="font-semibold text-gray-900">
                    {slot.student.firstName} {slot.student.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {slot.student.user.email}
                  </p>
                  {slot.student.user.phone && (
                    <p className="text-sm text-gray-600">
                      📞 {slot.student.user.phone}
                    </p>
                  )}
                </div>

                {slot.testSession && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Test Info</p>
                    <p className="text-sm text-gray-700">
                      MCQ Score: {slot.testSession.score || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-700">
                      Status: {slot.testSession.status}
                    </p>
                  </div>
                )}
              </div>
            ) : slot.status === 'BOOKED' ? (
              <p className="text-blue-600 font-semibold mb-4">📋 Booked - Student information pending</p>
            ) : (
              <p className="text-gray-500 italic mb-4">Available slot - not booked yet</p>
            )}

            {slot.status === 'COMPLETED' && (
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600 mb-1">Results</p>
                <p className="font-semibold text-gray-900">
                  Score: {slot.score || 'Not graded'}
                </p>
                {slot.feedback && (
                  <p className="text-sm text-gray-700 mt-2">
                    Feedback: {slot.feedback}
                  </p>
                )}
              </div>
            )}
          </div>

          {slot.status === 'BOOKED' && (
            <button
              onClick={() => handleSubmitResult(slot.id)}
              className="ml-4 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Submit Result
            </button>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render slots list
   */
  const renderSlotsList = () => {
    if (filteredSlots.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {filteredSlots.map((slot) => renderSlotCard(slot))}
      </div>
    );
  };

  /**
   * Render main speaking tests page
   */
  const renderSpeakingTestsPage = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {renderHeader()}
          {renderError()}
          {renderStatsCards()}
          {renderFilterTabs()}
          {renderSlotsList()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return renderLoadingState();
  }

  return renderSpeakingTestsPage();
}