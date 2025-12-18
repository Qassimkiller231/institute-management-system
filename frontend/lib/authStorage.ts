/**
 * Auth Storage Utilities - CONSOLIDATED
 * Complete authentication storage management with cookie support
 * Merged from auth.ts and authStorage.ts
 */

// ========================================
// STORAGE KEYS
// ========================================

const STORAGE_KEYS = {
    TOKEN: 'token',
    OTP_EMAIL: 'otpEmail',
    STUDENT_ID: 'studentId',
    TEACHER_ID: 'teacherId',
    PARENT_ID: 'parentId',
    USER_ROLE: 'userRole',
} as const;

// ========================================
// TOKEN MANAGEMENT (with cookie support)
// ========================================

export const saveToken = (token: string): void => {
    if (typeof window === 'undefined') return;

    // Validate token before saving
    if (!token || token === '00' || token === 'null' || token === 'undefined') {
        // console.error('Invalid token attempted to be saved:', token);
        return;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    // CRITICAL: Also save as cookie (for middleware/SSR)
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // Validate token is not corrupted
    if (token === '00' || token === 'null' || token === 'undefined' || !token) {
        return null;
    }

    return token;
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEYS.TOKEN);

    // CRITICAL: Also clear the cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
};

// ========================================
// OTP EMAIL (for verification flow)
// ========================================

export const saveOtpEmail = (email: string): void => {
    sessionStorage.setItem(STORAGE_KEYS.OTP_EMAIL, email);
};

export const getOtpEmail = (): string | null => {
    return sessionStorage.getItem(STORAGE_KEYS.OTP_EMAIL);
};

export const removeOtpEmail = (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.OTP_EMAIL);
};

// ========================================
// USER IDS (with validation)
// ========================================

export const saveStudentId = (id: string): void => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ID, id);
};

export const getStudentId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(STORAGE_KEYS.STUDENT_ID);
    return (id && id !== '00' && id !== 'null') ? id : null;
};

export const saveTeacherId = (id: string): void => {
    localStorage.setItem(STORAGE_KEYS.TEACHER_ID, id);
};

export const getTeacherId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(STORAGE_KEYS.TEACHER_ID);
    return (id && id !== '00' && id !== 'null') ? id : null;
};

export const saveParentId = (id: string): void => {
    localStorage.setItem(STORAGE_KEYS.PARENT_ID, id);
};

export const getParentId = (): string | null => {
    if (typeof window === 'undefined') return null;
    const id = localStorage.getItem(STORAGE_KEYS.PARENT_ID);
    return (id && id !== '00' && id !== 'null') ? id : null;
};

// ========================================
// USER ROLE
// ========================================

export const saveUserRole = (role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN'): void => {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
};

export const getUserRole = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
};

// ========================================
// ROLE CHECKING HELPERS
// ========================================

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

// ========================================
// LOGOUT & CLEAR FUNCTIONS
// ========================================

/**
 * Clear all auth data (targeted clear)
 */
export const clearAuthData = (): void => {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);
    localStorage.removeItem(STORAGE_KEYS.TEACHER_ID);
    localStorage.removeItem(STORAGE_KEYS.PARENT_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_ROLE);

    // Clear sessionStorage
    sessionStorage.removeItem(STORAGE_KEYS.OTP_EMAIL);

    // CRITICAL: Clear the authToken cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
};

/**
 * Clear ALL storage (complete reset)
 * Used for complete reset, e.g., in reset-auth page
 */
export const clearAllAuth = (): void => {
    if (typeof window === 'undefined') return;

    localStorage.clear();
    sessionStorage.clear();

    // CRITICAL: Clear the authToken cookie
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
};

/**
 * Logout and redirect to login
 */
export const logout = (): void => {
    if (typeof window === 'undefined') return;

    // Clear all auth data
    clearAuthData();

    // Redirect to login
    window.location.href = '/login';
};

// ========================================
// AUTH STATUS CHECK
// ========================================

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return token !== null && token !== '';
};

export const getAuthStatus = () => {
    return {
        isAuthenticated: isAuthenticated(),
        token: getToken(),
        role: getUserRole(),
        studentId: getStudentId(),
        teacherId: getTeacherId(),
        parentId: getParentId(),
    };
};

// ========================================
// VALIDATION & RECOVERY
// ========================================

/**
 * Validate auth data and clear if corrupted
 * Returns true if auth is valid, false if corrupted/cleared
 */
export const validateAndRecoverAuth = (): boolean => {
    if (typeof window === 'undefined') return false;

    const token = getToken();
    const role = getUserRole();

    // Check for corruption patterns
    const isCorrupted =
        token === '00' ||
        role === '00' ||
        token === 'null' ||
        role === 'null' ||
        (!token && role); // Has role but no token

    if (isCorrupted) {
        // console.warn('Corrupted auth data detected, clearing...');
        clearAuthData();
        return false;
    }

    return !!token;
};

// ========================================
// COMPATIBILITY ALIASES (for old auth.ts imports)
// ========================================

// These allow gradual migration from old auth.ts
export const setToken = saveToken;  // Old name -> new name
export const getUser = () => null;  // Deprecated - use getUserRole() instead
