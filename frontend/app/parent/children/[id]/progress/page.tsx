'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { studentsAPI, criteriaAPI } from '@/lib/api';
import { getToken } from '@/lib/authStorage';
import { LoadingState } from '@/components/common/LoadingState';

// ========================================
// TYPES
// ========================================

interface Criterion {
  criteriaId: string;
  name: string;
  description: string | null;
  orderNumber: number | null;
  completed: boolean;
  completedAt: Date | null;
}

interface ProgressData {
  studentId: string;
  enrollmentId: string | null;
  totalCriteria: number;
  completedCount: number;
  progressPercentage: number;
  criteria: Criterion[];
  currentLevel?: string;
  nextLevel?: string;
}

interface Student {
  id: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  enrollments?: any[];
}

export default function ChildProgressPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Fetch progress data on mount
   */
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = getToken();
        
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch student with enrollments
        const studentData = await studentsAPI.getById(studentId);
        const studentInfo = studentData.data || studentData;
        setStudent(studentInfo);

        // Get active enrollment
        const activeEnrollment = studentInfo.enrollments?.find((e: any) => e.status === 'ACTIVE');
        
        if (!activeEnrollment) {
          setProgressData({
            studentId,
            enrollmentId: null,
            totalCriteria: 0,
            completedCount: 0,
            progressPercentage: 0,
            criteria: []
          });
          setLoading(false);
          return;
        }

        // Get levelId from enrollment
        const levelId = activeEnrollment.group.levelId;
        const groupId = activeEnrollment.group.id;

        // Fetch progress data
        const progressResponse = await criteriaAPI.getStudentProgress(studentId, {
          enrollmentId: activeEnrollment.id,
          levelId: levelId
        });
        
        const progress = progressResponse.data || progressResponse;

        // Get level name
        const currentLevel = activeEnrollment.group.level?.name || 'Unknown';

        setProgressData({
          ...progress,
          currentLevel,
          nextLevel: getNextLevel(currentLevel)
        });

      } catch (err) {
        // console.error('Error fetching progress:', err); // Debug
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchProgress();
    }
  }, [studentId, router]);

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  
  /**
   * Get next level based on current level
   */
  const getNextLevel = (currentLevel: string): string => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex >= 0 && currentIndex < levels.length - 1 
      ? levels[currentIndex + 1] 
      : 'Advanced';
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render error state
   */
  const renderError = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error Loading Progress</h2>
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
  };

  /**
   * Render empty state (no criteria)
   */
  const renderEmptyState = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {student?.firstName}'s Progress
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800 text-lg">
              No progress criteria available yet. The teacher will set up criteria for this level soon.
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render header section
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="mb-4 text-blue-100 hover:text-white flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold mb-2">
            {student?.firstName}'s Progress
          </h1>
          <p className="text-blue-100">Track your child's learning journey and achievements</p>
        </div>
      </div>
    );
  };

  /**
   * Render circular progress indicator
   */
  const renderCircularProgress = (percentage: number) => {
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - percentage / 100);

    return (
      <div className="relative w-32 h-32">
        <svg className="transform -rotate-90 w-32 h-32">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#3b82f6"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{Math.round(percentage)}%</span>
        </div>
      </div>
    );
  };

  /**
   * Render completion celebration
   */
  const renderCompletionCelebration = () => {
    if (!progressData || progressData.progressPercentage < 100) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        <div>
          <p className="font-semibold text-green-800">Congratulations!</p>
          <p className="text-green-700 text-sm">
            Your child has completed all criteria for {progressData.currentLevel}. Ready for {progressData.nextLevel}!
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render current level card
   */
  const renderCurrentLevelCard = () => {
    if (!progressData) return null;

    const { currentLevel, progressPercentage, completedCount, totalCriteria } = progressData;

    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Current Level</h2>
            <p className="text-4xl font-bold text-blue-600">{currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
            {renderCircularProgress(progressPercentage)}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-medium">
              {completedCount} of {totalCriteria} criteria completed
            </span>
            <span className="text-blue-600 font-semibold">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {renderCompletionCelebration()}
      </div>
    );
  };

  /**
   * Render single criterion card
   */
  const renderCriterionCard = (criterion: Criterion, isCompleted: boolean) => {
    return (
      <div 
        key={criterion.criteriaId}
        className={`bg-white rounded-lg shadow p-5 border-l-4 ${
          isCompleted ? 'border-green-500' : 'border-gray-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <span className={`text-xl ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
              {isCompleted ? '✓' : '○'}
            </span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{criterion.name}</h4>
            {criterion.description && (
              <p className="text-gray-600 text-sm mb-2">{criterion.description}</p>
            )}
            {criterion.completedAt && (
              <p className="text-xs text-gray-500">
                Completed on {new Date(criterion.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render completed criteria section
   */
  const renderCompletedCriteria = (completedCriteria: Criterion[]) => {
    if (completedCriteria.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-600">✓</span> Completed Criteria ({completedCriteria.length})
        </h3>
        <div className="space-y-3">
          {completedCriteria.map((criterion) => renderCriterionCard(criterion, true))}
        </div>
      </div>
    );
  };

  /**
   * Render pending criteria section
   */
  const renderPendingCriteria = (pendingCriteria: Criterion[]) => {
    if (pendingCriteria.length === 0) return null;

    return (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-yellow-600">○</span> Pending Criteria ({pendingCriteria.length})
        </h3>
        <div className="space-y-3">
          {pendingCriteria.map((criterion) => renderCriterionCard(criterion, false))}
        </div>
      </div>
    );
  };

  /**
   * Render next steps card
   */
  const renderNextSteps = () => {
    if (!progressData || progressData.progressPercentage >= 100) return null;

    const pendingCount = progressData.criteria.filter(c => !c.completed).length;

    return (
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Keep Going! 💪</h3>
        <p className="text-gray-700 mb-3">
          {pendingCount} criteria remaining to advance to {progressData.nextLevel}.
        </p>
        <p className="text-sm text-gray-600">
          The teacher will mark criteria as complete when mastery is demonstrated.
        </p>
      </div>
    );
  };

  /**
   * Render main progress page
   */
  const renderProgressPage = () => {
    if (!progressData) return null;

    const { criteria } = progressData;
    const completedCriteria = criteria.filter(c => c.completed);
    const pendingCriteria = criteria.filter(c => !c.completed);

    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderCurrentLevelCard()}
          {renderCompletedCriteria(completedCriteria)}
          {renderPendingCriteria(pendingCriteria)}
          {renderNextSteps()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading progress..." />;
  }

  if (error) {
    return renderError();
  }

  if (!progressData || progressData.totalCriteria === 0) {
    return renderEmptyState();
  }

  return renderProgressPage();
}
