'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { authAPI } from '@/lib/api';

interface LinkedStudent {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  cpr: string;
  email?: string;
  currentLevel?: string;
  dateOfBirth?: string;
  gender?: string;
  isActive: boolean;
  relationship?: string;
  linkId?: string;
}

export default function MyChildrenPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      const userData = await authAPI.getCurrentUser();

      if (userData.data.parent?.parentStudentLinks) {
        const linkedStudents = userData.data.parent.parentStudentLinks.map((link: any) => ({
          ...link.student,
          relationship: link.relationship,
          linkId: link.id
        }));
        setStudents(linkedStudents);
      }
    } catch (err: any) {
      console.error('Error loading children:', err);
      alert('Error loading data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.secondName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.cpr || '').includes(searchTerm);
    return matchesSearch;
  });

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading children...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Children</h2>
        <p className="text-gray-600 mb-4">View and track your children's educational progress</p>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or CPR..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
        />
      </div>

      {/* Children List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">👶</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Children Found</h3>
          <p className="text-gray-600">
            {students.length === 0 
              ? 'No children are linked to your account yet. Contact the administration to link your children.'
              : 'No children match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {student.firstName} {student.secondName} {student.thirdName}
                    </h3>
                    {student.relationship && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {student.relationship}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    student.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">CPR:</span>
                    <span className="text-gray-900 font-medium">{student.cpr}</span>
                  </div>
                  {student.email && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Email:</span>
                      <span className="text-gray-900">{student.email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 w-24">Age:</span>
                    <span className="text-gray-900">{calculateAge(student.dateOfBirth)} years</span>
                  </div>
                  {student.gender && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Gender:</span>
                      <span className="text-gray-900">{student.gender}</span>
                    </div>
                  )}
                  {student.currentLevel && (
                    <div className="flex items-center text-sm">
                      <span className="text-gray-600 w-24">Level:</span>
                      <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                        {student.currentLevel}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push(`/parent/children/${student.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => router.push(`/parent/children/${student.id}/progress`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {students.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-blue-100 text-sm">Total Children</p>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Active</p>
              <p className="text-3xl font-bold">{students.filter(s => s.isActive).length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">With Level</p>
              <p className="text-3xl font-bold">{students.filter(s => s.currentLevel).length}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Average Age</p>
              <p className="text-3xl font-bold">
                {Math.round(students.reduce((sum, s) => sum + (calculateAge(s.dateOfBirth) as number || 0), 0) / students.length)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
