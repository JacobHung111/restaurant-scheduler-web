// src/config.ts

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Define the logical shift types
export const SHIFT_TYPES = ["HALF_DAY_AM", "HALF_DAY_PM"] as const;
export type ShiftType = (typeof SHIFT_TYPES)[number];

// Labels for displaying shift types in the UI
export const SHIFT_TYPE_LABELS: Record<ShiftType, string> = {
  HALF_DAY_AM: "AM Shift",
  HALF_DAY_PM: "PM Shift",
};

// All possible roles
export const ALL_ROLES = ["Cashier", "Server", "Expo"];

// Backend API base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
