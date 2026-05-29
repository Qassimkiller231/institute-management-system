import { isProduction } from '../config/env';

/**
 * Minimal logger that silences info/debug noise in production while keeping
 * errors and warnings visible. New code should call `logger.*` instead of
 * `console.*`. Existing `console.log` calls are also silenced in production
 * by `silenceConsoleInProduction()` in src/index.ts so the migration can
 * happen incrementally without spamming prod logs in the meantime.
 */
export const logger = {
  info: (...args: unknown[]) => {
    if (!isProduction) console.log(...args);
  },
  debug: (...args: unknown[]) => {
    if (!isProduction) console.debug(...args);
  },
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};

/**
 * Replace `console.log` and `console.debug` with no-ops in production. Keeps
 * `console.error` and `console.warn` so real problems still surface. Run this
 * once at startup, before any other module logs.
 */
export const silenceConsoleInProduction = (): void => {
  if (!isProduction) return;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const noop = (): void => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
};
