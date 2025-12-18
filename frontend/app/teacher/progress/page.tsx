'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getTeacherId } from '@/lib/authStorage';
import { groupsAPI, enrollmentsAPI, criteriaAPI } from '@/lib/api';

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
  levelId?: string;
  levelName?: string;
}

interface Criteria {
  id: string;
  name: string;
  description?: string;
  orderNumber?: number;
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
    if (selectedGroup && groups.length > 0) {
      // console.log('🔄 [EFFECT] Selected group changed:', selectedGroup);
      fetchStudents();
    }
  }, [selectedGroup, groups]);

  useEffect(() => {
    if (selectedStudent && selectedGroup) {
      // console.log('🔄 [EFFECT] Selected student changed:', selectedStudent);
      fetchCriteria(); // Only fetch criteria when student changes
    }
  }, [selectedStudent, selectedGroup, students]);

  // Fetch progress AFTER criteria are loaded
  useEffect(() => {
    if (selectedStudent && selectedGroup && criteria.length > 0) {
      // console.log('🔄 [EFFECT] Criteria loaded, fetching progress for student:', selectedStudent);
      fetchStudentProgress();
    }
  }, [selectedStudent, selectedGroup, criteria]);

  // Debug: Log when criteria changes
  useEffect(() => {
    // console.log('📋 [STATE] Criteria state updated:', criteria.length, 'items');
    // if (criteria.length > 0) {
    //   console.log('   First 3 criteria:', criteria.slice(0, 3));
    // }
  }, [criteria]);

  const fetchGroups = async () => {
    try {
      const teacherId = getTeacherId();
      if (!teacherId) return;
      
      // console.log('📚 [DEBUG] Fetching groups for teacher:', teacherId);
      
      const data = await groupsAPI.getAll({ teacherId });
      // console.log('📚 [DEBUG] Groups response:',data);
      // console.log('📚 [DEBUG] Groups count:', data.data?.length || 0);
      
      // if (data.data && data.data.length > 0) {
      //   console.log('📚 [DEBUG] First group level info:', {
      //     groupCode: data.data[0].groupCode,
      //     level: data.data[0].level
      //   });
      // }
      
      setGroups(data.data || []);
    } catch (err) {
      // console.error('Error fetching groups:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // console.log('👥 [DEBUG] Fetching students for group:', selectedGroup);
      
      const data = await enrollmentsAPI.getAll({ 
        groupId: selectedGroup, 
        status: 'ACTIVE' 
      });
      // console.log('👥 [DEBUG] Enrollments response:', data);
      
      const enrollments = data.data || [];
      // console.log('👥 [DEBUG] Enrollments count:', enrollments.length);
      
      // if (enrollments.length > 0) {
      //   console.log('👥 [DEBUG] First enrollment:', enrollments[0]);
      //   console.log('👥 [DEBUG] First student:', enrollments[0].student);
      // }
      
      const selectedGroupData = groups.find(g => g.id === selectedGroup);
      
      const studentsList = enrollments.map((e: any) => ({
        ...e.student,
        enrollmentId: e.id,
        levelId: selectedGroupData?.level?.id || e.group?.level?.id,
        levelName: selectedGroupData?.level?.name || e.group?.level?.name || 'Not Assigned'
      }));
      
      // console.log('👥 [DEBUG] Mapped students:', studentsList);
      setStudents(studentsList);
    } catch (err) {
      // console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteria = async () => {
    try {
      const token = getToken();
      const student = students.find(s => s.id === selectedStudent);
      
      // console.log('🔍 [DEBUG] fetchCriteria called');
      // console.log('   Selected Student ID:', selectedStudent);
      // console.log('   Found Student:', student);
      // console.log('   Student Level ID:', student?.levelId);
      
      if (!student || !student.levelId) {
        // console.log('   ❌ No student or level found, returning...');
        return;
      }

      // console.log('   📡 Fetching criteria for level:', student.levelId);
      const data = await criteriaAPI.getAll({ levelId: student.levelId });

      // console.log('   📦 Response data:', data);
      // console.log('   📊 Criteria count:', data.data?.length || 0);
      
      setCriteria(data.data || []);
    } catch (err) {
      // console.error('❌ Error fetching criteria:', err);
    }
  };

  const fetchStudentProgress = async () => {
    try {
      const token = getToken();
      const student = students.find(s => s.id === selectedStudent);
      
      if (!student || !student.enrollmentId || !student.levelId) {
        // console.error('Missing student data:', student);
        return;
      }
      
      const data = await criteriaAPI.getStudentProgress(selectedStudent, {
        enrollmentId: student.enrollmentId,
        levelId: student.levelId
      });
      // console.log('📊 [DEBUG] Progress API response:', data);
      
      // Backend returns: { data: { criteria: [...], totalCriteria, completedCount, etc } }
      const progressData: any[] = data.data?.criteria || [];
      // console.log('📊 [DEBUG] Progress criteria array:', progressData);
      
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
      // console.error('Error fetching progress:', err);
    }
  };

  const handleToggle = (criteriaId: string) => {
    setProgress(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        studentId: selectedStudent,
        criteriaId,
        completed: !prev[criteriaId]?.completed
      }
    }));
  };

  const handleNotesChange = (criteriaId: string, notes: string) => {
    setProgress(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        studentId: selectedStudent,
        criteriaId,
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

      await criteriaAPI.bulkUpdate(progressUpdates);

      alert('Progress saved successfully!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);
  
  // console.log('🎓 [DEBUG] Selected student ID:', selectedStudent);
  // console.log('🎓 [DEBUG] Students array:', students);
  // console.log('🎓 [DEBUG] Selected student data:', selectedStudentData);
  
  // Check if student has a level
  // if (selectedStudentData && !selectedStudentData.levelId) {
  //   console.warn('⚠️  [WARNING] Student has no level assigned! Cannot fetch criteria.');
  //   console.log('   Student:', selectedStudentData.firstName, selectedStudentData.secondName);
  //   console.log('   Enrollment ID:', selectedStudentData.enrollmentId);
  // }
  
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const completionPercentage = criteria.length > 0 
    ? Math.round((completedCount / criteria.length) * 100)
    : 0;

  // Group criteria by category
  // Criteria don't have categories, just display them all in order
  const sortedCriteria = [...criteria].sort((a, b) => {
    const orderA = a.orderNumber || 999;
    const orderB = b.orderNumber || 999;
    return orderA - orderB;
  });
  
  // Get student name safely
  const getStudentName = () => {
    if (!selectedStudentData) return 'Student';
    const parts = [
      selectedStudentData.firstName,
      selectedStudentData.secondName,
      selectedStudentData.thirdName
    ].filter(p => p && p.trim()); // Filter out null, undefined, and empty strings
    return parts.length > 0 ? parts.join(' ') : 'Student';
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
          <h1 className="text-3xl font-bold text-gray-900">Update Student Progress</h1>
        </div>
      </header>
    );
  };

  /**
   * Render group and student selectors
   */
  const renderSelectors = () => {
    return (
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
          >
            <option value="" className="text-gray-700">Choose a group</option>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500"
            disabled={!selectedGroup}
          >
            <option value="" className="text-gray-700">Choose a student</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.secondName} {student.thirdName}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  /**
   * Render no level warning
   */
  const renderNoLevelWarning = () => {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-yellow-800">
              No Level Assigned to {getStudentName()}
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This student's enrollment does not have a level assigned. 
                You must assign a level (A1, A2, B1, or B2) before you can update their progress.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => {
                  alert('Please go to Student Management → Edit Student → Assign Level\n\nOr contact the administrator to assign a level to this student\'s enrollment.');
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                How to Assign Level
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render progress overview
   */
  const renderProgressOverview = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {getStudentName()}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-600">Progress Overview</p>
              {selectedStudentData?.levelName && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded border border-blue-200">
                  {selectedStudentData.levelName}
                </span>
              )}
            </div>
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
    );
  };

  /**
   * Render single criteria row
   */
  const renderCriteriaRow = (criterion: Criteria) => {
    return (
      <div key={criterion.id} className="border rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={progress[criterion.id]?.completed || false}
            onChange={() => handleToggle(criterion.id)}
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
              placeholder="Add notes (optional)"
              value={progress[criterion.id]?.notes || ''}
              onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render criteria checklist
   */
  const renderCriteriaChecklist = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Progress Criteria</h3>
        <div className="space-y-4">
          {sortedCriteria.map(criterion => renderCriteriaRow(criterion))}
        </div>
      </div>
    );
  };

  /**
   * Render empty state - no criteria
   */
  const renderNoCriteriaState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-800 text-lg font-semibold">No progress criteria defined for this level</p>
      </div>
    );
  };

  /**
   * Render empty state - no student selected
   */
  const renderNoSelectionState = () => {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-800 text-lg font-semibold">Please select a group and student to update progress</p>
      </div>
    );
  };

  /**
   * Render save button
   */
  const renderSaveButton = () => {
    if (!selectedStudent || !selectedStudentData?.levelId || criteria.length === 0) return null;

    return (
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {saving ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
    );
  };

  /**
   * Render progress content section
   */
  const renderProgressContent = () => {
    // No student selected
    if (!selectedStudent) {
      return renderNoSelectionState();
    }

    // Student has no level
    if (selectedStudentData && !selectedStudentData.levelId) {
      return renderNoLevelWarning();
    }

    // Student has level
    if (selectedStudentData?.levelId) {
      return (
        <>
          {renderProgressOverview()}
          {criteria.length > 0 ? renderCriteriaChecklist() : renderNoCriteriaState()}
          {renderSaveButton()}
        </>
      );
    }

    return null;
  };

  /**
   * Render main progress page
   */
  const renderProgressPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderSelectors()}
          {renderProgressContent()}
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  return renderProgressPage();
}
