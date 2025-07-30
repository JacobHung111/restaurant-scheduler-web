// src/utils/importValidation.ts
import type { StaffMember, Unavailability, WeeklyNeeds, ShiftDefinitions } from '../types';

// Unified bulk import data types
export interface BulkImportData {
  staffList?: StaffMember[];
  definedRoles?: string[];
  unavailabilityList?: Unavailability[];
  weeklyNeeds?: WeeklyNeeds;
  shiftDefinitions?: ShiftDefinitions;
}

// Data validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: BulkImportData;
}

// Type Guards for data validation
export const isStaffMember = (obj: unknown): obj is StaffMember => {
  if (typeof obj !== 'object' || obj === null) return false;
  const staff = obj as Record<string, unknown>;
  
  return (
    typeof staff.id === 'string' &&
    typeof staff.name === 'string' &&
    Array.isArray(staff.assignedRolesInPriority) &&
    staff.assignedRolesInPriority.every((role: unknown) => typeof role === 'string')
  );
};

export const isUnavailability = (obj: unknown): obj is Unavailability => {
  if (typeof obj !== 'object' || obj === null) return false;
  const unavail = obj as Record<string, unknown>;
  
  return (
    typeof unavail.employeeId === 'string' &&
    typeof unavail.dayOfWeek === 'string' &&
    Array.isArray(unavail.shifts) &&
    unavail.shifts.every((shift: unknown) => 
      typeof shift === 'string' && (shift === 'AM' || shift === 'PM')
    )
  );
};

export const isWeeklyNeeds = (obj: unknown): obj is WeeklyNeeds => {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const needs = obj as Record<string, unknown>;
  return Object.values(needs).every(dayNeeds => {
    if (typeof dayNeeds !== 'object' || dayNeeds === null) return false;
    return Object.values(dayNeeds as Record<string, unknown>).every(shiftNeeds => {
      if (typeof shiftNeeds !== 'object' || shiftNeeds === null) return false;
      return Object.values(shiftNeeds as Record<string, unknown>).every(roleCount => 
        typeof roleCount === 'number' && roleCount >= 0
      );
    });
  });
};

export const isDefinedRoles = (obj: unknown): obj is string[] => {
  return Array.isArray(obj) && obj.every(role => typeof role === 'string' && role.trim().length > 0);
};

export const isShiftDefinitions = (obj: unknown): obj is ShiftDefinitions => {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const shifts = obj as Record<string, unknown>;
  const requiredKeys = ['HALF_DAY_AM', 'HALF_DAY_PM', 'FULL_DAY'];
  
  return requiredKeys.every(key => {
    const shift = shifts[key];
    if (typeof shift !== 'object' || shift === null) return false;
    
    const shiftObj = shift as Record<string, unknown>;
    return (
      typeof shiftObj.start === 'string' &&
      typeof shiftObj.end === 'string' &&
      typeof shiftObj.hours === 'number' &&
      shiftObj.hours > 0
    );
  });
};

// Main validation function
export const validateBulkImportData = (rawData: unknown): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result: BulkImportData = {};

  if (typeof rawData !== 'object' || rawData === null) {
    return {
      isValid: false,
      errors: ['Invalid JSON format: expected an object'],
      warnings: [],
      data: {}
    };
  }

  const data = rawData as Record<string, unknown>;

  // Validate staffList
  if (data.staffList !== undefined) {
    if (!Array.isArray(data.staffList)) {
      errors.push('staffList must be an array');
    } else {
      const validStaff = data.staffList.filter((staff, index) => {
        const isValid = isStaffMember(staff);
        if (!isValid) {
          errors.push(`Invalid staff member at index ${index}`);
        }
        return isValid;
      }) as StaffMember[];
      
      if (validStaff.length > 0) {
        result.staffList = validStaff;
        if (validStaff.length < data.staffList.length) {
          warnings.push(`${data.staffList.length - validStaff.length} invalid staff members were skipped`);
        }
      }
    }
  }

  // Validate definedRoles
  if (data.definedRoles !== undefined) {
    if (isDefinedRoles(data.definedRoles)) {
      result.definedRoles = data.definedRoles;
    } else {
      errors.push('definedRoles must be an array of non-empty strings');
    }
  }

  // Validate unavailabilityList
  if (data.unavailabilityList !== undefined) {
    if (!Array.isArray(data.unavailabilityList)) {
      errors.push('unavailabilityList must be an array');
    } else {
      const validUnavail = data.unavailabilityList.filter((unavail, index) => {
        const isValid = isUnavailability(unavail);
        if (!isValid) {
          errors.push(`Invalid unavailability entry at index ${index}`);
        }
        return isValid;
      }) as Unavailability[];
      
      if (validUnavail.length > 0) {
        result.unavailabilityList = validUnavail;
        if (validUnavail.length < data.unavailabilityList.length) {
          warnings.push(`${data.unavailabilityList.length - validUnavail.length} invalid unavailability entries were skipped`);
        }
      }
    }
  }

  // Validate shiftDefinitions
  if (data.shiftDefinitions !== undefined) {
    if (isShiftDefinitions(data.shiftDefinitions)) {
      result.shiftDefinitions = data.shiftDefinitions;
    } else {
      errors.push('Invalid shiftDefinitions format');
    }
  }

  // Validate weeklyNeeds
  if (data.weeklyNeeds !== undefined) {
    if (isWeeklyNeeds(data.weeklyNeeds)) {
      result.weeklyNeeds = data.weeklyNeeds;
    } else {
      errors.push('Invalid weeklyNeeds format');
    }
  }

  // Check if there's any valid data
  const hasValidData = Boolean(
    result.staffList || 
    result.definedRoles || 
    result.unavailabilityList || 
    result.weeklyNeeds || 
    result.shiftDefinitions
  );
  if (!hasValidData && errors.length === 0) {
    warnings.push('No valid data found to import');
  }

  return {
    isValid: errors.length === 0 && hasValidData,
    errors,
    warnings,
    data: result
  };
};

// Relationship validation: ensure employeeId in unavailability exists in staff
export const validateDataRelationships = (data: BulkImportData): string[] => {
  const warnings: string[] = [];
  
  if (data.staffList && data.unavailabilityList) {
    const staffIds = new Set(data.staffList.map(staff => staff.id));
    const invalidUnavailability = data.unavailabilityList.filter(
      unavail => !staffIds.has(unavail.employeeId)
    );
    
    if (invalidUnavailability.length > 0) {
      warnings.push(
        `${invalidUnavailability.length} unavailability entries reference non-existent staff members`
      );
    }
  }
  
  return warnings;
};