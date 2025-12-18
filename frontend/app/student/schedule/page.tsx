'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentId } from '@/lib/authStorage';
import { sessionsAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

interface ClassSession {
  id: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  topic: string | null;
  status: string;
  group: {
    name: string;
    teacher: {
      firstName: string;
      lastName: string;
    } | null;
  };
  hall: {
    name: string;
    venue: {
      name: string;
    };
  } | null;
}

export default function StudentSchedulePage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const studentId = getStudentId();

        if (!studentId) {
          router.push('/login');
          return;
        }

        // Use sessionsAPI to get student sessions
        const data = await sessionsAPI.getByStudent(studentId);
        setSessions(data.data || []);

      } catch (err) {
        // console.error('Error fetching schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [router]);

  const getFilteredSessions = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return sessions.filter(session => {
      const sessionDate = new Date(session.sessionDate);
      sessionDate.setHours(0, 0, 0, 0);

      if (filterStatus === 'upcoming') {
        return sessionDate >= now && session.status !== 'CANCELLED';
      } else if (filterStatus === 'past') {
        return sessionDate < now || session.status === 'COMPLETED';
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.sessionDate);
      const dateB = new Date(b.sessionDate);
      return filterStatus === 'past' 
        ? dateB.getTime() - dateA.getTime() 
        : dateA.getTime() - dateB.getTime();
    });
  };

  const getNextClass = () => {
    const now = new Date();
    return sessions
      .filter(s => new Date(s.sessionDate) >= now && s.status !== 'CANCELLED')
      .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())[0];
  };

  const getTimeUntilClass = (sessionDate: string, startTime: string) => {
    if (!sessionDate || !startTime) return null;
    
    const now = new Date();
    
    try {
      // Parse date and time separately, then combine
      const date = new Date(sessionDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      
      if (isNaN(hours) || isNaN(minutes)) return null;
      
      date.setHours(hours, minutes, 0, 0);
      
      const diffMs = date.getTime() - now.getTime();
      
      if (diffMs < 0) return null;

      const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (totalHours > 24) {
        const days = Math.floor(totalHours / 24);
        return `${days} day${days > 1 ? 's' : ''}`;
      }
      return `${totalHours}h ${remainingMinutes}m`;
    } catch (error) {
      // console.error('Error calculating time until class:', error);
      return null;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // ========================================
  // CALCULATIONS
  // ========================================
  
  const nextClass = getNextClass();
  const filteredSessions = getFilteredSessions();

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/student')}
            className="mb-4 text-indigo-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">My Schedule</h1>
          <p className="text-indigo-100">View your upcoming and past classes</p>
        </div>
      </div>
    );
  };

  /**
   * Render next class card
   */
  const renderNextClassCard = () => {
    if (!nextClass) return null;

    const timeUntil = getTimeUntilClass(nextClass.sessionDate, nextClass.startTime);

    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-1">Next Class</p>
            <h2 className="text-2xl font-bold mb-2">
              {nextClass.group.name || `Session ${nextClass.sessionNumber}`}
            </h2>
            <div className="space-y-1">
              <p className="flex items-center gap-2">
                <span>📅</span> {formatDate(nextClass.sessionDate)}
              </p>
              <p className="flex items-center gap-2">
                <span>⏰</span> {formatTime(nextClass.startTime)} - {formatTime(nextClass.endTime)}
              </p>
              {nextClass.group.teacher && (
                <p className="flex items-center gap-2">
                  <span>👨‍🏫</span> {nextClass.group.teacher.firstName} {nextClass.group.teacher.lastName}
                </p>
              )}
              {nextClass.hall && (
                <p className="flex items-center gap-2">
                  <span>📍</span> {nextClass.hall.venue.name} - {nextClass.hall.name}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            {timeUntil && (
              <>
                <p className="text-blue-100 text-sm mb-1">Starts in</p>
                <p className="text-3xl font-bold">{timeUntil}</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilters = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilterStatus('past')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'past'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render single session card
   */
  const renderSessionCard = (session: ClassSession) => {
    return (
      <div 
        key={session.id}
        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Session {session.sessionNumber}
              {session.topic && `: ${session.topic}`}
            </h3>
            <p className="text-gray-600">{session.group.name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <span>📅</span>
            <span>{formatDate(session.sessionDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <span>⏰</span>
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)}</span>
          </div>
          {session.group.teacher && (
            <div className="flex items-center gap-2 text-gray-700">
              <span>👨‍🏫</span>
              <span>{session.group.teacher.firstName} {session.group.teacher.lastName}</span>
            </div>
          )}
          {session.hall && (
            <div className="flex items-center gap-2 text-gray-700">
              <span>📍</span>
              <span>{session.hall.venue.name} - {session.hall.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 text-lg">No classes found.</p>
      </div>
    );
  };

  /**
   * Render sessions list
   */
  const renderSessionsList = () => {
    if (filteredSessions.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-4">
        {filteredSessions.map((session) => renderSessionCard(session))}
      </div>
    );
  };

  /**
   * Render main schedule page
   */
  const renderSchedulePage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderNextClassCard()}
          {renderFilters()}
          {renderSessionsList()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading your schedule..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Error Loading Schedule"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }


  return renderSchedulePage();
}