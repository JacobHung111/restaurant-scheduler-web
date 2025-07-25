// src/utils/logger.ts

/**
 * Simple logger utility for development and production environments
 */
export const logger = {
  log: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    if (import.meta.env.MODE === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};