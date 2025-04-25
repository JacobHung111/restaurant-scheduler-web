// src/types.ts
export interface ShiftTime {
    start: string; // "HH:MM"
    end: string;   // "HH:MM"
  }
  
  export interface StaffMember {
    id: string;
    name: string;
    roles: string[]; // Array of role strings (e.g., "Server", "Cashier")
    minHoursPerWeek?: number | null; // Optional number or null
    maxHoursPerWeek?: number | null; // Optional number or null
  }
  
  export interface Unavailability {
    employeeId: string;
    dayOfWeek: string; // e.g., "Monday"
    shifts: ShiftTime[]; // Array of unavailable shift times
  }
  
  export interface WeeklyNeeds {
    // Key is DayOfWeek (string)
    [day: string]: {
      // Key is ShiftKey (string, e.g., "11:00-16:00")
      [shift: string]: {
        // Key is Role (string)
        [role: string]: number; // Value is the needed count
      };
    };
  }
  
  export interface Schedule {
      // Key is DayOfWeek (string)
    [day: string]: {
       // Key is ShiftKey (string)
      [shift: string]: {
         // Key is Role (string)
        [role: string]: string[]; // Value is an array of assigned employee IDs
      };
    };
  }
  

  export interface ApiResponse {
      success: boolean;
      schedule?: Schedule | null; // Schedule might be null or empty object on success/failure
      warnings?: string[];
      calculationTimeMs?: number;
      message?: string; // For error messages
  }
