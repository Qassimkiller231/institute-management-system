import dotenv from 'dotenv';

// Load .env once, here, before anything reads process.env
dotenv.config();

/**
 * Fail-secure environment access.
 * `required()` throws on startup if a security-critical variable is missing,
 * instead of falling back to an insecure hardcoded default.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Refusing to start with an insecure default.`
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== '' ? value : fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: optional('PORT', '3001'),

  // Security-critical: no fallback. App must not run without these.
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),

  // CORS allow-list. Comma-separated list of allowed origins.
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:3000'),

  // Google Sign-In (staff). Optional: if unset, the /auth/google endpoint
  // returns an error but the rest of the app runs normally.
  GOOGLE_CLIENT_ID: optional('GOOGLE_CLIENT_ID', ''),
};

export const isProduction = env.NODE_ENV === 'production';
