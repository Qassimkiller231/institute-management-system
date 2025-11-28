'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, removeToken } from '@/lib/auth';
interface StudentProfile {
  id: string;
  firstName: string;
  secondName: string | null;
  thirdName: string | null;
  email: string | null;
  dateOfBirth: string;
  gender: string;
  cpr: string;
  area: string | null;
  houseNo: string | null;
  road: string | null;
  block: string | null;
  schoolType: string | null;
  schoolYear: string | null;
  preferredTiming: string | null;
  preferredCenter: string | null;
  needsTransport: boolean;
  healthIssues: string | null;
  notes: string | null;
  phones: Array<{
    id: string;
    phoneNumber: string;
    countryCode: string;
    isPrimary: boolean;
  }>;
  parentStudentLinks: Array<{
    parent: {
      firstName: string;
      lastName: string;
      email: string | null;
      relationship: string;
    };
  }>;
  enrollments: Array<{
    status: string;
    group: {
      name: string;
      level: {
        name: string;
      };
    };
  }>;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        const studentId = user.studentId;

        if (!studentId) {
          throw new Error('Student ID not found');
        }

        const res = await fetch(`http://localhost:3001/api/students/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setEditData(data);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3001/api/students/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          firstName: editData.firstName,
          secondName: editData.secondName,
          thirdName: editData.thirdName,
          area: editData.area,
          houseNo: editData.houseNo,
          road: editData.road,
          block: editData.block,
          preferredTiming: editData.preferredTiming,
          preferredCenter: editData.preferredCenter,
          needsTransport: editData.needsTransport,
        })
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      const updated = await res.json();
      setProfile(updated);
      setEditData(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    removeToken()
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-4 h-64"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Profile</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const activeEnrollment = profile.enrollments.find(e => e.status === 'ACTIVE');
  const fullName = [profile.firstName, profile.secondName, profile.thirdName].filter(Boolean).join(' ');
  const primaryPhone = profile.phones.find(p => p.isPrimary);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.push('/student')}
            className="mb-4 text-gray-300 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Profile</h1>
              <p className="text-gray-300">View and manage your account settings</p>
            </div>
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-4xl">
              👤
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditData(profile);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{fullName}</h2>
            {activeEnrollment && (
              <p className="text-lg text-gray-600">
                {activeEnrollment.group.level.name} - {activeEnrollment.group.name}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">Student ID: {profile.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            👤 Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.firstName || ''}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Second Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.secondName || ''}
                  onChange={(e) => setEditData({ ...editData, secondName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.secondName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Third Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.thirdName || ''}
                  onChange={(e) => setEditData({ ...editData, thirdName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.thirdName || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{profile.email || '-'}</p>
              <p className="text-xs text-gray-500">Cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <p className="text-gray-900">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">Cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <p className="text-gray-900">{profile.gender}</p>
              <p className="text-xs text-gray-500">Cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPR</label>
              <p className="text-gray-900">{profile.cpr.replace(/(\d{9})/, '•••••••••')}</p>
              <p className="text-xs text-gray-500">Hidden for security</p>
            </div>
            {primaryPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-gray-900">{primaryPhone.countryCode} {primaryPhone.phoneNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            📍 Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.area || ''}
                  onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.area || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Block</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.block || ''}
                  onChange={(e) => setEditData({ ...editData, block: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.block || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Road</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.road || ''}
                  onChange={(e) => setEditData({ ...editData, road: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.road || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">House Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.houseNo || ''}
                  onChange={(e) => setEditData({ ...editData, houseNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{profile.houseNo || '-'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Parent Information */}
        {profile.parentStudentLinks.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              👨‍👩‍👧 Parent Information
            </h3>
            <div className="space-y-4">
              {profile.parentStudentLinks.map((link, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-semibold text-gray-900">
                    {link.parent.firstName} {link.parent.lastName}
                  </p>
                  <p className="text-sm text-gray-600">Relationship: {link.parent.relationship}</p>
                  {link.parent.email && (
                    <p className="text-sm text-gray-600">Email: {link.parent.email}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⚙️ Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Timing</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.preferredTiming || ''}
                  onChange={(e) => setEditData({ ...editData, preferredTiming: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Evening, Morning"
                />
              ) : (
                <p className="text-gray-900">{profile.preferredTiming || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Center</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.preferredCenter || ''}
                  onChange={(e) => setEditData({ ...editData, preferredCenter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Country Mall, Riyadat Mall"
                />
              ) : (
                <p className="text-gray-900">{profile.preferredCenter || '-'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={editData.needsTransport || false}
                    onChange={(e) => setEditData({ ...editData, needsTransport: e.target.checked })}
                    className="w-4 h-4 text-blue-600"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={profile.needsTransport}
                    disabled
                    className="w-4 h-4"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">Needs Transportation</span>
              </label>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(profile.healthIssues || profile.notes) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              📝 Additional Information
            </h3>
            {profile.healthIssues && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Health Issues</label>
                <p className="text-gray-900">{profile.healthIssues}</p>
              </div>
            )}
            {profile.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-gray-900">{profile.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}