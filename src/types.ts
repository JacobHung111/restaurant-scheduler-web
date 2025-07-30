// src/types.ts

// Basic time definition
export interface ShiftTime {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

// Detailed definition for user-configurable shifts
export interface ShiftDefinition extends ShiftTime {
  hours: number;
}
export interface ShiftDefinitions {
  HALF_DAY_AM: ShiftDefinition;
  HALF_DAY_PM: ShiftDefinition;
  FULL_DAY: ShiftDefinition;
}

// Staff member structure
export interface StaffMember {
  id: string;
  name: string;
  assignedRolesInPriority: string[];
  minHoursPerWeek?: number | null;
  maxHoursPerWeek?: number | null;
}

// Unavailability structure
export interface Unavailability {
  employeeId: string;
  dayOfWeek: string;
  shifts: ('AM' | 'PM')[];
}

// Weekly needs structure
export interface WeeklyNeeds {
  [day: string]: {
    [shiftType: string]: {
      [role: string]: number;
    };
  };
}

// Schedule result structure
export interface Schedule {
  [day: string]: {
    [shiftType: string]: {
      [role: string]: string[];
    };
  };
}

// Structure for the API response from the backend
export interface ApiResponse {
  success: boolean;
  schedule?: Schedule | null;
  warnings?: string[];
  calculationTimeMs?: number;
  message?: string;
}
