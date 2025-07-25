// src/hooks/useStoreSelectors.ts
import { useShallow } from 'zustand/react/shallow';
import { useStaffStore } from '../stores/useStaffStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useUnavailabilityStore } from '../stores/useUnavailabilityStore';

// Optimized selectors using useShallow to prevent unnecessary re-renders

export const useStaffSelectors = () => {
  return useStaffStore(
    useShallow((state) => ({
      staffList: state.staffList,
      definedRoles: state.definedRoles,
      addStaff: state.addStaff,
      deleteStaff: state.deleteStaff,
      reorderStaff: state.reorderStaff,
      setStaffList: state.setStaffList,
      addRole: state.addRole,
      deleteRole: state.deleteRole,
    }))
  );
};

export const useScheduleSelectors = () => {
  return useScheduleStore(
    useShallow((state) => ({
      schedule: state.schedule,
      warnings: state.warnings,
      isLoading: state.isLoading,
      weeklyNeeds: state.weeklyNeeds,
      shiftDefinitions: state.shiftDefinitions,
      shiftPreference: state.shiftPreference,
      messageModal: state.messageModal,
      setWeeklyNeeds: state.setWeeklyNeeds,
      updateWeeklyNeeds: state.updateWeeklyNeeds,
      setShiftDefinitions: state.setShiftDefinitions,
      setShiftPreference: state.setShiftPreference,
      showMessage: state.showMessage,
      closeMessage: state.closeMessage,
    }))
  );
};

export const useUnavailabilitySelectors = () => {
  return useUnavailabilityStore(
    useShallow((state) => ({
      unavailabilityList: state.unavailabilityList,
      setUnavailabilityList: state.setUnavailabilityList,
      addUnavailability: state.addUnavailability,
      deleteUnavailability: state.deleteUnavailability,
      deleteAllUnavailabilityForStaff: state.deleteAllUnavailabilityForStaff,
    }))
  );
};