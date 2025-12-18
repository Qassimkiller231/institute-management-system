'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { validateAndRecoverAuth, isAuthenticated } from '@/lib/authStorage';

const PUBLIC_ROUTES = ['/login', '/verify-otp', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }

    // Validate and auto-recover from corruption
    const isValid = validateAndRecoverAuth();
    
    if (!isValid) {
      // Corruption detected and cleared, redirect to login
      console.log('Auth validation failed, redirecting to login');
      router.push('/login');
      return;
    }

    // Double-check authentication
    if (!isAuthenticated()) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
  }, [pathname, router]);

  return <>{children}</>;
}