// src/stores/useStaffStore.ts
import { create } from 'zustand';
import type { StaffMember } from '../types';
import { ALL_ROLES as DEFAULT_ROLES } from '../config';
import { logger } from '../utils/logger';

interface OperationResult {
  success: boolean;
  error?: string;
}

interface StaffState {
  // State
  staffList: StaffMember[];
  definedRoles: string[];
  staffIdCounter: number;

  // Actions
  addStaff: (newStaffData: Omit<StaffMember, 'id'>) => OperationResult;
  deleteStaff: (idToDelete: string) => OperationResult;
  updateStaff: (id: string, updates: Partial<Omit<StaffMember, 'id'>>) => void;
  reorderStaff: (reorderedList: StaffMember[]) => void;
  setStaffList: (staffList: StaffMember[]) => void;
  
  // Role management
  addRole: (roleName: string) => OperationResult;
  deleteRole: (roleName: string) => OperationResult;
  setDefinedRoles: (roles: string[]) => void;
  
  // Utilities
  getStaffById: (id: string) => StaffMember | undefined;
  getStaffPriority: () => string[];
}

export const useStaffStore = create<StaffState>()((set, get) => ({
  // Initial state
  staffList: [],
  definedRoles: [...DEFAULT_ROLES],
  staffIdCounter: 0,

  // Staff management actions
  addStaff: (newStaffData) => {
    const { definedRoles, staffIdCounter } = get();
    
    // Validation
    if (!newStaffData.assignedRolesInPriority || newStaffData.assignedRolesInPriority.length === 0) {
      return { success: false, error: 'Please select and prioritize at least one role for the staff.' };
    }
    
    const invalidRoles = newStaffData.assignedRolesInPriority.filter(
      (r) => !definedRoles.includes(r)
    );
    if (invalidRoles.length > 0) {
      return { success: false, error: `The following selected roles are not valid: ${invalidRoles.join(', ')}` };
    }

    const generatedId = `S${Date.now()}-${staffIdCounter}`;
    const staffToAdd: StaffMember = { ...newStaffData, id: generatedId };
    
    set((state) => ({
      staffList: [...state.staffList, staffToAdd],
      staffIdCounter: state.staffIdCounter + 1,
    }));
    
    logger.log('Staff added:', staffToAdd);
    return { success: true };
  },

  deleteStaff: (idToDelete) => {
    const { staffList } = get();
    const staffToDelete = staffList.find((s) => s.id === idToDelete);
    
    if (!staffToDelete) {
      return { success: false, error: 'Staff member not found.' };
    }

    set((state) => ({
      staffList: state.staffList.filter((staff) => staff.id !== idToDelete),
    }));
    
    logger.log(`Staff deleted: ${staffToDelete.name} (ID: ${idToDelete})`);
    return { success: true };
  },

  updateStaff: (id, updates) => {
    set((state) => ({
      staffList: state.staffList.map((staff) =>
        staff.id === id ? { ...staff, ...updates } : staff
      ),
    }));
  },

  reorderStaff: (reorderedList) => {
    set({ staffList: reorderedList });
    logger.log('Staff list reordered (priority changed).');
  },

  setStaffList: (staffList) => {
    set({ staffList });
  },

  // Role management actions
  addRole: (roleName) => {
    if (!roleName.trim()) {
      return { success: false, error: 'Role name cannot be empty.' };
    }
    
    const { definedRoles } = get();
    if (definedRoles.includes(roleName)) {
      return { success: false, error: 'Role already exists.' };
    }
    
    set((state) => ({
      definedRoles: [...state.definedRoles, roleName],
    }));
    
    logger.log('Role added:', roleName);
    return { success: true };
  },

  deleteRole: (roleName) => {
    const { staffList } = get();
    
    // Check if any staff has this role
    const staffWithRole = staffList.some((staff) =>
      staff.assignedRolesInPriority.includes(roleName)
    );
    
    if (staffWithRole) {
      return { success: false, error: `Cannot delete role "${roleName}" because it is assigned to staff members.` };
    }
    
    set((state) => ({
      definedRoles: state.definedRoles.filter((role) => role !== roleName),
    }));
    
    logger.log('Role deleted:', roleName);
    return { success: true };
  },

  setDefinedRoles: (roles) => {
    set({ definedRoles: roles });
  },

  // Utility functions
  getStaffById: (id) => {
    const { staffList } = get();
    return staffList.find((staff) => staff.id === id);
  },

  getStaffPriority: () => {
    const { staffList } = get();
    return staffList.map((staff) => staff.id);
  },
}));