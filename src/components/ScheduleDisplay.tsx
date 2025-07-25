// src/components/ScheduleDisplay.tsx
import type { Schedule, StaffMember, ShiftDefinitions } from "../types";
import { DAYS_OF_WEEK, ShiftType } from "../config";

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  warnings: string[];
  staffList: StaffMember[];
  shiftDefinitions: ShiftDefinitions;
}

// --- ScheduleDisplay Component ---
function ScheduleDisplay({
  schedule,
  warnings,
  staffList,
  shiftDefinitions,
}: ScheduleDisplayProps) {
  const sortedStaff = [...staffList].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (!schedule || Object.keys(schedule).length === 0) {
    const message =
      schedule === null
        ? "No schedule generated yet or an error occurred."
        : "Schedule generated, but no shifts were assigned.";
    return <p className="text-center text-gray-500 italic mt-6">{message}</p>;
  }

  // Define the order for shift types in the cell
  const shiftTypeOrder: Record<ShiftType, number> = {
    HALF_DAY_AM: 1,
    HALF_DAY_PM: 2,
  };

  return (
    <div className="mt-4">
      {/* Warnings Display */}
      {warnings && warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h3>
          <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="schedule-table-container overflow-x-auto pb-4 rounded-lg border border-gray-300 shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-300 sticky left-0 bg-gray-100 z-10"
            >
              Staff / Day
            </th>
            {DAYS_OF_WEEK.map((day) => (
              <th
                key={day}
                scope="col"
                className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap border-l border-gray-200"
              >
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
                  {staff.name}
                </td>
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = schedule[day];
                  // Collect assignments directly using logical shift types
                  const assignments: { shiftType: ShiftType; role: string }[] =
                    [];
                  if (daySchedule) {
                    // Iterate through the logical shift types from config
                    for (const shiftType of Object.keys(
                      daySchedule
                    ) as ShiftType[]) {
                      if (daySchedule[shiftType]) {
                        for (const role in daySchedule[shiftType]) {
                          if (
                            daySchedule[shiftType][role]?.includes(staff.id)
                          ) {
                            assignments.push({ shiftType: shiftType, role });
                          }
                        }
                      }
                    }
                  }
                  // Sort assignments by the predefined order
                  assignments.sort(
                    (a, b) =>
                      (shiftTypeOrder[a.shiftType] || 99) -
                      (shiftTypeOrder[b.shiftType] || 99)
                  );

                  return (
                    <td
                      key={`${staff.id}-${day}`}
                      className="px-3 py-2 text-xs border-l border-gray-200 align-top min-w-[110px]"
                    >
                      {assignments.length > 0 ? (
                        <div className="flex flex-col space-y-0.5">
                          {assignments.map((a, index) => (
                            <span
                              key={index}
                              className="block whitespace-nowrap"
                            >
                              {shiftDefinitions[a.shiftType]?.start}-
                              {shiftDefinitions[a.shiftType]?.end}{" "}
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
    </div>
  );
}

export default ScheduleDisplay;
