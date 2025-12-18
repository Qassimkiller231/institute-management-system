/**
 * Redirect Storage Utilities
 * For managing temporary redirect paths during authentication flows
 */

const STORAGE_KEYS = {
    LOGIN_REDIRECT: 'loginRedirect',
} as const;

// ========================================
// LOGIN REDIRECT (after login/register)
// ========================================

/**
 * Save the path to redirect to after successful login
 */
export const saveLoginRedirect = (path: string): void => {
    sessionStorage.setItem(STORAGE_KEYS.LOGIN_REDIRECT, path);
};

/**
 * Get the saved login redirect path
 */
export const getLoginRedirect = (): string | null => {
    return sessionStorage.getItem(STORAGE_KEYS.LOGIN_REDIRECT);
};

/**
 * Remove the saved login redirect path
 */
export const removeLoginRedirect = (): void => {
    sessionStorage.removeItem(STORAGE_KEYS.LOGIN_REDIRECT);
};
