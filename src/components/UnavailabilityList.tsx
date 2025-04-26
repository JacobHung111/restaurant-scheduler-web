// src/components/UnavailabilityList.tsx
import React from "react";
import type { Unavailability, StaffMember } from "../types";
import { timeToMinutes } from "../utils";
import { DAYS_OF_WEEK } from "../config";

interface UnavailabilityListProps {
  unavailabilityList: Unavailability[];
  staffList: StaffMember[];
  // Function to delete all entries for a specific employee on a specific day
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
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        Unavailability List:
      </h3>
      {sortedGroupedItems.length === 0 ? (
        <p className="text-sm text-gray-500">No unavailability added yet.</p>
      ) : (
        <ul className="space-y-2">
          {sortedGroupedItems.map((item) => {
            const shiftTexts = item.shifts
              .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)) // Sort shifts within the day
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
                className="flex items-center justify-between p-3 bg-gray-100 rounded border border-gray-200"
              >
                <span className="text-sm text-gray-800">
                  <strong className="font-medium">{staffName}</strong> -{" "}
                  {item.dayOfWeek}
                  <br />
                  <span className="text-xs text-gray-600">
                    Unavailable: {shiftTexts}
                  </span>
                </span>
                <button
                  onClick={() =>
                    onDeleteUnavailability(item.employeeId, item.dayOfWeek)
                  }
                  className="ml-4 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                >
                  Delete Day Entry
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default UnavailabilityList;
