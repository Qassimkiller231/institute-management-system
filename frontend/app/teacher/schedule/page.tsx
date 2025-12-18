'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId } from '@/lib/authStorage';
import { groupsAPI, sessionsAPI } from '@/lib/api';
interface Session {
  id: string;
  sessionDate: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  topic?: string;
  status: string;
  group: {
    id: string;
    groupCode: string;
    name?: string;
    level: {
      name: string;
    };
  };
  hall?: {
    name: string;
  };
  _count?: {
    attendance: number;
  };
}

export default function TeacherSchedule() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('week');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      if (!teacherId) return;

      // Get teacher's groups
      const groupsData = await groupsAPI.getAll({ teacherId });
      const groups = groupsData.data || [];

      // Calculate date range based on filter
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let dateFrom = today.toISOString().split('T')[0];
      let dateTo: string | undefined;

      if (filter === 'today') {
        dateTo = dateFrom;
      } else if (filter === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        dateTo = nextWeek.toISOString().split('T')[0];
      } else if (filter === 'month') {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        dateTo = nextMonth.toISOString().split('T')[0];
      }

      // Fetch sessions for all groups
      let allSessions: Session[] = [];
      for (const group of groups) {
        const params: any = { groupId: group.id };
        // Note: dateFrom/dateTo filtering would need to be added to sessionsAPI if backend supports it
        const sessionsData = await sessionsAPI.getAll(params);
        
        // Client-side date filtering
        let filteredSessions = sessionsData.data || [];
        if (dateFrom || dateTo) {
          filteredSessions = filteredSessions.filter((s: any) => {
            const sessionDate = new Date(s.sessionDate);
            const from = dateFrom ? new Date(dateFrom) : null;
            const to = dateTo ? new Date(dateTo) : null;
            if (from && sessionDate < from) return false;
            if (to && sessionDate > to) return false;
            return true;
          });
        }
        allSessions = [...allSessions, ...filteredSessions];
      }

      // Sort by date and time
      allSessions.sort((a, b) => {
        const dateCompare = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      setSessions(allSessions);
    } catch (err) {
      // console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Extract time from ISO string or time string
      const time = timeString.includes('T') 
        ? timeString.split('T')[1].substring(0, 5)
        : timeString.substring(0, 5);
      
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupByDate = (sessions: Session[]) => {
    const grouped: Record<string, Session[]> = {};
    sessions.forEach(session => {
      const date = session.sessionDate.split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupByDate(sessions);

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/teacher')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
        </div>
      </header>
    );
  };

  /**
   * Render filter buttons
   */
  const renderFilterButtons = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Next 7 Days
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Next Month
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Upcoming
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render stats grid
   */
  const renderStatsGrid = () => {
    const scheduledCount = sessions.filter(s => s.status === 'SCHEDULED').length;
    const completedCount = sessions.filter(s => s.status === 'COMPLETED').length;

    return (
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Total Sessions</div>
          <div className="text-3xl font-bold text-blue-600">{sessions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Scheduled</div>
          <div className="text-3xl font-bold text-green-600">{scheduledCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600">Completed</div>
          <div className="text-3xl font-bold text-purple-600">{completedCount}</div>
        </div>
      </div>
    );
  };

  /**
   * Render loading state
   */
  const renderLoadingState = () => {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading schedule...</p>
      </div>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
        No sessions scheduled for this period
      </div>
    );
  };

  /**
   * Render single session card
   */
  const renderSessionCard = (session: Session) => {
    return (
      <div key={session.id} className="p-6 hover:bg-gray-50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatTime(session.startTime)}
              </span>
              <span className="text-gray-400">→</span>
              <span className="text-xl text-gray-600">
                {formatTime(session.endTime)}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                {session.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="font-semibold text-gray-900">
                {session.group.groupCode}
                {session.group.name && ` - ${session.group.name}`}
              </div>
              <div className="text-sm text-gray-600">
                Level: {session.group.level.name} | Session #{session.sessionNumber}
              </div>
              {session.topic && (
                <div className="text-sm text-gray-600">
                  Topic: {session.topic}
                </div>
              )}
              {session.hall && (
                <div className="text-sm text-gray-600">
                  Hall: {session.hall.name}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {session.status === 'SCHEDULED' && (
              <button
                onClick={() => router.push(`/teacher/attendance?session=${session.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Take Attendance
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render date group
   */
  const renderDateGroup = (date: string, dateSessions: Session[]) => {
    return (
      <div key={date} className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {dateSessions.map(session => renderSessionCard(session))}
        </div>
      </div>
    );
  };

  /**
   * Render sessions list
   */
  const renderSessionsList = () => {
    if (loading) {
      return renderLoadingState();
    }

    if (Object.keys(groupedSessions).length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {Object.entries(groupedSessions).map(([date, dateSessions]) => 
          renderDateGroup(date, dateSessions)
        )}
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderFilterButtons()}
          {renderStatsGrid()}
          {renderSessionsList()}
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return renderSchedulePage();
}