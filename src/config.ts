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
export const SHIFTS: {
  [key: string]: { start: string; end: string; hours: number };
} = {
  "11:00-16:00": { start: "11:00", end: "16:00", hours: 5.0 },
  "16:00-21:00": { start: "16:00", end: "21:00", hours: 5.0 },
};
export const SHIFT_KEYS = Object.keys(SHIFTS);
export const ALL_ROLES = ["Cashier", "Server", "Expo"];

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"; // Make sure port matches your Flask app
