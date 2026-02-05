/**
 * OpenClaw Mobile - Logger Utility
 * 
 * Wraps console methods to allow easy disable in production.
 * Set __DEV__ to false for production builds (Expo handles this automatically).
 */

const isDev = __DEV__;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log('[OpenClaw]', ...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info('[OpenClaw]', ...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[OpenClaw]', ...args);
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, but could send to error tracking in production
    if (isDev) {
      console.error('[OpenClaw]', ...args);
    } else {
      // TODO: Send to Sentry or similar in production
      // For now, still log errors
      console.error('[OpenClaw]', ...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[OpenClaw]', ...args);
  },
};

export default logger;
