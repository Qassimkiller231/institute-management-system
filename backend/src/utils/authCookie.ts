import type { Response } from 'express';
import { isProduction } from '../config/env';

/**
 * Name of the session cookie. Must match what the Next.js middleware reads
 * (frontend/middleware.ts looks up `authToken`).
 */
export const AUTH_COOKIE = 'authToken';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Set the JWT as an httpOnly cookie. JS can't read it, so XSS can't exfiltrate
 * the session even if it gets into the page. The browser sends it on every
 * cross-site fetch to the backend as long as the frontend uses
 * `credentials: 'include'` and the deployment shares an eTLD+1 (e.g. the
 * frontend on `app.example.com` and the API on `api.example.com`).
 */
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction, // requires HTTPS in production; localhost is exempt
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  });
};

/** Clear the session cookie (used on logout). */
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
};
