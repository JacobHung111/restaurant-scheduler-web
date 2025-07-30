// src/stores/useUnavailabilityStore.ts
import { create } from 'zustand';
import type { Unavailability } from '../types';
import { logger } from '../utils/logger';

interface OperationResult {
  success: boolean;
  error?: string;
}

interface UnavailabilityState {
  // State
  unavailabilityList: Unavailability[];

  // Actions
  setUnavailabilityList: (unavailabilityList: Unavailability[]) => void;
  addUnavailability: (unavailability: Unavailability) => OperationResult;
  deleteUnavailability: (employeeId: string, dayOfWeek: string) => void;
  deleteAllUnavailabilityForStaff: (employeeId: string) => void;
  updateUnavailability: (
    employeeId: string, 
    dayOfWeek: string, 
    shiftIndex: number, 
    newShift: 'AM' | 'PM'
  ) => void;

  // Utilities
  getUnavailabilityForStaff: (employeeId: string) => Unavailability[];
  getUnavailabilityForDay: (employeeId: string, dayOfWeek: string) => Unavailability | undefined;
  hasConflict: (employeeId: string, dayOfWeek: string, newShift: 'AM' | 'PM') => boolean;
}

export const useUnavailabilityStore = create<UnavailabilityState>()((set, get) => ({
  // Initial state
  unavailabilityList: [],

  // Actions
  setUnavailabilityList: (unavailabilityList) => {
    set({ unavailabilityList });
  },

  addUnavailability: (unavailability) => {
    const { unavailabilityList, hasConflict } = get();
    
    // Check for conflicts with each shift in the unavailability
    for (const shift of unavailability.shifts) {
      if (hasConflict(unavailability.employeeId, unavailability.dayOfWeek, shift)) {
        return { success: false, error: 'This unavailability conflicts with an existing entry.' };
      }
    }

    // Find existing unavailability for the same employee and day
    const existingIndex = unavailabilityList.findIndex(
      (unav) => 
        unav.employeeId === unavailability.employeeId && 
        unav.dayOfWeek === unavailability.dayOfWeek
    );

    if (existingIndex >= 0) {
      // Merge shifts with existing unavailability
      set((state) => ({
        unavailabilityList: state.unavailabilityList.map((unav, index) =>
          index === existingIndex
            ? { ...unav, shifts: [...unav.shifts, ...unavailability.shifts] }
            : unav
        ),
      }));
      logger.log('Unavailability merged:', unavailability);
      return { success: true };
    } else {
      // Add new unavailability entry
      set((state) => ({
        unavailabilityList: [...state.unavailabilityList, unavailability],
      }));
      logger.log('Unavailability added:', unavailability);
      return { success: true };
    }
  },

  deleteUnavailability: (employeeId, dayOfWeek) => {
    set((state) => ({
      unavailabilityList: state.unavailabilityList.filter(
        (unav) => !(unav.employeeId === employeeId && unav.dayOfWeek === dayOfWeek)
      ),
    }));
    
    logger.log(`Unavailability deleted for ${employeeId} on ${dayOfWeek}`);
  },

  deleteAllUnavailabilityForStaff: (employeeId) => {
    set((state) => ({
      unavailabilityList: state.unavailabilityList.filter(
        (unav) => unav.employeeId !== employeeId
      ),
    }));
    
    logger.log(`All unavailability deleted for staff ${employeeId}`);
  },

  updateUnavailability: (employeeId, dayOfWeek, shiftIndex, newShift) => {
    set((state) => ({
      unavailabilityList: state.unavailabilityList.map((unav) => {
        if (unav.employeeId === employeeId && unav.dayOfWeek === dayOfWeek) {
          const updatedShifts = [...unav.shifts];
          updatedShifts[shiftIndex] = newShift;
          return { ...unav, shifts: updatedShifts };
        }
        return unav;
      }),
    }));
    
    logger.log(`Unavailability updated for ${employeeId} on ${dayOfWeek}`);
  },

  // Utility functions
  getUnavailabilityForStaff: (employeeId) => {
    const { unavailabilityList } = get();
    return unavailabilityList.filter((unav) => unav.employeeId === employeeId);
  },

  getUnavailabilityForDay: (employeeId, dayOfWeek) => {
    const { unavailabilityList } = get();
    return unavailabilityList.find(
      (unav) => unav.employeeId === employeeId && unav.dayOfWeek === dayOfWeek
    );
  },

  hasConflict: (employeeId, dayOfWeek, newShift) => {
    const { unavailabilityList } = get();
    const existingUnav = unavailabilityList.find(
      (unav) => unav.employeeId === employeeId && unav.dayOfWeek === dayOfWeek
    );
    
    if (!existingUnav) return false;
    
    // Check if the shift type already exists for this employee and day
    return existingUnav.shifts.includes(newShift);
  },
}));