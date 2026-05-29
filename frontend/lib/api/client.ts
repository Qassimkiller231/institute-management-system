import { clearAuthData, getUserRole } from '@/lib/authStorage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
// Origin without the /api suffix — for static assets served from the backend
// (e.g. /uploads/...). Derived so prod just needs NEXT_PUBLIC_API_URL set.
const STATIC_URL = API_URL.replace(/\/api\/?$/, '');

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  /** Request body. Plain objects are JSON-encoded; FormData is sent as-is. */
  body?: unknown;
  /** Attach the Authorization header (default: true). */
  auth?: boolean;
  /** Throw on non-2xx responses (default: true). Set false to inspect `success` yourself. */
  throwOnError?: boolean;
}

/** Redirect to re-login when the session is no longer valid (expired / role changed). */
function handleUnauthorized() {
  if (typeof window === 'undefined' || !getUserRole()) return;
  const p = window.location.pathname;
  if (p.startsWith('/login') || p.startsWith('/verify-otp') || p.startsWith('/session-expired')) return;
  clearAuthData();
  window.location.href = '/session-expired';
}

/**
 * Central HTTP client for the API. One place for: base URL, auth header,
 * JSON encoding/decoding, FormData handling, 401 → re-login, and errors.
 */
export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, auth = true, throwOnError = true, headers: customHeaders, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers: Record<string, string> = { ...(customHeaders as Record<string, string>) };

  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  // Auth is now cookie-based: the backend sets an httpOnly cookie on login,
  // and the browser sends it automatically when `credentials: 'include'` is
  // set. No Bearer header — so even if XSS reads localStorage, the stolen
  // value can't authenticate.
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: auth ? 'include' : 'omit',
    headers,
    body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) handleUnauthorized();

  if (throwOnError && !res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/**
 * Legacy header helper kept for the few raw-fetch holdouts (blob downloads,
 * status-branching). Auth now travels via the httpOnly cookie, so the caller
 * must add `credentials: 'include'` to the fetch — the `includeAuth` flag is
 * accepted only for backwards compatibility and no longer adds a header.
 */
export const getHeaders = (_includeAuth = false): Record<string, string> => {
  return { 'Content-Type': 'application/json' };
};

export { API_URL, STATIC_URL };
