/**
 * Auth Helper Functions
 * Manage authentication tokens and state in localStorage
 */

// Store auth token
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
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
    localStorage.removeItem('studentId'); // Clear student ID too
    localStorage.removeItem('testSessionId'); // Clear test session too
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

// Logout and redirect to login
export const logout = (): void => {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};