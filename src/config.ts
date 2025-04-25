// src/config.ts
export const ALL_ROLES = ["Cashier", "Server", "Expo"];
export const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SHIFT_KEYS = ["11:00-16:00", "16:00-21:00"];

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';