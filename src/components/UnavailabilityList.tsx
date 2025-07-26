// src/components/UnavailabilityList.tsx
import type { Unavailability, StaffMember } from "../types";
import { timeToMinutes } from "../utils";
import { DAYS_OF_WEEK } from "../config";

interface UnavailabilityListProps {
  unavailabilityList: Unavailability[];
  staffList: StaffMember[];
  onDeleteUnavailability: (employeeId: string, dayOfWeek: string) => void;
}

function UnavailabilityList({
  unavailabilityList,
  staffList,
  onDeleteUnavailability,
}: UnavailabilityListProps) {
  // Helper to get staff name from ID
  const getStaffName = (id: string): string => {
    const staff = staffList.find((s) => s.id === id);
    return staff ? staff.name : `Unknown (ID: ${id})`;
  };

  // Group unavailability by employee and day
  const groupedUnavailability: { [key: string]: Unavailability } = {};
  unavailabilityList.forEach((item) => {
    const key = `${item.employeeId}_${item.dayOfWeek}`;
    if (!groupedUnavailability[key]) {
      groupedUnavailability[key] = { ...item, shifts: [] }; // Start with empty shifts for grouping
    }
    // Merge shifts, avoid duplicates
    if (Array.isArray(item.shifts)) {
      item.shifts.forEach((newShift) => {
        if (
          !groupedUnavailability[key].shifts.some(
            (existing) =>
              existing.start === newShift.start && existing.end === newShift.end
          )
        ) {
          groupedUnavailability[key].shifts.push(newShift);
        }
      });
    }
  });

  // Sort grouped items (optional, e.g., by staff name then day)
  const sortedGroupedItems = Object.values(groupedUnavailability).sort(
    (a, b) => {
      const nameA = getStaffName(a.employeeId);
      const nameB = getStaffName(b.employeeId);
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      const dayIndexA = DAYS_OF_WEEK.indexOf(a.dayOfWeek);
      const dayIndexB = DAYS_OF_WEEK.indexOf(b.dayOfWeek);
      return dayIndexA - dayIndexB;
    }
  );

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-slate-600 pt-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-slate-300">
        Unavailability List ({sortedGroupedItems.length}):
      </h3>
      {sortedGroupedItems.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-slate-400 italic">
          No unavailability added yet.
        </p>
      ) : (
        <div className="flow-root">
          <ul role="list" className="space-y-2">
            {sortedGroupedItems.map((item) => {
              const shiftTexts = item.shifts
                .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                .map((s) =>
                  s.start === "00:00" && s.end === "23:59"
                    ? "All Day"
                    : `${s.start}-${s.end}`
                )
                .join(", ");
              const staffName = getStaffName(item.employeeId);
              return (
                <li
                  key={`${item.employeeId}_${item.dayOfWeek}`}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition duration-150 ease-in-out shadow-sm"
                >
                  <span className="text-sm text-gray-800 dark:text-slate-200">
                    <strong className="font-medium text-gray-900 dark:text-slate-100">
                      {staffName}
                    </strong>{" "}
                    - {item.dayOfWeek}
                    <br />
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      Unavailable: {shiftTexts}
                    </span>
                  </span>
                  <button
                    onClick={() =>
                      onDeleteUnavailability(item.employeeId, item.dayOfWeek)
                    }
                    className="ml-4 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded hover:bg-red-200 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 dark:focus:ring-red-400 flex-shrink-0 transition duration-150 ease-in-out"
                    aria-label={`Delete unavailability for ${staffName} on ${item.dayOfWeek}`}
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UnavailabilityList;
