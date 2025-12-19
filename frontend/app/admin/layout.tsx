'use client';

import { usePathname, useRouter } from 'next/navigation';
import { logout } from '@/lib/authStorage';
import { useState } from 'react';
import ChatBot from '@/components/chatbot/ChatBot';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: Array<
    | { divider: true; label: string }
    | { icon: string; label: string; path: string; badge?: string }
  > = [
      { icon: '📊', label: 'Dashboard', path: '/admin' },
      {
        icon: '🎓',
        label: 'Students',
        path: '/admin/students',
        badge: 'Management'
      },
      { icon: '👪', label: 'Parents', path: '/admin/parents' },
      { icon: '👨‍🏫', label: 'Teachers', path: '/admin/teachers' },
      { icon: '👥', label: 'Groups', path: '/admin/groups' },
      { icon: '📝', label: 'Enrollments', path: '/admin/enrollments' },
      { icon: '📚', label: 'Materials', path: '/admin/materials' },
      { icon: '📢', label: 'Announcements', path: '/admin/announcements' },
      { icon: '🗓️', label: 'Sessions', path: '/admin/sessions' },
      { icon: '📤', label: 'Bulk Attendance', path: '/admin/attendance/bulk' },

      { divider: true, label: 'Configuration' },
      { icon: '📖', label: 'Programs', path: '/admin/programs' },
      { icon: '📅', label: 'Terms', path: '/admin/terms' },
      { icon: '🎯', label: 'Levels', path: '/admin/levels' },
      { icon: '🏢', label: 'Venues', path: '/admin/venues' },
      { icon: '🚪', label: 'Halls', path: '/admin/halls' },

      { divider: true, label: 'Reports & Analytics' },
      { icon: '📈', label: 'Attendance Reports', path: '/admin/reports/attendance' },
      { icon: '📊', label: 'Progress Reports', path: '/admin/reports/progress' },
      { icon: '💰', label: 'Financial Reports', path: '/admin/reports/financial' },
      { icon: '💳', label: 'Payments', path: '/admin/payments' },
      { icon: '📋', label: 'Payment Plans', path: '/admin/payment-plans' },

      { divider: true, label: 'Testing & Progress' },
      { icon: '🎤', label: 'Speaking Tests', path: '/admin/speaking-tests' },
      { icon: '📋', label: 'Placement Tests', path: '/admin/placement-tests' },
      { icon: '✅', label: 'Progress Criteria', path: '/admin/criteria' },

      { divider: true, label: 'System' },
      { icon: '❓', label: 'FAQs', path: '/admin/faqs' },
      { icon: '🛡️', label: 'Audit Logs', path: '/admin/audit-logs' },
      { icon: '💾', label: 'Backup & Restore', path: '/admin/settings/backup' },
      { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
    ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const getCurrentPageTitle = () => {
    const currentItem = menuItems.find(item => !('divider' in item) && isActive(item.path));
    return currentItem && !('divider' in currentItem) ? currentItem.label : 'Admin Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} fixed h-full overflow-y-auto z-10`}>
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h2 className="font-bold text-lg text-gray-900">Admin Panel</h2>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${active
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
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
      <main className={`flex-1 transition-all duration-300 bg-gray-50 min-h-screen ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-5">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getCurrentPageTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin/notifications" className="text-gray-500 hover:text-blue-600 transition-colors">
                <Bell className="w-5 h-5" />
              </Link>
              <span className="text-sm text-gray-600">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
