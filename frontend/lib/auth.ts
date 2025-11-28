/**
 * Auth Helper Functions
 * Manage authentication tokens and state in localStorage
 */

// Store auth token
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    // Also set as cookie for middleware access
    document.cookie = `authToken=${token}; path=/; max-age=86400`; // 24 hours
  }
};

// Get auth token
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Remove auth token (logout)
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('studentId');
    localStorage.removeItem('testSessionId');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('parentId');
    localStorage.removeItem('user');
    // Clear cookie
    document.cookie = 'authToken=; path=/; max-age=0';
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Get user info from token (decode JWT)
export const getUserFromToken = (): any | null => {
  const token = getToken();
  if (!token) return null;

  try {
    // Decode JWT token (payload is the middle part)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get user role from token
export const getUserRole = (): string | null => {
  const user = getUserFromToken();
  return user?.role || null;
};

// Check if token is expired
export const isTokenExpired = (): boolean => {
  const user = getUserFromToken();
  if (!user || !user.exp) return true;

  // Check if token expiration time has passed
  const currentTime = Date.now() / 1000; // Convert to seconds
  return user.exp < currentTime;
};

// Get teacher ID
export const getTeacherId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.teacherId || localStorage.getItem('teacherId') || null;
};

// Get student ID
export const getStudentId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.studentId || localStorage.getItem('studentId') || null;
};

// Get parent ID
export const getParentId = (): string | null => {
  if (typeof window === 'undefined') return null;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.parentId || localStorage.getItem('parentId') || null;
};

// Get user ID
export const getUserId = (): string | null => {
  const user = getUserFromToken();
  return user?.userId || null;
};

// Check role helpers
export const isTeacher = (): boolean => {
  const role = getUserRole();
  return role === 'TEACHER';
};

export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'ADMIN';
};

export const isStudent = (): boolean => {
  const role = getUserRole();
  return role === 'STUDENT';
};

export const isParent = (): boolean => {
  const role = getUserRole();
  return role === 'PARENT';
};

// Redirect to login
export const redirectToLogin = (router: any): void => {
  removeToken();
  router.push('/login');
};

// Redirect based on user role
export const redirectByRole = (router: any, role?: string): void => {
  const userRole = role || getUserRole();
  
  switch (userRole) {
    case 'ADMIN':
      router.push('/admin');
      break;
    case 'TEACHER':
      router.push('/teacher');
      break;
    case 'STUDENT':
      router.push('/student');
      break;
    case 'PARENT':
      router.push('/parent');
      break;
    default:
      router.push('/login');
  }
};

// Logout and redirect to login
export const logout = (): void => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// API fetch helper with automatic token
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Add authorization token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};