'use client';

import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useState } from 'react';

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: Array<
    | { divider: true; label: string }
    | { icon: string; label: string; path: string }
  > = [
    { icon: '📊', label: 'Dashboard', path: '/parent' },
    { icon: '👶', label: 'My Children', path: '/parent/children' },
    { icon: '📢', label: 'Announcements', path: '/parent/announcements' },
    { icon: '📚', label: 'Materials', path: '/parent/materials' },
    { icon: '💳', label: 'Payments', path: '/parent/payments' },
  ];

  const isActive = (path: string) => {
    if (path === '/parent') {
      return pathname === '/parent';
    }
    return pathname.startsWith(path);
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => !('divider' in item) && isActive(item.path));
    return currentItem && !('divider' in currentItem) ? currentItem.label : 'Parent Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed h-full overflow-y-auto z-10`}>
        {/* Header */}
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

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item, index) => {
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  active
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
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
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

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
