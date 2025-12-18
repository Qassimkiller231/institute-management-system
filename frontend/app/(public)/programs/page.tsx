'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { programsAPI } from '@/lib/api';
import { getToken } from '@/lib/authStorage';
import { saveLoginRedirect } from '@/lib/redirectStorage';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorMessage } from '@/components/common/Messages';

// ========================================
// TYPES
// ========================================

interface Program {
  id: string;
  name: string;
  code: string;
  description: string;
  minAge: number;
  maxAge: number;
  isActive: boolean;
}

export default function BrowseProgramsPage() {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const router = useRouter();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Initial Load
   * Fetch all available programs when component mounts
   */
  useEffect(() => {
    loadPrograms();
  }, []);

  // ========================================
  // DATA LOADING FUNCTIONS
  // ========================================
  
  /**
   * Load all available programs from the API
   */
  const loadPrograms = async () => {
    try {
      const result = await programsAPI.getAll();
      // console.log('Programs API response:', result); // Debug
      
      if (result.success) {
        setPrograms(result.data || []);
      } else {
        setError(result.message || 'Failed to load programs');
      }
    } catch (err: any) {
      // console.error('Programs fetch error:', err); // Debug
      setError(`Network error: ${err.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // HANDLERS
  // ========================================
  
  /**
   * Handle Take Placement Test action
   * Routes to test if logged in, otherwise to registration
   */
  const handleTakePlacementTest = () => {
    if (typeof window !== 'undefined') {
      const token = getToken();
      
      if (token) {
        // Already logged in, go straight to test
        router.push('/take-test');
      } else {
        // Not logged in, store redirect intent and go to register
        saveLoginRedirect('/take-test');
        router.push('/register');
      }
    }
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================
  
  /**
   * Individual program card
   */
  const renderProgramCard = (program: Program) => {
    return (
      <div
        key={program.id}
        className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition"
      >
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
            {program.code}
          </span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {program.name}
        </h2>
        
        <p className="text-gray-700 mb-4 leading-relaxed">
          {program.description || 'English language program designed for your success'}
        </p>
        
        <div className="flex items-center text-gray-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium">Ages {program.minAge} - {program.maxAge}</span>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            Levels: A1, A2, B1, B2
          </p>
        </div>
      </div>
    );
  };

  /**
   * Programs grid section
   */
  const renderProgramsGrid = () => {
    if (programs.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No programs available at the moment</p>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {programs.map((program) => renderProgramCard(program))}
      </div>
    );
  };

  /**
   * Individual info card for features
   */
  const renderInfoCard = (info: { icon: string; title: string; description: string }) => {
    return (
      <div className="bg-white rounded-lg p-6 text-center shadow-md">
        <div className="text-blue-600 text-4xl mb-3">{info.icon}</div>
        <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
        <p className="text-gray-600 text-sm">{info.description}</p>
      </div>
    );
  };

  /**
   * Info section with features
   */
  const renderInfoSection = () => {
    const features = [
      {
        icon: '📚',
        title: 'Quality Learning',
        description: 'Expert teachers and proven curriculum',
      },
      {
        icon: '⏱️',
        title: 'Flexible Schedule',
        description: 'Multiple time slots to fit your life',
      },
      {
        icon: '🎯',
        title: 'Track Progress',
        description: 'Regular assessments and feedback',
      },
    ];

    return (
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div key={index}>
            {renderInfoCard(feature)}
          </div>
        ))}
      </div>
    );
  };

  /**
   * Call-to-action section
   */
  const renderCTASection = () => {
    return (
      <div className="bg-blue-600 rounded-lg shadow-xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl mb-6 text-blue-100">
          Take our placement test to find your perfect level
        </p>
        <button
          onClick={handleTakePlacementTest}
          className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg"
        >
          Take Placement Test →
        </button>
      </div>
    );
  };

  /**
   * Page header
   */
  const renderHeader = () => {
    return (
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our English Programs
        </h1>
        <p className="text-xl text-gray-700">
          Choose the right program for your English learning journey
        </p>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN (State Logic)
  // ========================================
  
  if (loading) {
    return <LoadingState message="Loading Programs..." submessage="Please wait" />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {renderHeader()}
        <ErrorMessage message={error} />
        {renderProgramsGrid()}
        {renderCTASection()}
        {renderInfoSection()}
      </div>
    </div>
  );
}