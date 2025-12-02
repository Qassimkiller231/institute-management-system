// components/teacher/TeacherSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeacherSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', href: '/teacher' },
    { icon: '📋', label: 'Attendance', href: '/teacher/attendance' },
    { icon: '📈', label: 'Progress', href: '/teacher/progress' },
    { icon: '👥', label: 'Groups', href: '/teacher/groups' },
    { icon: '📅', label: 'Schedule', href: '/teacher/schedule' },
    { icon: '🗣️', label: 'Speaking Tests', href: '/teacher/speaking-tests' }, // NEW
    { icon: '📚', label: 'Materials', href: '/teacher/materials' },
    { icon: '📊', label: 'Reports', href: '/teacher/reports' },
    { icon: '📢', label: 'Announcements', href: '/teacher/announcements' },
    { icon: '👤', label: 'Profile', href: '/teacher/profile' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-indigo-900 text-white">
      <div className="p-6">
        <h2 className="text-2xl font-bold">Function Institute</h2>
        <p className="text-indigo-300 text-sm">Teacher Portal</p>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/teacher' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'bg-indigo-800 border-r-4 border-yellow-400 font-semibold'
                  : 'hover:bg-indigo-800'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}