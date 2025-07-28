// src/utils/idGenerator.ts

let idCounters: Record<string, number> = {};

/**
 * Generates unique IDs with proper collision prevention
 * Uses crypto.randomUUID when available, falls back to timestamp + counter + random
 */
export const generateId = (prefix: string = ''): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    const uuid = crypto.randomUUID();
    return prefix ? `${prefix}-${uuid}` : uuid;
  }
  
  // Fallback for older environments
  if (!idCounters[prefix]) {
    idCounters[prefix] = 0;
  }
  
  const timestamp = Date.now();
  const counter = ++idCounters[prefix];
  const random = Math.floor(Math.random() * 10000);
  
  return prefix ? `${prefix}-${timestamp}-${counter}-${random}` : `${timestamp}-${counter}-${random}`;
};

/**
 * Generate Staff ID
 */
export const generateStaffId = (): string => generateId('S');

/**
 * Generate Unavailability ID
 */
export const generateUnavailabilityId = (): string => generateId('U');

/**
 * Generate History Record ID
 */
export const generateHistoryId = (): string => generateId('H');

/**
 * Reset counters (useful for testing)
 */
export const resetIdCounters = (): void => {
  idCounters = {};
};