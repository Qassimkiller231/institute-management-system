import type { Response } from 'express';
import { env, isProduction } from '../config/env';

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
// When COOKIE_DOMAIN is set (e.g. ".the-function.online"), the browser stores
// the cookie against the parent domain so both `the-function.online` and
// `api.the-function.online` see it — that lets Next middleware on the frontend
// host read the same `authToken` cookie the backend sets.
const cookieDomain = env.COOKIE_DOMAIN || undefined;

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE, token, {
    ...baseOptions,
    maxAge: SEVEN_DAYS_MS,
  });
};

/** Clear the session cookie (used on logout). Must mirror the set options. */
export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE, baseOptions);
};
