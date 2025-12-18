'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { clearAllAuth } from '@/lib/authStorage';

export default function ResetAuthPage() {
  // ========================================
  // HOOKS
  // ========================================
  const router = useRouter();

  // ========================================
  // EFFECTS
  // ========================================
  
  /**
   * Effect: Clear all authentication data and redirect
   * Runs once on component mount
   */
  useEffect(() => {
    // Clear all authentication data using storage utility
    clearAllAuth();
    
    // console.log('All storage cleared!'); // Debug
    
    // Wait 1 second then redirect to login
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }, []);

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Reset screen with animation and redirect message
   */
  const renderResetScreen = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Resetting Authentication
          </h1>
          <p className="text-gray-600 mb-4">
            Clearing all data and redirecting to login...
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-blue-200 rounded-full w-full">
              <div className="h-2 bg-blue-600 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN
  // ========================================

  return renderResetScreen();
}