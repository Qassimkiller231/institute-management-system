'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken, getStudentId } from '@/lib/authStorage';
import { studentsAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

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
        const studentId = getStudentId();

        if (!studentId) {
          router.push('/login');
          return;
        }

        const result = await studentsAPI.getById(studentId);
        const data = result.data || result;
        setProfile(data);
        setEditData(data);

      } catch (err) {
        // console.error('Error fetching profile:', err);
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
      await studentsAPI.update(profile.id, {
        firstName: editData.firstName,
        secondName: editData.secondName ?? undefined,
        thirdName: editData.thirdName ?? undefined,
        area: editData.area ?? undefined,
        houseNo: editData.houseNo ?? undefined,
        road: editData.road ?? undefined,
        block: editData.block ?? undefined,
        preferredTiming: editData.preferredTiming ?? undefined,
        preferredCenter: editData.preferredCenter ?? undefined,
        needsTransport: editData.needsTransport,
      });

      // Refetch profile to get updated data
      const result = await studentsAPI.getById(profile.id);
      const updated = result.data || result;
      setProfile(updated);
      setEditData(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');

    } catch (err) {
      // console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    removeToken()
    router.push('/login');
  };

  // ========================================
  // CALCULATIONS
  // ========================================

  const activeEnrollment = profile?.enrollments.find(e => e.status === 'ACTIVE');
  const fullName = profile ? [profile.firstName, profile.secondName, profile.thirdName].filter(Boolean).join(' ') : '';
  const primaryPhone = profile?.phones.find(p => p.isPrimary);

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
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
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => {
    return (
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
                setEditData(profile!);
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
    );
  };

  /**
   * Render profile header card
   */
  const renderProfileHeader = () => {
    if (!profile) return null;

    return (
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
    );
  };

  /**
   * Render personal information section
   */
  const renderPersonalInfo = () => {
    if (!profile) return null;

    return (
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
    );
  };

  /**
   * Render address section
   */
  const renderAddressInfo = () => {
    if (!profile) return null;

    return (
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
    );
  };

  /**
   * Render parent information section
   */
  const renderParentInfo = () => {
    if (!profile || !profile.parentStudentLinks || profile.parentStudentLinks.length === 0) return null;

    return (
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
    );
  };

  /**
   * Render preferences section
   */
  const renderPreferences = () => {
    if (!profile) return null;

    return (
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
    );
  };

  /**
   * Render additional information section
   */
  const renderAdditionalInfo = () => {
    if (!profile || (!profile.healthIssues && !profile.notes)) return null;

    return (
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
    );
  };

  /**
   * Render main profile page
   */
  const renderProfilePage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-4xl mx-auto px-6 py-8">
          {renderActionButtons()}
          {renderProfileHeader()}
          {renderPersonalInfo()}
          {renderAddressInfo()}
          {renderParentInfo()}
          {renderPreferences()}
          {renderAdditionalInfo()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  if (loading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Profile"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!profile) return null;

  return renderProfilePage();
}