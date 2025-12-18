'use client';

import { useState, useEffect } from 'react';
import { testSessionAPI } from '@/lib/api';
import { getMCQLevel } from '@/lib/levelConfig';

export default function PlacementTestsPage() {
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
      const result = await testSessionAPI.getAll();
      setTests(result.data || []);
    } catch (err) {
      // console.error('Error loading tests:', err);
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
    inProgress: tests.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tests.filter(t => t.status === 'COMPLETED').length,
    avgScore: tests.filter(t => t.placementResult).reduce((acc, t) => acc + (t.placementResult?.score || 0), 0) / Math.max(tests.filter(t => t.placementResult).length, 1)
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  const renderHeader = () => (
    <div className="mb-6"><h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Tests</h1><p className="text-gray-700">Manage student placement test sessions and results</p></div>
  );

  const renderStats = () => (
    <div className="grid md:grid-cols-4 gap-6 mb-6"><div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600"><p className="text-sm font-medium text-gray-700 mb-1">Total Tests</p><p className="text-3xl font-bold text-gray-900">{tests.length}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600"><p className="text-sm font-medium text-gray-700 mb-1">In Progress</p><p className="text-3xl font-bold text-gray-900">{tests.filter(t => t.status === 'IN_PROGRESS').length}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600"><p className="text-sm font-medium text-gray-700 mb-1">Completed</p><p className="text-3xl font-bold text-gray-900">{tests.filter(t => t.status === 'COMPLETED').length}</p></div><div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600"><p className="text-sm font-medium text-gray-700 mb-1">Avg Score</p><p className="text-3xl font-bold text-gray-900">84%</p></div></div>
  );

  const renderFilters = () => (
    <div className="bg-white rounded-lg shadow p-6 mb-6"><div className="grid md:grid-cols-3 gap-4"><div className="col-span-2"><input type="text" placeholder="Search by student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900" /></div><div><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"><option value="all">All Status</option><option value="NOT_STARTED">Not Started</option><option value="IN_PROGRESS">In Progress</option><option value="COMPLETED">Completed</option></select></div></div></div>
  );

  const renderTableRow = (test: any) => (
    <tr key={test.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-sm font-medium text-gray-900">{test.student ? `${test.student.firstName} ${test.student.secondName || ''}`.trim() : 'N/A'}</td><td className="px-6 py-4 text-sm text-center text-gray-900">{test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</td><td className="px-6 py-4">{test.status === 'IN_PROGRESS' ? <div className="flex items-center gap-2"><div className="flex-1 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${test.progress}%` }} /></div><span className="text-xs font-medium text-gray-900">{test.progress}%</span></div> : <span className="text-sm text-center text-gray-900">-</span>}</td><td className="px-6 py-4 text-sm text-center font-semibold text-gray-900">{test.answers && typeof test.answers === 'object' ? `${test.answers.earnedPoints || 0} / ${test.answers.totalPoints || 0}` : '-'}</td><td className="px-6 py-4 text-center">{test.answers && typeof test.answers === 'object' ? <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{getMCQLevel(test.answers.earnedPoints || 0, test.answers.totalPoints || 10)}</span> : <span className="text-sm text-gray-900">-</span>}</td><td className="px-6 py-4 text-center"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${test.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : test.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{test.status.replace('_', ' ')}</span></td><td className="px-6 py-4 text-center"><div className="flex justify-center gap-2">{test.status === 'COMPLETED' && <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">View Results</button>}{test.status === 'IN_PROGRESS' && <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Continue</button>}</div></td></tr>
  );

  const renderTable = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden"><table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Test Date</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Progress</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Score</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">MCQ Level</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Status</th><th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredTests.map(renderTableRow)}</tbody></table></div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div>
      {renderHeader()}
      {renderStats()}
      {renderFilters()}
      {renderTable()}
    </div>
  );
}
