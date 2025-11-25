'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { studentAPI } from '@/lib/api';

interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  enrollments: Array<{
    id: string;
    status: string;
    group: {
      name: string;
      level: {
        name: string;
      };
    };
  }>;
  testSessions: Array<{
    id: string;
    status: string;
    mcqScore?: number;
    finalLevelId?: string;
    speakingSlots?: Array<{
      slotDate: string;
      startTime: string;
      teacher: {
        firstName: string;   // ✅ Add these
       lastName: string;  
        user: {
          email: string;
        };
      };
    }>;
  }>;
}

type DashboardState = 
  | 'new_student'
  | 'mcq_completed'
  | 'speaking_booked'
  | 'test_completed'
  | 'enrolled_student';

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [dashboardState, setDashboardState] = useState<DashboardState>('new_student');
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const studentId = localStorage.getItem('studentId');
      console.log('1. StudentId from localStorage:', studentId);
      
      if (!studentId) {
        console.error('No studentId found');
        router.push('/login');
        return;
      }

      console.log('2. Calling API for student:', studentId);
      const result = await studentAPI.getById(studentId);
      console.log('3. API Result:', result);
      
      if (result.success && result.data) {
        console.log('4. Student data loaded:', result.data);
        setStudent(result.data);
        determineDashboardState(result.data);
      } else {
        console.error('5. API returned unsuccessful:', result);
        setError('Failed to load student data: ' + (result.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('6. CATCH ERROR:', err);
      console.error('Error details:', err.message, err.stack);
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const determineDashboardState = (data: StudentData) => {
    const hasActiveEnrollment = data.enrollments?.some(e => e.status === 'ACTIVE');
    
    if (hasActiveEnrollment) {
      setDashboardState('enrolled_student');
      return;
    }

    const latestTest = data.testSessions?.[0];
    
    if (!latestTest) {
      setDashboardState('new_student');
      return;
    }

    if (latestTest.status === 'SPEAKING_COMPLETED' && latestTest.finalLevelId) {
      setDashboardState('test_completed');
    } else if (latestTest.status === 'SPEAKING_SCHEDULED' && latestTest.speakingSlots?.[0]) {
      setDashboardState('speaking_booked');
    } else if (latestTest.status === 'MCQ_COMPLETED') {
      setDashboardState('mcq_completed');
    } else if (latestTest.status === 'IN_PROGRESS') {
      setDashboardState('new_student');
    } else {
      setDashboardState('new_student');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string | undefined) => {
  if (!time) return 'Time not available';
  
  try {
    // Handle HH:MM:SS format from database
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const minute = minutes || '00';
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    
    return `${displayHour}:${minute} ${period}`;
  } catch (e) {
    console.error('formatTime error:', e, 'time value:', time);
    return 'Invalid time';
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">
            {error || 'Unable to load student data'}
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <p className="text-xs text-gray-600 text-left font-mono">
              Check browser console (F12) for details
            </p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {student.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">Function Institute Student Portal</p>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {dashboardState === 'new_student' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-blue-600 text-6xl mb-4">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Placement Test
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              To get started with your English learning journey, please take our placement test. 
              It will help us determine the right level for you.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">What to expect:</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>✓ Multiple choice questions (45 minutes)</li>
                <li>✓ Speaking test with our teachers (15 minutes)</li>
                <li>✓ Immediate level recommendation</li>
              </ul>
            </div>
            <button
              onClick={() => router.push('/take-test')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Start Placement Test →
            </button>
          </div>
        )}

        {dashboardState === 'mcq_completed' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Great Job! MCQ Test Completed
            </h2>
            <p className="text-gray-700 text-lg mb-4">
              You've successfully completed the written portion of your placement test.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">⏱️ Next Step Required:</h3>
              <p className="text-gray-700">
                Please book your speaking test appointment to complete your placement evaluation.
              </p>
            </div>
            <button
              onClick={() => router.push('/book-speaking')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg"
            >
              Book Speaking Test →
            </button>
          </div>
        )}

        {dashboardState === 'speaking_booked' && student.testSessions?.[0]?.speakingSlots?.[0] && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-green-600 text-6xl mb-4">📅</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Speaking Test Scheduled
              </h2>
              <p className="text-gray-700 text-lg">
                Your speaking test appointment has been confirmed!
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Appointment Details:</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="text-blue-600 mr-4 text-2xl">📅</div>
                  <div>
                    <div className="text-sm text-gray-600">Date</div>
                    <div className="font-bold text-gray-900">
                      {formatDate(student.testSessions[0].speakingSlots[0].slotDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-blue-600 mr-4 text-2xl">⏰</div>
                  <div>
                    <div className="text-sm text-gray-600">Time</div>
                    <div className="font-bold text-gray-900">
                      {formatTime(student.testSessions[0].speakingSlots[0].startTime)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-blue-600 mr-4 text-2xl">👨‍🏫</div>
                  <div>
                    <div className="text-sm text-gray-600">Teacher</div>
                    <div className="font-bold text-gray-900">
                     {student.testSessions[0].speakingSlots[0].teacher.firstName} {student.testSessions[0].speakingSlots[0].teacher.lastName}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Please arrive 5 minutes early. You'll receive your placement results within 24 hours.
              </p>
            </div>
          </div>
        )}

        {dashboardState === 'test_completed' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-600 text-6xl mb-4">⏳</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Placement Test Completed
            </h2>
            <p className="text-gray-700 text-lg mb-8">
              Thank you for completing your placement test! Our team is currently reviewing your results.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li>✓ Your test results are being evaluated</li>
                <li>✓ You'll receive your level placement via email</li>
                <li>✓ Our team will contact you with enrollment options</li>
              </ul>
            </div>
            <p className="text-sm text-gray-600 mt-6">
              Expected response time: 24-48 hours
            </p>
          </div>
        )}

        {dashboardState === 'enrolled_student' && (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700">Current Level</h3>
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {student.enrollments[0]?.group?.level?.name || 'N/A'}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {student.enrollments[0]?.group?.name || 'No group assigned'}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700">Attendance</h3>
                  <span className="text-2xl">✓</span>
                </div>
                <div className="text-3xl font-bold text-green-600">85%</div>
                <p className="text-sm text-gray-600 mt-2">On track</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-700">Outstanding</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-orange-600">BHD 150</div>
                <button className="text-sm text-blue-600 hover:text-blue-700 mt-2">
                  View payments →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/student/attendance')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl mb-2">📋</div>
                  <div className="font-medium text-gray-900">Attendance</div>
                </button>
                <button
                  onClick={() => router.push('/student/progress')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl mb-2">📈</div>
                  <div className="font-medium text-gray-900">Progress</div>
                </button>
                <button
                  onClick={() => router.push('/student/payments')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl mb-2">💳</div>
                  <div className="font-medium text-gray-900">Payments</div>
                </button>
                <button
                  onClick={() => router.push('/student/schedule')}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition"
                >
                  <div className="text-3xl mb-2">📅</div>
                  <div className="font-medium text-gray-900">Schedule</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Upcoming Classes</h3>
              <p className="text-gray-600">No upcoming classes scheduled</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}