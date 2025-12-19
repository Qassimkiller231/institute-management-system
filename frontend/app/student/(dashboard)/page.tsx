'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getStudentId, logout } from '@/lib/authStorage';
import { announcementsAPI, studentsAPI, speakingSlotAPI } from '@/lib/api';
import type { Announcement } from '@/lib/api/announcements';
import { LoadingState } from '@/components/common/LoadingState';
import DashboardNotificationWidget from '@/components/dashboard/DashboardNotificationWidget';

interface StudentData {
  id: string;
  firstName: string;
  secondName?: string;
  currentLevel?: string;
  enrollments: Array<{
    id: string;
    status: string;
    term?: {
      id: string;
      name: string;
      isCurrent: boolean;
    };
    group: {
      id: string;
      name: string;
      level: {
        name: string;
      };
      term?: {
        name: string;
        isCurrent: boolean;
      };
    };
  }>;
  testSessions: Array<{
    id: string;
    status: string;
    completedAt?: string;
  }>;
  speakingSlots?: Array<{
    id: string;
    status: string;
    slotDate: string;
    slotTime: string;
    teacher: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const token = getToken();
      const studentId = getStudentId();

      // CRITICAL FIX: Check if token and studentId exist BEFORE making API call
      if (!token || !studentId) {
        // console.log('No token or studentId found, redirecting to login');
        router.push('/login');
        return;
      }

      // Use students API
      const result = await studentsAPI.getById(studentId);

      if (result.success) {
        setStudent(result.data);

        // DEBUG: Log the student data
        // console.log('===== STUDENT DATA DEBUG =====');
        // console.log('Full student object:', JSON.stringify(result.data, null, 2));
        // console.log('Enrollments:', result.data.enrollments);

        // if (result.data.enrollments) {
        //   result.data.enrollments.forEach((e: any, index: number) => {
        //     console.log(`Enrollment ${index}:`, {
        //       status: e.status,
        //       groupName: e.group?.name,
        //       termName: e.term?.name || e.group?.term?.name,
        //       isCurrent: e.term?.isCurrent || e.group?.term?.isCurrent,
        //       hasTermObject: !!e.term,
        //       hasGroupTermObject: !!e.group?.term,
        //       fullTerm: e.term,
        //       fullGroupTerm: e.group?.term
        //     });
        //   });
        // }
        // console.log('=============================');

        // Fetch announcements for student (includes their groups + institute-wide)
        if (result.data.enrollments) {
          const activeGroups = result.data.enrollments
            .filter((e: any) => e.status === 'ACTIVE' && e.group?.term?.isCurrent)
            .map((e: any) => e.group.id);

          // Fetch all announcements (backend will filter for student's groups + ALL)
          try {
            const announcementsResponse = await announcementsAPI.getAll({
              isPublished: true
            });

            const allAnnouncements = announcementsResponse.data || [];

            // Sort: HIGH priority first, then by date (newest first)
            const sortedAnnouncements = allAnnouncements.sort((a: any, b: any) => {
              if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
              if (a.priority !== 'HIGH' && b.priority === 'HIGH') return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            // console.log('===== ANNOUNCEMENTS DEBUG =====');
            // console.log('Active groups:', activeGroups);
            // console.log('All announcements fetched:', allAnnouncements);
            // console.log('Sorted announcements:', sortedAnnouncements);
            // console.log('Top 5 announcements:', sortedAnnouncements.slice(0, 5));
            // console.log('===============================');

            setAnnouncements(sortedAnnouncements.slice(0, 5)); // Top 5
          } catch (err) {
            // console.error('Failed to fetch announcements:', err);
            setAnnouncements([]);
          }
        } else {
          // console.log('No enrollments found');
          setAnnouncements([]);
        }
      }
    } catch (error) {
      // console.error('Error loading student data:', error);
      // On error, redirect to login if no auth
      const token = getToken();
      const studentId = getStudentId();
      if (!token || !studentId) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check student test and enrollment status
  const hasCompletedWrittenTest = student?.testSessions?.some((ts: any) =>
    ts.status === 'COMPLETED' || ts.status === 'SPEAKING_SCHEDULED' || ts.status === 'MCQ_COMPLETED'
  );

  // Check if speaking is scheduled (they booked a slot)
  const hasSpeakingSlot = student?.testSessions?.some((ts: any) => ts.status === 'SPEAKING_SCHEDULED');

  const speakingSlotCompleted = student?.testSessions?.some((ts: any) => ts.status === 'SPEAKING_COMPLETED');
  const hasCurrentLevel = !!student?.currentLevel;

  const hasCurrentTermEnrollment = student?.enrollments?.some(
    (e: any) => e.status === 'ACTIVE' && e.group?.term?.isCurrent
  );
  const hasPastEnrollments = (student?.enrollments?.length ?? 0) > 0 && !hasCurrentTermEnrollment;

  // FIXED: Use the logout function from auth.ts which clears everything properly
  const handleLogout = () => {
    logout(); // This will clear everything and redirect to /login
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render common header used across all states
   */
  const renderHeader = () => {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {student?.firstName} {student?.secondName}!
            </h1>
            <p className="text-gray-600">Function Institute Student Portal</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>
    );
  };

  /**
   * Render single announcement card
   */
  const renderAnnouncementCard = (announcement: Announcement) => {
    const priorityColors = {
      HIGH: 'border-red-500 bg-red-50',
      MEDIUM: 'border-yellow-500 bg-yellow-50',
      LOW: 'border-blue-500 bg-blue-50'
    };

    return (
      <div
        key={announcement.id}
        className={`border-l-4 rounded-r-lg p-4 ${priorityColors[announcement.priority as keyof typeof priorityColors] || priorityColors.LOW}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-gray-900">{announcement.title}</h3>
            <p className="text-gray-700 mt-1">{announcement.content}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span>📅 {new Date(announcement.createdAt).toLocaleDateString()}</span>
              {announcement.teacher && (
                <span>👤 {announcement.teacher.firstName} {announcement.teacher.lastName}</span>
              )}
              {announcement.group && (
                <span className="bg-white px-2 py-0.5 rounded border border-gray-200">
                  {announcement.group.groupCode}
                </span>
              )}
            </div>
          </div>
          {announcement.priority === 'HIGH' && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
              URGENT
            </span>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render announcements section
   */
  const renderAnnouncements = () => {
    if (announcements.length === 0) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📢 Announcements</h2>
        <div className="space-y-4">
          {announcements.map((announcement) => renderAnnouncementCard(announcement))}
        </div>
      </div>
    );
  };

  /**
   * Render active enrollments section
   */
  const renderEnrollments = () => {
    const activeEnrollments = student?.enrollments.filter(e => e.status === 'ACTIVE' && e.group?.term?.isCurrent) || [];

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>
        <div className="space-y-4">
          {activeEnrollments.map((enrollment) => (
            <div key={enrollment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{enrollment.group.name}</h3>
                  <p className="text-gray-600 text-sm">Level: {enrollment.group.level.name}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Render quick action buttons
   */
  const renderQuickActions = () => {
    const actions = [
      { icon: '📅', title: 'My Schedule', description: 'View class times', path: '/student/schedule' },
      { icon: '✓', title: 'Attendance', description: 'View attendance record', path: '/student/attendance' },
      { icon: '📚', title: 'Materials', description: 'Access learning materials', path: '/student/materials' },
      { icon: '💳', title: 'Payments', description: 'Pay installments online', path: '/student/payments' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => router.push(action.path)}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">{action.icon}</div>
            <h3 className="font-semibold text-gray-900">{action.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    );
  };

  /**
   * Render State 2: Re-enrollment needed
   */
  const renderReEnrollmentState = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Not Enrolled in Current Term
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚠️</div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    You were previously enrolled
                  </h3>
                  <p className="text-gray-700">
                    Our records show you were a student in a previous term, but you are not
                    currently enrolled in the active term.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">To re-enroll:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">1.</span>
                  <span>Contact the administration office</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">2.</span>
                  <span>Complete registration for the current term</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">3.</span>
                  <span>Make required payments</span>
                </li>
              </ul>
            </div>

            <div className="text-sm text-gray-500">
              <p>Need help? Contact us at <span className="text-blue-600">info@functioninstitute.com</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render State 3: Book speaking test
   */
  const renderBookSpeakingState = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Written Test Complete!
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Great job! Now complete your speaking test to receive your final level assessment.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-left">Next Step:</h3>
              <p className="text-gray-700 text-left mb-4">
                Book a 15-minute speaking session with one of our teachers to complete your assessment.
              </p>
            </div>

            <button
              onClick={() => router.push('/book-speaking')}
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
            >
              Book Speaking Test →
            </button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render State 5: Tests complete, awaiting enrollment
   */
  const renderTestsCompleteState = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Test Completed Successfully!
            </h2>

            <div className="mb-8">
              <p className="text-gray-600 mb-4">Your assessed level:</p>
              <div className="inline-block px-6 py-3 bg-blue-100 text-blue-800 rounded-lg text-2xl font-bold border-2 border-blue-300">
                {student?.currentLevel}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⏳</div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Processing Your Results
                  </h3>
                  <p className="text-gray-700">
                    Thank you for completing the placement test! Our team is currently
                    reviewing your results and preparing your detailed report.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📧</div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Next Steps
                  </h3>
                  <p className="text-gray-700 mb-4">
                    We will send you a detailed report shortly via email and you will be
                    enrolled in the appropriate class level. You will receive:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Detailed performance report</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Class schedule and enrollment details</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Payment information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Access to learning materials</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Need help? Contact us at <span className="text-blue-600">info@functioninstitute.com</span></p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render State 4: Speaking test scheduled
   */
  const renderSpeakingScheduledState = () => {
    const bookedSlot = student?.speakingSlots?.find((slot: any) => slot.status === 'BOOKED');

    const handleCancelAppointment = async () => {
      if (!bookedSlot || !confirm('Are you sure you want to cancel your speaking test appointment?')) return;

      const session = student?.testSessions?.find((ts: any) => ts.status === 'SPEAKING_SCHEDULED');
      if (!session) {
        alert('Could not find test session');
        return;
      }

      try {
        await speakingSlotAPI.cancel(bookedSlot.id, session.id);
        alert('Appointment cancelled successfully');
        loadStudentData();
      } catch (error: any) {
        alert(`Failed to cancel: ${error.message}`);
      }
    };

    const handleReschedule = async () => {
      if (!bookedSlot || !confirm('Cancel current appointment and book a new slot?')) return;

      const session = student?.testSessions?.find((ts: any) => ts.status === 'SPEAKING_SCHEDULED');
      if (!session) {
        alert('Could not find test session');
        return;
      }

      try {
        await speakingSlotAPI.cancel(bookedSlot.id, session.id);
        loadStudentData();
      } catch (error) {
        alert('Error rescheduling');
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Your Speaking Test Appointment
              </h2>
            </div>

            {bookedSlot && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(bookedSlot.slotDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(bookedSlot.slotTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>
                  {bookedSlot.teacher && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Teacher</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {bookedSlot.teacher.firstName} {bookedSlot.teacher.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleCancelAppointment}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Cancel Appointment
              </button>

              <button
                onClick={handleReschedule}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Reschedule
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Please attend your speaking test on the scheduled date and time to receive your final assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render main dashboard for enrolled students
   */
  const renderMainDashboard = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
                <p className="text-gray-600 mt-1">Current Level: <span className="font-semibold text-blue-600">{student?.currentLevel}</span></p>
              </div>
            </div>
          </div>

          <DashboardNotificationWidget portal="student" />

          {renderAnnouncements()}
          {renderEnrollments()}
          {renderQuickActions()}
        </div>
      </div>
    );
  };

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  // STATE 1: Has enrollment - Show dashboard regardless of test
  if (hasCurrentTermEnrollment) {
    // Continue to show dashboard below (skip to line 480)
  }
  // STATE 2: Has past enrollments but no current - Show re-enrollment
  else if (hasPastEnrollments) {
    return renderReEnrollmentState();
  }

  // STATE 3: Written test complete but no speaking slot booked - Show "Book Speaking"
  if (hasCompletedWrittenTest && !hasSpeakingSlot && !hasCurrentLevel) {
    return renderBookSpeakingState();
  }

  // STATE 4: Speaking slot booked but not completed - Show appointment details
  if (hasSpeakingSlot && !speakingSlotCompleted && !hasCurrentLevel) {
    return renderSpeakingScheduledState();
  }

  // STATE 5: Tests complete but no enrollment - Show level and waiting
  if (hasCurrentLevel && !hasCurrentTermEnrollment) {
    return renderTestsCompleteState();
  }

  // STATE 4: Has current term enrollment - Show normal dashboard
  return renderMainDashboard();
}