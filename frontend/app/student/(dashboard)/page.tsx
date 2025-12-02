'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getStudentId, logout } from '@/lib/auth';

interface StudentData {
  id: string;
  firstName: string;
  secondName?: string;
  currentLevel?: string;
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
    completedAt?: string;
  }>;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
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
        console.log('No token or studentId found, redirecting to login');
        router.push('/login');
        return;
      }

      const response = await fetch(
        `http://localhost:3001/api/students/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudent(result.data);
        }
      } else if (response.status === 401 || response.status === 403) {
        // Unauthorized - redirect to login
        console.log('Unauthorized, redirecting to login');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      // On network error, check if we have valid auth
      const token = getToken();
      const studentId = getStudentId();
      if (!token || !studentId) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check test completion and enrollment status
  const hasCompletedTest = student?.currentLevel != null;
  const hasActiveEnrollment = student?.enrollments?.some(
    e => e.status === 'ACTIVE'
  ) ?? false;

  // FIXED: Use the logout function from auth.ts which clears everything properly
  const handleLogout = () => {
    logout(); // This will clear everything and redirect to /login
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // STATE 1: No test completed yet - Show placement test prompt
  if (!hasCompletedTest) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">📝</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Placement Test
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              To get started with your English learning journey, please take our placement test. 
              It will help us determine the right level for you.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-4">What to expect:</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Multiple choice questions (45 minutes)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Speaking test with our teachers (15 minutes)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Immediate level recommendation</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/student/placement-test')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
            >
              Start Placement Test →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STATE 2: Test completed but no enrollment - Show waiting message
  if (hasCompletedTest && !hasActiveEnrollment) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Test Completed Successfully!
            </h2>
            
            {/* Show student's level */}
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
  }

  // STATE 3: Has enrollment - Show normal dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Student Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Student Profile</h2>
              <p className="text-gray-600 mt-1">Current Level: <span className="font-semibold text-blue-600">{student?.currentLevel}</span></p>
            </div>
          </div>
        </div>

        {/* Active Enrollments */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Classes</h2>
          <div className="space-y-4">
            {student?.enrollments.filter(e => e.status === 'ACTIVE').map((enrollment) => (
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/student/schedule')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-semibold text-gray-900">My Schedule</h3>
            <p className="text-sm text-gray-600 mt-1">View class times</p>
          </button>

          <button
            onClick={() => router.push('/student/attendance')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">✓</div>
            <h3 className="font-semibold text-gray-900">Attendance</h3>
            <p className="text-sm text-gray-600 mt-1">View attendance record</p>
          </button>

          <button
            onClick={() => router.push('/student/materials')}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-semibold text-gray-900">Materials</h3>
            <p className="text-sm text-gray-600 mt-1">Access learning materials</p>
          </button>
        </div>
      </div>
    </div>
  );
}