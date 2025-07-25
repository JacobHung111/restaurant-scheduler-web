// src/utils.ts
import type { ShiftDefinitions } from "./types";
import { logger } from "./utils/logger";

// Helper to convert HH:MM to minutes since midnight
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) {
    return -1; // Return -1 for invalid format
  }
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      logger.warn(`timeToMinutes received out-of-range time: ${timeStr}`);
      return -1; // Indicate error
    }
    return hours * 60 + minutes;
  } catch {
    logger.warn(`timeToMinutes failed to parse time: ${timeStr}`);
    return -1; // Indicate error
  }
}

// Helper to convert minutes since midnight back to HH:MM format
export function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes >= 24 * 60 || isNaN(minutes)) return "??:??";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Helper to calculate hours between two HH:MM times
export const calculateHours = (start: string, end: string): number => {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  if (startMin < 0 || endMin < 0) return 0;
  if (endMin <= startMin) return 0;
  return parseFloat(((endMin - startMin) / 60).toFixed(2));
};

// Helper to validate HH:MM format
export const isValidTimeFormat = (time: string): boolean => {
  return /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/.test(time);
};

// Helper function to create the initial shift definitions object
export const createInitialShiftDefinitions = (): ShiftDefinitions => {
  const amStart = "11:00";
  const amEnd = "16:00";
  const pmStart = "16:00";
  const pmEnd = "21:00";
  const amHours = calculateHours(amStart, amEnd);
  const pmHours = calculateHours(pmStart, pmEnd);

  return {
    HALF_DAY_AM: { start: amStart, end: amEnd, hours: amHours },
    HALF_DAY_PM: { start: pmStart, end: pmEnd, hours: pmHours },
    // Automatically derive FULL_DAY from AM and PM parts
    FULL_DAY: {
      start: amStart,
      end: pmEnd,
      hours: parseFloat((amHours + pmHours).toFixed(2)),
    },
  };
};
