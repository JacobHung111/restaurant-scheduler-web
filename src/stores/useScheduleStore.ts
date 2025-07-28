// src/stores/useScheduleStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Schedule, WeeklyNeeds, ShiftDefinitions } from '../types';
import { createInitialShiftDefinitions } from '../utils';

interface ScheduleState {
  // State
  schedule: Schedule | null;
  warnings: string[];
  isLoading: boolean;
  weeklyNeeds: WeeklyNeeds;
  shiftDefinitions: ShiftDefinitions;
  shiftPreference: 'PRIORITIZE_FULL_DAYS' | 'PRIORITIZE_HALF_DAYS' | 'NONE';
  
  // UI state (removed isBulkImportModalOpen as we use direct file input now)
  
  // Message modal state
  messageModal: {
    isOpen: boolean;
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    details?: string[];
  };

  // Actions
  setSchedule: (schedule: Schedule | null) => void;
  setGeneratedSchedule: (schedule: Schedule | null) => void; // Alias for consistency
  setWarnings: (warnings: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setWeeklyNeeds: (weeklyNeeds: WeeklyNeeds) => void;
  updateWeeklyNeeds: (day: string, shiftType: string, role: string, count: number) => void;
  setShiftDefinitions: (shiftDefinitions: ShiftDefinitions) => void;
  setShiftPreference: (preference: 'PRIORITIZE_FULL_DAYS' | 'PRIORITIZE_HALF_DAYS' | 'NONE') => void;
  
  // UI actions (removed bulk import modal actions)
  
  // Message modal actions
  showMessage: (type: 'success' | 'warning' | 'error', title: string, message: string, details?: string[]) => void;
  closeMessage: () => void;
  
  // Utilities
  clearSchedule: () => void;
  resetWeeklyNeeds: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  immer((set) => ({
  // Initial state
  schedule: null,
  warnings: [],
  isLoading: false,
  weeklyNeeds: {},
  shiftDefinitions: createInitialShiftDefinitions(),
  shiftPreference: 'PRIORITIZE_FULL_DAYS',
  messageModal: {
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    details: []
  },

  // Schedule management actions
  setSchedule: (schedule) => {
    set({ schedule });
  },

  setGeneratedSchedule: (schedule) => {
    set({ schedule });
  },

  setWarnings: (warnings) => {
    set({ warnings });
  },

  setIsLoading: (isLoading) => {
    set({ isLoading });
  },

  // Weekly needs management
  setWeeklyNeeds: (weeklyNeeds) => {
    set((state) => {
      state.weeklyNeeds = weeklyNeeds;
    });
  },

  updateWeeklyNeeds: (day, shiftType, role, count) => {
    set((state) => {
      if (!state.weeklyNeeds[day]) {
        state.weeklyNeeds[day] = {};
      }
      if (!state.weeklyNeeds[day][shiftType]) {
        state.weeklyNeeds[day][shiftType] = {};
      }
      
      if (count <= 0) {
        delete state.weeklyNeeds[day][shiftType][role];
        
        // Clean up empty objects
        if (Object.keys(state.weeklyNeeds[day][shiftType]).length === 0) {
          delete state.weeklyNeeds[day][shiftType];
        }
        if (Object.keys(state.weeklyNeeds[day]).length === 0) {
          delete state.weeklyNeeds[day];
        }
      } else {
        state.weeklyNeeds[day][shiftType][role] = count;
      }
    });
  },

  // Shift configuration
  setShiftDefinitions: (shiftDefinitions) => {
    set({ shiftDefinitions });
  },

  setShiftPreference: (preference) => {
    set({ shiftPreference: preference });
  },

  // Message modal actions
  showMessage: (type, title, message, details = []) => {
    set({ 
      messageModal: { 
        isOpen: true, 
        type, 
        title, 
        message, 
        details 
      } 
    });
  },

  closeMessage: () => {
    set({ 
      messageModal: { 
        isOpen: false, 
        type: 'success', 
        title: '', 
        message: '', 
        details: [] 
      } 
    });
  },

  // Utility functions
  clearSchedule: () => {
    set({ 
      schedule: null, 
      warnings: [] 
    });
  },

  resetWeeklyNeeds: () => {
    set({ weeklyNeeds: {} });
  },
}))
);