'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStudentId } from '@/lib/authStorage';
import { studentsAPI, criteriaAPI } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

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

export default function StudentProgressPage() {
  const router = useRouter();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const studentId = getStudentId();

        if (!studentId) {
          router.push('/login');
          return;
        }

        // Fetch student with enrollments
        const result = await studentsAPI.getById(studentId);
        const student = result.data || result;

        // Get active enrollment
        const activeEnrollment = student.enrollments?.find((e: any) => e.status === 'ACTIVE');
        
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

        // Validate group exists
        if (!activeEnrollment.group) {
          throw new Error('Enrollment group data not found. Please contact administration.');
        }

        // Validate level exists
        if (!activeEnrollment.group.level) {
          throw new Error('Level not assigned to group. Please contact administration.');
        }

        // Get levelId from enrollment (access via nested level object)
        const levelId = activeEnrollment.group.level.id;
        
        if (!levelId) {
          throw new Error('Level ID missing. Please contact administration.');
        }

        // Fetch progress data
        const progressResponse = await criteriaAPI.getStudentProgress(studentId, {
          enrollmentId: activeEnrollment.id,
          levelId: levelId
        });
        
        const progress = progressResponse.data || progressResponse;

        // Get level name
        const currentLevel = activeEnrollment.group.level.name || 'Unknown';

        setProgressData({
          ...progress,
          currentLevel,
          nextLevel: getNextLevel(currentLevel)
        });

      } catch (err) {
        // console.error('Error fetching progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  const getNextLevel = (currentLevel: string): string => {
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const currentIndex = levels.indexOf(currentLevel);
    return currentIndex >= 0 && currentIndex < levels.length - 1 
      ? levels[currentIndex + 1] 
      : 'Advanced';
  };

  // ========================================
  // CALCULATIONS
  // ========================================
  
  const completedCount = progressData?.completedCount ?? 0;
  const totalCriteria = progressData?.totalCriteria ?? 0;
  const progressPercentage = progressData?.progressPercentage ?? 0;
  const criteria = progressData?.criteria ?? [];
  const currentLevel = progressData?.currentLevel;
  const nextLevel = progressData?.nextLevel;
  const completedCriteria = criteria.filter(c => c.completed);
  const pendingCriteria = criteria.filter(c => !c.completed);

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render page header
   */
  const renderHeader = () => {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.push('/student')}
            className="mb-4 text-blue-100 hover:text-white flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">My Progress</h1>
          <p className="text-blue-100">Track your learning journey and achievements</p>
        </div>
      </div>
    );
  };

  /**
   * Render current level card with circular progress
   */
  const renderLevelCard = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Current Level</h2>
            <p className="text-4xl font-bold text-blue-600">{currentLevel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Overall Progress</p>
            <div className="relative w-32 h-32">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
        </div>

        {renderProgressBar()}
        {renderCompletionMessage()}
      </div>
    );
  };

  /**
   * Render progress bar
   */
  const renderProgressBar = () => {
    return (
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
    );
  };

  /**
   * Render completion message
   */
  const renderCompletionMessage = () => {
    if (progressPercentage !== 100) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        <div>
          <p className="font-semibold text-green-800">Congratulations!</p>
          <p className="text-green-700 text-sm">
            You've completed all criteria for {currentLevel}. You're ready for {nextLevel}!
          </p>
        </div>
      </div>
    );
  };

  /**
   * Render single completed criterion
   */
  const renderCompletedCriterion = (criterion: Criterion) => {
    return (
      <div 
        key={criterion.criteriaId}
        className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xl">✓</span>
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
   * Render completed criteria list
   */
  const renderCompletedList = () => {
    if (completedCriteria.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-green-600">✓</span> Completed Criteria ({completedCriteria.length})
        </h3>
        <div className="space-y-3">
          {completedCriteria.map((criterion) => renderCompletedCriterion(criterion))}
        </div>
      </div>
    );
  };

  /**
   * Render single pending criterion
   */
  const renderPendingCriterion = (criterion: Criterion) => {
    return (
      <div 
        key={criterion.criteriaId}
        className="bg-white rounded-lg shadow p-5 border-l-4 border-gray-300"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-xl">○</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">{criterion.name}</h4>
            {criterion.description && (
              <p className="text-gray-600 text-sm">{criterion.description}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render pending criteria list
   */
  const renderPendingList = () => {
    if (pendingCriteria.length === 0) return null;

    return (
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-yellow-600">○</span> Pending Criteria ({pendingCriteria.length})
        </h3>
        <div className="space-y-3">
          {pendingCriteria.map((criterion) => renderPendingCriterion(criterion))}
        </div>
      </div>
    );
  };

  /**
   * Render next steps card
   */
  const renderNextSteps = () => {
    if (progressPercentage >= 100) return null;

    return (
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Keep Going! 💪</h3>
        <p className="text-gray-700 mb-3">
          Complete the remaining {pendingCriteria.length} criteria to advance to {nextLevel}.
        </p>
        <p className="text-sm text-gray-600">
          Your teacher will mark criteria as complete when you demonstrate mastery.
        </p>
      </div>
    );
  };

  /**
   * Render no criteria state
   */
  const renderNoCriteriaState = () => {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Progress</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <p className="text-blue-800 text-lg">
              No progress criteria available yet. Your teacher will set up criteria for your level soon.
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render main progress page
   */
  const renderProgressPage = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderHeader()}

        <div className="max-w-6xl mx-auto px-6 py-8">
          {renderLevelCard()}
          {renderCompletedList()}
          {renderPendingList()}
          {renderNextSteps()}
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading your progress..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Error Loading Progress"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!progressData || progressData.totalCriteria === 0) {
    return renderNoCriteriaState();
  }


  return renderProgressPage();
}