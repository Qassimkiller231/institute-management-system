import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ✅ FIX: Check cookie instead of localStorage (middleware is server-side)
  const token = request.cookies.get('authToken')?.value;
  
  const { pathname } = request.nextUrl;

  // Public routes - allow access without token
  if (pathname === '/login' || pathname === '/verify-otp' || pathname === '/') {
    // If already logged in and trying to access login, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/verify-otp')) {
      // Decode token to get role (simplified check)
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
        const role = decoded.role;
        
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'TEACHER') return NextResponse.redirect(new URL('/teacher', request.url));
        if (role === 'STUDENT') return NextResponse.redirect(new URL('/student', request.url));
      } catch (error) {
        // If token is invalid, continue to login
        console.error('Token decode error:', error);
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require token
  if (pathname.startsWith('/admin') || 
      pathname.startsWith('/teacher') || 
      pathname.startsWith('/student') ||
      pathname.startsWith('/parent')) {
    
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Optional: Verify role matches route
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
      const role = decoded.role;

      // Check if user's role matches the route they're trying to access
      if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/teacher') && role !== 'TEACHER') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/student') && role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (pathname.startsWith('/parent') && role !== 'PARENT') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/verify-otp',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/parent/:path*'
  ],
};