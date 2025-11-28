'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getTeacherId } from '@/lib/auth';

interface Group {
  id: string;
  groupCode: string;
  name?: string;
  level: {
    id: string;
    name: string;
  };
}

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  enrollmentId: string;
}

interface Criteria {
  id: string;
  name: string;
  description?: string;
  category: string;
}

interface StudentProgress {
  studentId: string;
  criteriaId: string;
  completed: boolean;
  notes?: string;
}

export default function UpdateProgress() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [progress, setProgress] = useState<Record<string, StudentProgress>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchStudents();
      fetchCriteria();
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedStudent && selectedGroup) {
      fetchStudentProgress();
    }
  }, [selectedStudent, selectedGroup]);

  const fetchGroups = async () => {
    try {
      const token = getToken();
      const teacherId = getTeacherId();
      
      const response = await fetch(`http://localhost:3001/api/groups?teacherId=${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setGroups(data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(
        `http://localhost:3001/api/enrollments?groupId=${selectedGroup}&status=ACTIVE`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      const enrollments = data.data || [];
      
      setStudents(enrollments.map((e: any) => ({
        ...e.student,
        enrollmentId: e.id
      })));
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const token = getToken();
      const group = groups.find(g => g.id === selectedGroup);
      
      if (!group) return;

      const response = await fetch(
        `http://localhost:3001/api/progress-criteria?levelId=${group.level.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      setCriteria(data.data || []);
    } catch (err) {
      console.error('Error fetching criteria:', err);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const token = getToken();
      
      const response = await fetch(
        `http://localhost:3001/api/student-progress/${selectedStudent}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();
      const progressData = data.data || [];
      
      // Initialize progress state
      const progressMap: Record<string, StudentProgress> = {};
      criteria.forEach(criterion => {
        const existing = progressData.find((p: any) => p.criteriaId === criterion.id);
        progressMap[criterion.id] = existing || {
          studentId: selectedStudent,
          criteriaId: criterion.id,
          completed: false,
          notes: ''
        };
      });
      
      setProgress(progressMap);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const handleToggleCriteria = (criteriaId: string) => {
    setProgress(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        completed: !prev[criteriaId]?.completed
      }
    }));
  };

  const handleNotesChange = (criteriaId: string, notes: string) => {
    setProgress(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        notes
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      const token = getToken();
      const teacherId = getTeacherId();

      const progressUpdates = Object.values(progress).map(p => ({
        studentId: p.studentId,
        criteriaId: p.criteriaId,
        completed: p.completed,
        notes: p.notes || undefined,
        teacherId
      }));

      const response = await fetch('http://localhost:3001/api/student-progress/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ progressUpdates })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save progress');
      }

      alert('Progress saved successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const completionPercentage = criteria.length > 0 
    ? Math.round((completedCount / criteria.length) * 100)
    : 0;

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) acc[criterion.category] = [];
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, Criteria[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Update Student Progress</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group *
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedStudent('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a group</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.groupCode} - {group.level.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student *
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!selectedGroup}
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.secondName} {student.thirdName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Overview */}
        {selectedStudent && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedStudentData?.firstName} {selectedStudentData?.secondName}
                </h2>
                <p className="text-gray-600">Progress Overview</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">{completionPercentage}%</div>
                <p className="text-sm text-gray-900">
                  {completedCount} of {criteria.length} completed
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Criteria Checklist */}
        {selectedStudent && criteria.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedCriteria).map(([category, categoryCriteria]) => (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-4">
                  {categoryCriteria.map(criterion => (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={progress[criterion.id]?.completed || false}
                          onChange={() => handleToggleCriteria(criterion.id)}
                          className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <label className="font-medium text-gray-900 cursor-pointer">
                            {criterion.name}
                          </label>
                          {criterion.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {criterion.description}
                            </p>
                          )}
                          <textarea
                            value={progress[criterion.id]?.notes || ''}
                            onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
                            placeholder="Add notes (optional)..."
                            className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : selectedStudent && criteria.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
            No progress criteria defined for this level
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-900">
            Please select a group and student to update progress
          </div>
        )}

        {/* Save Button */}
        {selectedStudent && criteria.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {saving ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}