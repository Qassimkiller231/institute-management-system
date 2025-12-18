/**
 * Test Session Storage Utilities
 * For managing temporary test session data during guest flow
 */

const STORAGE_KEYS = {
    TEST_SESSION_ID: 'testSessionId',
} as const;

// ========================================
// TEST SESSION ID (for guest booking flow)
// ========================================

export const saveTestSessionId = (sessionId: string): void => {
    localStorage.setItem(STORAGE_KEYS.TEST_SESSION_ID, sessionId);
};

export const getTestSessionId = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.TEST_SESSION_ID);
};

export const removeTestSessionId = (): void => {
    localStorage.removeItem(STORAGE_KEYS.TEST_SESSION_ID);
};
