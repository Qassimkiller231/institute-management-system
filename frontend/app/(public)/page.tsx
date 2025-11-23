'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleTakePlacementTest = () => {
    // Check if user is already logged in
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Already logged in, go straight to test
        router.push('/take-test');
      } else {
        // Not logged in, ask: new user or existing?
        // For now, default to register (new user flow)
        // TODO: Could add a modal asking "New or returning student?"
        sessionStorage.setItem('loginRedirect', '/take-test');
        router.push('/register');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
            Master English at{' '}
            <span className="text-blue-600">The Function Institute</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Quality English language education for all ages. Join hundreds of students 
            improving their English skills with expert teachers and proven methods.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => router.push('/programs')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              See All Programs →
            </button>
            
            <button
              onClick={handleTakePlacementTest}
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-lg"
            >
              Take Placement Test
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">250+</div>
              <div className="text-gray-600 font-medium">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Expert Teachers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <div className="text-gray-600 font-medium">Modern Venues</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Programs Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Our Programs
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* English Multiverse */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-blue-500 transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🎓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              English Multiverse
            </h3>
            <p className="text-gray-600 mb-4">
              For ages 11-17. A comprehensive English program designed specifically 
              for teenagers with engaging content and interactive learning.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Ages 11-17 • Levels A1-B2
            </div>
          </div>

          {/* English Unlimited */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-blue-500 transition">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🌟</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              English Unlimited
            </h3>
            <p className="text-gray-600 mb-4">
              For ages 18+. Professional English program for adults focusing on 
              practical communication skills and career advancement.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Ages 18+ • Levels A1-B2
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/programs')}
            className="inline-flex items-center text-blue-600 font-semibold text-lg hover:text-blue-700 transition"
          >
            View All Programs & Details
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Why Choose Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Teachers</h3>
              <p className="text-gray-600">
                Learn from qualified native and bilingual teachers with years of experience
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Methods</h3>
              <p className="text-gray-600">
                Structured curriculum following international standards and best practices
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible Schedule</h3>
              <p className="text-gray-600">
                Multiple time slots and venues to fit your busy lifestyle
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Take our free placement test to find your perfect level and begin your English journey today
          </p>
          <button
            onClick={handleTakePlacementTest}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-xl"
          >
            Take Free Placement Test →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">The Function Institute</h3>
              <p className="text-gray-400">
                Quality English education in Bahrain since 2020
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Our Venues</h3>
              <p className="text-gray-400 mb-2">📍 Country Mall</p>
              <p className="text-gray-400">📍 Riyadat Mall</p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/programs')}
                  className="block text-gray-400 hover:text-white transition"
                >
                  Programs
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="block text-gray-400 hover:text-white transition"
                >
                  Placement Test
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="block text-gray-400 hover:text-white transition"
                >
                  Student Login
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 The Function Institute. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}