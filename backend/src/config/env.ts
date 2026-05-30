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

/**
 * Parse a string env value as a boolean. Defaults to `defaultValue` when unset.
 * Accepts: 'true'/'1'/'yes' (case-insensitive) → true; everything else → false.
 */
function bool(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') return defaultValue;
  const v = value.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
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

  // Resend HTTP API. When set, email goes via HTTPS (works on hosts that
  // block SMTP egress, like Render). When empty, falls back to nodemailer SMTP.
  RESEND_API_KEY: optional('RESEND_API_KEY', ''),

  // Feature toggles. Defaults to ON; flip to false to disable entirely.
  // OTP off → login skips the code check and issues a session straight away.
  // EMAIL off → email service no-ops (returns success without sending).
  OTP_ENABLED: bool('OTP_ENABLED', true),
  EMAIL_ENABLED: bool('EMAIL_ENABLED', true),
};

export const isProduction = env.NODE_ENV === 'production';
