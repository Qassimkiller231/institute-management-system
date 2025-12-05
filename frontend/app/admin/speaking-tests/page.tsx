'use client';

import { useState, useEffect } from 'react';
import { speakingSlotAPI } from '@/lib/api';

export default function SpeakingTestsPage() {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await speakingSlotAPI.getAvailable();
      setTests(response.data || []);
    } catch (err) {
      console.error('Error loading tests:', err);
      alert('Error loading tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const studentName = test.student ? `${test.student.firstName} ${test.student.secondName}`.trim() : '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tests.length,
    scheduled: tests.filter(t => t.status === 'BOOKED').length,
    completed: tests.filter(t => t.status === 'COMPLETED').length,
    avgScore: tests.filter(t => t.result).reduce((acc, t) => acc + (t.result.score || 0), 0) / Math.max(tests.filter(t => t.result).length, 1)
  };

  return (
    <div>
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Speaking Tests</h1>
          <p className="text-gray-700">Schedule and manage speaking test sessions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Total Tests</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-700 mb-1">Scheduled</p>
          <p className="text-3xl font-bold text-gray-900">{stats.scheduled}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <p className="text-sm font-medium text-gray-700 mb-1">Average Score</p>
          <p className="text-3xl font-bold text-gray-900">{stats.avgScore.toFixed(0)}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="BOOKED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Teacher</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Time</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Score</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTests.map((test) => {
              const studentName = test.student ? `${test.student.firstName} ${test.student.secondName}`.trim() : 'N/A';
              const teacherName = test.teacher ? `${test.teacher.firstName} ${test.teacher.secondName}`.trim() : 'N/A';
              
              return (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{studentName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{test.speakingLevel || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{teacherName}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">
                    {test.slotDate ? new Date(test.slotDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">
                    {test.startTime ? `${test.startTime} - ${test.endTime}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      test.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      test.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {test.status === 'BOOKED' ? 'SCHEDULED' : test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">
                    {test.result?.score ? `${test.result.score}%` : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                        View
                      </button>
                      {test.status === 'BOOKED' && (
                        <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTests.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-600">No tests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
