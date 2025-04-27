// src/components/ScheduleDisplay.tsx
import type { Schedule, StaffMember } from "../types";
import { DAYS_OF_WEEK, SHIFTS } from "../config";
import { timeToMinutes, minutesToTime } from "../utils";

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  staffList: StaffMember[];
}

interface ProcessedSchedule {
  [day: string]: {
    [employeeId: string]: {
      shiftText: string;
      role: string;
    }[];
  };
}

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

// --- ScheduleDisplay Component ---
function ScheduleDisplay({ schedule, staffList }: ScheduleDisplayProps) {
  const processedSchedule = processScheduleForTable(schedule, staffList);
  const sortedStaff = [...staffList].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (!schedule || Object.keys(schedule).length === 0) {
    const message =
      schedule === null
        ? "No schedule generated yet..."
        : "Schedule generated, but no shifts assigned...";
    return <p className="text-center text-gray-500 italic mt-6">{message}</p>; // Added margin-top
  }

  return (
    <div className="schedule-table-container overflow-x-auto mt-4 pb-4 rounded-lg border border-gray-300 shadow">
      {" "}
      {/* Added rounded-lg, border, shadow */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-300 sticky left-0 bg-gray-100 z-10"
            >
              {" "}
              {/* Bold, slightly darker text */}
              Staff / Day
            </th>
            {DAYS_OF_WEEK.map((day) => (
              <th
                key={day}
                scope="col"
                className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-l border-gray-200"
              >
                {" "}
                {/* Bold header */}
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedStaff.map((staff, staffIndex) => {
            const rowBgClass = staffIndex % 2 === 0 ? "bg-white" : "bg-gray-50";
            return (
              <tr key={staff.id} className={rowBgClass}>
                <td
                  className={`px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300 sticky left-0 z-10 ${rowBgClass}`}
                >
                  {" "}
                  {/* Use dynamic class */}
                  {staff.name}
                </td>
                {/* Render schedule data for each day */}
                {DAYS_OF_WEEK.map((day) => {
                  const assignments = processedSchedule[day]?.[staff.id];
                  return (
                    <td
                      key={`${staff.id}-${day}`}
                      className="px-3 py-2 text-xs border-l border-gray-200 align-top min-w-[100px]"
                    >
                      {assignments && assignments.length > 0 ? (
                        <div className="flex flex-col space-y-0.5">
                          {assignments.map((a, index) => (
                            // Display role alongside time
                            <span
                              key={index}
                              className="block whitespace-nowrap"
                            >
                              {`${a.shiftText} `}
                              <span className="text-gray-500">({a.role})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleDisplay;
