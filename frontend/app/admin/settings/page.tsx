'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // System Settings
    instituteName: 'The Function Institute',
    instituteEmail: 'info@functioninstitute.com',
    institutePhone: '+973 1234 5678',
    instituteAddress: 'Manama, Bahrain',
    
    // Academic Settings
    defaultTermDuration: 90,
    defaultSessionDuration: 120,
    minStudentsPerGroup: 10,
    maxStudentsPerGroup: 20,
    
    // Payment Settings
    defaultInstallments: 3,
    lateFeePercentage: 5,
    enableAutomaticReminders: true,
    reminderDaysBefore: 7,
    
    // Notification Settings
    enableEmailNotifications: true,
    enableSMSNotifications: true,
    enableAttendanceWarnings: true,
    attendanceThreshold: 75,
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    try {
      alert('Settings saved successfully!');
      // API call would go here
    } catch (err: any) {
      alert('Error saving settings: ' + err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-700">Configure system-wide settings and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('academic')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'academic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Academic
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'payment'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Notifications
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Institute Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Institute Name</label>
                <input
                  type="text"
                  value={settings.instituteName}
                  onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.instituteEmail}
                    onChange={(e) => setSettings({ ...settings, instituteEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                  <input
                    type="text"
                    value={settings.institutePhone}
                    onChange={(e) => setSettings({ ...settings, institutePhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
                <textarea
                  value={settings.instituteAddress}
                  onChange={(e) => setSettings({ ...settings, instituteAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Academic Settings */}
          {activeTab === 'academic' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Academic Configuration</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Default Term Duration (days)</label>
                  <input
                    type="number"
                    value={settings.defaultTermDuration}
                    onChange={(e) => setSettings({ ...settings, defaultTermDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Default Session Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings.defaultSessionDuration}
                    onChange={(e) => setSettings({ ...settings, defaultSessionDuration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Min Students Per Group</label>
                  <input
                    type="number"
                    value={settings.minStudentsPerGroup}
                    onChange={(e) => setSettings({ ...settings, minStudentsPerGroup: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Max Students Per Group</label>
                  <input
                    type="number"
                    value={settings.maxStudentsPerGroup}
                    onChange={(e) => setSettings({ ...settings, maxStudentsPerGroup: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Payment Configuration</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Default Number of Installments</label>
                  <input
                    type="number"
                    value={settings.defaultInstallments}
                    onChange={(e) => setSettings({ ...settings, defaultInstallments: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Late Fee Percentage (%)</label>
                  <input
                    type="number"
                    value={settings.lateFeePercentage}
                    onChange={(e) => setSettings({ ...settings, lateFeePercentage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Reminder Days Before Due Date</label>
                  <input
                    type="number"
                    value={settings.reminderDaysBefore}
                    onChange={(e) => setSettings({ ...settings, reminderDaysBefore: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="autoReminders"
                  checked={settings.enableAutomaticReminders}
                  onChange={(e) => setSettings({ ...settings, enableAutomaticReminders: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="autoReminders" className="text-sm font-medium text-gray-900">
                  Enable Automatic Payment Reminders
                </label>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="emailNotif"
                    checked={settings.enableEmailNotifications}
                    onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="emailNotif" className="text-sm font-medium text-gray-900">
                    Enable Email Notifications
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="smsNotif"
                    checked={settings.enableSMSNotifications}
                    onChange={(e) => setSettings({ ...settings, enableSMSNotifications: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="smsNotif" className="text-sm font-medium text-gray-900">
                    Enable SMS Notifications
                  </label>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="attendanceWarning"
                    checked={settings.enableAttendanceWarnings}
                    onChange={(e) => setSettings({ ...settings, enableAttendanceWarnings: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <label htmlFor="attendanceWarning" className="text-sm font-medium text-gray-900">
                    Enable Attendance Warnings
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Attendance Warning Threshold (%)
                </label>
                <input
                  type="number"
                  value={settings.attendanceThreshold}
                  onChange={(e) => setSettings({ ...settings, attendanceThreshold: parseInt(e.target.value) })}
                  className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  min="0"
                  max="100"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Send warning when student attendance falls below this percentage
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={handleSave}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
