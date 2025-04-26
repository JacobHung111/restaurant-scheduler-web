// src/components/ScheduleDisplay.tsx
import React from "react";
import type { Schedule, StaffMember } from "../types";
import { DAYS_OF_WEEK, SHIFTS, ALL_ROLES } from "../config";
import { timeToMinutes, minutesToTime } from "../utils"; // Assume these are in utils

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  staffList: StaffMember[];
}

// Processed schedule data structure remains the same:
// { day: { employeeId: [{ shiftText, role }, ...] } }
interface ProcessedSchedule {
  [day: string]: {
    [employeeId: string]: {
      shiftText: string;
      role: string;
    }[];
  };
}

// processScheduleForTable function remains the same as before
function processScheduleForTable(
  schedule: Schedule | null,
  staffList: StaffMember[]
): ProcessedSchedule {
  const processed: ProcessedSchedule = {};
  if (!schedule) return processed;
  const staffMap = new Map(staffList.map((s) => [s.id, s]));
  for (const day of DAYS_OF_WEEK) {
    processed[day] = {};
    if (!schedule[day]) continue;
    const assignmentsByStaff: {
      [empId: string]: { start: number; end: number; role: string }[];
    } = {};
    for (const shiftKey in schedule[day]) {
      const shiftInfo = SHIFTS[shiftKey as keyof typeof SHIFTS];
      if (!shiftInfo) continue;
      const shiftStartMin = timeToMinutes(shiftInfo.start);
      const shiftEndMin = timeToMinutes(shiftInfo.end);
      for (const role in schedule[day][shiftKey]) {
        const employeeIds = schedule[day][shiftKey][role];
        if (Array.isArray(employeeIds)) {
          for (const empId of employeeIds) {
            if (!staffMap.has(empId)) continue;
            if (!assignmentsByStaff[empId]) assignmentsByStaff[empId] = [];
            assignmentsByStaff[empId].push({
              start: shiftStartMin,
              end: shiftEndMin,
              role,
            });
          }
        }
      }
    }
    for (const empId in assignmentsByStaff) {
      const assignments = assignmentsByStaff[empId];
      assignments.sort((a, b) => a.start - b.start);
      const shiftsForTable: { shiftText: string; role: string }[] = [];
      let currentShift: { start: number; end: number; role: string } | null =
        null;
      for (const assignment of assignments) {
        if (currentShift === null) {
          currentShift = { ...assignment };
        } else if (
          assignment.start === currentShift.end &&
          assignment.role === currentShift.role
        ) {
          currentShift.end = assignment.end;
        } else {
          const startStr = minutesToTime(currentShift.start);
          const endStr = minutesToTime(currentShift.end);
          shiftsForTable.push({
            shiftText: `${startStr}-${endStr}`,
            role: currentShift.role,
          });
          currentShift = { ...assignment };
        }
      }
      if (currentShift !== null) {
        const startStr = minutesToTime(currentShift.start);
        const endStr = minutesToTime(currentShift.end);
        shiftsForTable.push({
          shiftText: `${startStr}-${endStr}`,
          role: currentShift.role,
        });
      }
      processed[day][empId] = shiftsForTable;
    }
  }
  return processed;
}

// --- ScheduleDisplay Component (Reversed Rows/Columns) ---
function ScheduleDisplay({ schedule, staffList }: ScheduleDisplayProps) {
  const processedSchedule = processScheduleForTable(schedule, staffList);

  // Sort staff list by name for consistent row ordering
  const sortedStaff = [...staffList].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (!schedule || Object.keys(schedule).length === 0) {
    const message =
      schedule === null
        ? "No schedule generated yet..."
        : "Schedule generated, but no shifts assigned...";
    return <p className="text-center text-gray-500 italic mt-4">{message}</p>;
  }

  return (
    // Container with horizontal scroll might still be needed if days have lots of text
    <div className="schedule-table-container overflow-x-auto mt-4 pb-4">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {/* Sticky header for Staff Name column */}
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-300 sticky left-0 bg-gray-100 z-10"
            >
              Staff / Day
            </th>
            {/* Render Days of Week as column headers */}
            {DAYS_OF_WEEK.map((day) => (
              <th
                key={day}
                scope="col"
                className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-l border-gray-200"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Iterate through sorted staff for rows */}
          {sortedStaff.map((staff, staffIndex) => (
            // Apply alternating row background color
            <tr
              key={staff.id}
              className={staffIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {/* Sticky cell for Staff Name */}
              <td
                className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-800 border-r border-gray-300 sticky left-0 z-10"
                style={{
                  backgroundColor: staffIndex % 2 === 0 ? "white" : "#F9FAFB",
                }}
              >
                {staff.name}
              </td>
              {/* Render schedule data for each day */}
              {DAYS_OF_WEEK.map((day) => {
                // Get the processed assignments for this specific staff member on this day
                const assignments = processedSchedule[day]?.[staff.id];
                return (
                  <td
                    key={`${staff.id}-${day}`}
                    className="px-4 py-2 whitespace-nowrap text-xs text-gray-700 border-l border-gray-200 align-top"
                  >
                    {assignments && assignments.length > 0 ? (
                      // Display shifts, maybe stack vertically if multiple
                      <div className="flex flex-col space-y-1">
                        {assignments.map((a, index) => (
                          <span
                            key={index}
                            className="block"
                          >{`${a.shiftText}`}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span> // Indicate empty slot
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleDisplay;
