// app/teacher/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isTeacher } from '@/lib/authStorage';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    
    if (!isTeacher()) {
      // Redirect non-teachers
      router.push('/');
      return;
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TeacherSidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}