'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface LinkedStudent {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  email?: string;
  currentLevel?: string;
  relationship?: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [parentInfo, setParentInfo] = useState<any>(null);
  const [students, setStudents] = useState<LinkedStudent[]>([]);

  useEffect(() => {
    fetchParentData();
  }, []);

  const fetchParentData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Get current user info (now includes parent data)
      const userRes = await fetch('http://localhost:3001/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!userRes.ok) throw new Error('Failed to fetch user data');
      
      const userData = await userRes.json();
      setParentInfo(userData.data);

      // Extract linked students from parent data
      if (userData.data.parent?.parentStudentLinks) {
        const linkedStudents = userData.data.parent.parentStudentLinks.map((link: any) => ({
          ...link.student,
          relationship: link.relationship,
          linkId: link.id
        }));
        setStudents(linkedStudents);
      }
    } catch (err: any) {
      console.error('Error loading parent data:', err);
      alert('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {parentInfo?.parent?.firstName} {parentInfo?.parent?.lastName}!
        </h2>
        <p className="text-blue-100">
          View and manage your children's educational progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Linked Children</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👶</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Active Enrollments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">$0</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-2xl">💳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Students */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">My Children</h3>
        </div>
        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No children linked yet</p>
              <p className="text-sm">Contact the administration to link your children to your account</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {student.firstName} {student.secondName} {student.thirdName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">CPR: {student.cpr}</p>
                      {student.email && (
                        <p className="text-sm text-gray-600">Email: {student.email}</p>
                      )}
                      {student.currentLevel && (
                        <p className="text-sm text-blue-600 mt-2">
                          Current Level: <span className="font-medium">{student.currentLevel}</span>
                        </p>
                      )}
                    </div>
                    {student.relationship && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {student.relationship}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/parent/children/${student.id}`)}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6 grid md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/parent/announcements')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
          >
            <span className="text-2xl mb-2 block">📢</span>
            <h4 className="font-semibold text-gray-900">View Announcements</h4>
            <p className="text-sm text-gray-600 mt-1">Stay updated with latest news</p>
          </button>

          <button
            onClick={() => router.push('/parent/materials')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-left"
          >
            <span className="text-2xl mb-2 block">📚</span>
            <h4 className="font-semibold text-gray-900">Access Materials</h4>
            <p className="text-sm text-gray-600 mt-1">View learning resources</p>
          </button>

          <button
            onClick={() => router.push('/parent/payments')}
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition text-left"
          >
            <span className="text-2xl mb-2 block">💳</span>
            <h4 className="font-semibold text-gray-900">Make Payment</h4>
            <p className="text-sm text-gray-600 mt-1">Pay fees and view history</p>
          </button>
        </div>
      </div>
    </div>
  );
}
