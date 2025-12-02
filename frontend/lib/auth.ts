// lib/auth.ts - COMPLETE AUTH LIBRARY
// This is the FINAL version with ALL auth functions needed across the entire app

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    if (!token || token === '00' || token === 'null' || token === 'undefined') {
      console.error('Invalid token attempted to be saved:', token);
      return;
    }
    
    // Save to localStorage (for client-side)
    localStorage.setItem('authToken', token);
    
    // CRITICAL: Also save as cookie (for middleware)
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    
    // Validate token is not corrupted
    if (token === '00' || token === 'null' || token === 'undefined' || !token) {
      return null;
    }
    
    return token;
  }
  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('studentId');
    localStorage.removeItem('teacherId');
    localStorage.removeItem('parentId');
    localStorage.removeItem('role');
    
    // CRITICAL: Also clear the cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
  }
};

// ============================================================================
// LOGOUT
// ============================================================================

export const logout = () => {
  if (typeof window !== 'undefined') {
    // Clear ALL localStorage
    localStorage.clear();
    
    // Clear sessionStorage too
    sessionStorage.clear();
    
    // CRITICAL: Clear the authToken cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    
    // Redirect to login
    window.location.href = '/login';
  }
};

// ============================================================================
// AUTHENTICATION CHECK
// ============================================================================

export const isAuthenticated = (): boolean => {
  const token = getToken();
  const user = getUser();
  
  // Both token and valid user must exist
  return !!token && !!user;
};

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    
    // Check for corrupted data
    if (!userStr || userStr === '00' || userStr === 'null' || userStr === 'undefined') {
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      
      // Validate user object has required fields
      if (!user.id || !user.email || !user.role) {
        console.error('Invalid user object:', user);
        return null;
      }
      
      return user;
    } catch (e) {
      console.error('Failed to parse user data:', e);
      return null;
    }
  }
  return null;
};

export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

// ============================================================================
// ROLE CHECKING HELPERS
// ============================================================================

export const isTeacher = (): boolean => {
  return getUserRole() === 'TEACHER';
};

export const isStudent = (): boolean => {
  return getUserRole() === 'STUDENT';
};

export const isAdmin = (): boolean => {
  return getUserRole() === 'ADMIN';
};

export const isParent = (): boolean => {
  return getUserRole() === 'PARENT';
};

// ============================================================================
// ROLE-SPECIFIC ID GETTERS
// ============================================================================

export const getStudentId = (): string | null => {
  if (typeof window !== 'undefined') {
    const id = localStorage.getItem('studentId');
    return (id && id !== '00' && id !== 'null') ? id : null;
  }
  return null;
};

export const getTeacherId = (): string | null => {
  if (typeof window !== 'undefined') {
    const id = localStorage.getItem('teacherId');
    return (id && id !== '00' && id !== 'null') ? id : null;
  }
  return null;
};

export const getParentId = (): string | null => {
  if (typeof window !== 'undefined') {
    const id = localStorage.getItem('parentId');
    return (id && id !== '00' && id !== 'null') ? id : null;
  }
  return null;
};

// ============================================================================
// VALIDATION & RECOVERY
// ============================================================================

export const validateAndRecoverAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  const studentId = localStorage.getItem('studentId');
  
  // Check for corruption patterns
  const isCorrupted = 
    token === '00' || 
    userStr === '00' || 
    studentId === '00' ||
    token === 'null' ||
    userStr === 'null' ||
    (!token && userStr); // Has user but no token
  
  if (isCorrupted) {
    console.warn('Corrupted auth data detected, clearing...');
    localStorage.clear();
    // CRITICAL: Also clear cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    return false;
  }
  
  // Validate user object
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (!user.id || !user.email || !user.role) {
        console.warn('Invalid user object, clearing...');
        localStorage.clear();
        // CRITICAL: Also clear cookie
        document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        return false;
      }
    } catch (e) {
      console.warn('Failed to parse user, clearing...');
      localStorage.clear();
      // CRITICAL: Also clear cookie
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      return false;
    }
  }
  
  return !!token && !!userStr;
};

// ============================================================================
// NAVIGATION
// ============================================================================

export const redirectByRole = (router: any, role: string) => {
  const roleRoutes: { [key: string]: string } = {
    'ADMIN': '/admin',
    'TEACHER': '/teacher',
    'STUDENT': '/student',
    'PARENT': '/parent'
  };
  
  const route = roleRoutes[role] || '/login';
  router.push(route);
};

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================
// Token: setToken, getToken, removeToken
// Auth: isAuthenticated, logout, validateAndRecoverAuth
// User: getUser, getUserRole
// Roles: isTeacher, isStudent, isAdmin, isParent
// IDs: getStudentId, getTeacherId, getParentId
// Navigation: redirectByRole