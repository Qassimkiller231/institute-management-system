'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearAuthData } from '@/lib/authStorage';

// ========================================
// TYPES
// ========================================

type MenuItem =
  | { divider: true; label: string }
  | { icon: string; label: string; path: string };

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  // ========================================
  // STATE & HOOKS
  // ========================================
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ========================================
  // CONFIGURATION
  // ========================================

  const menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', path: '/parent' },
    { icon: '👶', label: 'My Children', path: '/parent/children' },
    { icon: '🔔', label: 'Notifications', path: '/parent/notifications' },
    { icon: '📢', label: 'Announcements', path: '/parent/announcements' },
    { icon: '📚', label: 'Materials', path: '/parent/materials' },
    { icon: '💳', label: 'Payments', path: '/parent/payments' },
  ];

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  /**
   * Check if a path is currently active
   */
  const isActive = (path: string): boolean => {
    if (path === '/parent') {
      return pathname === '/parent';
    }
    return pathname.startsWith(path);
  };

  /**
   * Get the title for the current page
   */
  const getCurrentPageTitle = (): string => {
    const currentItem = menuItems.find(item => !('divider' in item) && isActive(item.path));
    return currentItem && !('divider' in currentItem) ? currentItem.label : 'Parent Dashboard';
  };

  // ========================================
  // HANDLERS
  // ========================================

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  // ========================================
  // RENDER FUNCTIONS
  // ========================================

  /**
   * Render sidebar header with toggle
   */
  const renderSidebarHeader = () => {
    return (
      <div className="p-4 border-b flex items-center justify-between">
        {sidebarOpen && (
          <div>
            <h2 className="font-bold text-lg text-gray-900">Parent Portal</h2>
            <p className="text-xs text-gray-500">The Function Institute</p>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>
    );
  };

  /**
   * Render individual menu item
   */
  const renderMenuItem = (item: MenuItem, index: number) => {
    if ('divider' in item) {
      return (
        <div key={index} className="pt-4 pb-2">
          {sidebarOpen && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
              {item.label}
            </p>
          )}
          {!sidebarOpen && <hr className="border-gray-200" />}
        </div>
      );
    }

    const active = isActive(item.path);

    return (
      <button
        key={item.path}
        onClick={() => router.push(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${active
            ? 'bg-blue-50 text-blue-600 font-medium'
            : 'text-gray-700 hover:bg-gray-100'
          }`}
        title={!sidebarOpen ? item.label : ''}
      >
        <span className="text-xl">{item.icon}</span>
        {sidebarOpen && (
          <span className="flex-1 text-left text-sm">{item.label}</span>
        )}
      </button>
    );
  };

  /**
   * Render logout button
   */
  const renderLogoutButton = () => {
    return (
      <div className="p-4 border-t mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <span className="text-xl">🚪</span>
          {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    );
  };

  /**
   * Render entire sidebar
   */
  const renderSidebar = () => {
    return (
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed h-full overflow-y-auto z-10`}>
        {renderSidebarHeader()}

        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </nav>

        {renderLogoutButton()}
      </aside>
    );
  };

  /**
   * Render top header bar
   */
  const renderHeader = () => {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-5">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getCurrentPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Parent</span>
          </div>
        </div>
      </header>
    );
  };

  /**
   * Render main layout structure
   */
  const renderLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {renderSidebar()}

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {renderHeader()}

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    );
  };

  // ========================================
  // MAIN RETURN
  // ========================================

  return renderLayout();
}
