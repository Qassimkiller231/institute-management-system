'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeacherId, logout } from '@/lib/authStorage';
import { teachersAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

interface TeacherProfile {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    phone?: string;
    role: string;
  };
  _count?: {
    groups: number;
  };
}

export default function TeacherProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const teacherId = getTeacherId();
      if (!teacherId) return;

      const data = await teachersAPI.getById(teacherId);
      setProfile(data.data);
      setFormData({
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        specialization: data.data.specialization || ''
      });
    } catch (err: any) {
      alert('Error loading profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const teacherId = getTeacherId();
      if (!teacherId) return;

      await teachersAPI.update(teacherId, formData);
      alert('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        specialization: profile.specialization || ''
      });
    }
    setEditing(false);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
      </header>
    );
  };

  /**
   * Render profile header with avatar
   */
  const renderProfileHeader = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-gray-600 text-lg">{profile.specialization || 'English Teacher'}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                profile.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-gray-500 text-sm">
                👥 {profile._count?.groups || 0} groups assigned
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render personal information form
   */
  const renderPersonalInfo = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialization
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., IELTS Preparation, Business English"
              />
            ) : (
              <p className="text-gray-900 font-medium">{profile.specialization || 'Not specified'}</p>
            )}
          </div>

          {editing && (
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /**
   * Render account information
   */
  const renderAccountInfo = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Account Information</h3>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-gray-900 font-medium">{profile.user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <p className="text-gray-900 font-medium">{profile.user.phone || 'Not provided'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <p className="text-gray-900 font-medium">{profile.user.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher ID
            </label>
            <p className="text-gray-900 font-mono text-sm">{profile.id}</p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render statistics
   */
  const renderStatistics = () => {
    if (!profile) return null;

    return (
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Statistics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{profile._count?.groups || 0}</div>
            <div className="text-sm text-gray-600 mt-1">Active Groups</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">-</div>
            <div className="text-sm text-gray-600 mt-1">Total Students</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">-</div>
            <div className="text-sm text-gray-600 mt-1">Sessions This Month</div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render danger zone
   */
  const renderDangerZone = () => {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-8">
        <h3 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h3>
        <p className="text-red-700 mb-4">
          Logging out will end your current session. You'll need to login again to access your account.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
        >
          Logout
        </button>
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderProfileHeader()}
          {renderPersonalInfo()}
          {renderAccountInfo()}
          {renderStatistics()}
          {renderDangerZone()}
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <ErrorState 
        title="Failed to load profile"
        message="Please try again."
        onRetry={fetchProfile}
      />
    );
  }

  return renderProfilePage();
}