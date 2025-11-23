'use client';

import { useRouter } from 'next/navigation';

export default function SessionExpiredPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Session Expired</h1>
        <p className="text-gray-700 mb-6 text-lg">Your session has expired. Please login again.</p>
        
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}