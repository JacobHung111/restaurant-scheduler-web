// src/components/NeedsInputGrid.tsx
import React from "react";
import type { WeeklyNeeds } from "../types";
import {
  DAYS_OF_WEEK,
  SHIFT_TYPES,
  SHIFT_TYPE_LABELS,
  ALL_ROLES,
} from "../config";
import type { ShiftType } from "../config";

interface NeedsInputGridProps {
  weeklyNeeds: WeeklyNeeds;
  onNeedsChange: (
    day: string,
    shiftType: ShiftType,
    role: string,
    count: number
  ) => void;
}

function NeedsInputGrid({ weeklyNeeds, onNeedsChange }: NeedsInputGridProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parts = name.split("_");
    if (parts.length === 4) {
      const [, day, shiftType, role] = parts;
      const count = parseInt(value) || 0;
      onNeedsChange(day, shiftType as ShiftType, role, count >= 0 ? count : 0);
    }
  };

  return (
    <div className="needs-grid-container overflow-x-auto lg:overflow-x-visible -mx-4 px-4 pb-4 lg:mx-0 lg:px-0 lg:pb-0">
      <div className="flex space-x-4 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-5 lg:space-x-0">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="day-needs border border-gray-200 p-4 rounded-lg bg-white shadow hover:shadow-md transition-shadow duration-200 w-72 sm:w-80 flex-shrink-0 lg:w-auto"
          >
            {" "}
            {/* Mobile: Fixed width + flex-shrink-0, Desktop: auto width */}
            <h4 className="text-md font-semibold mb-3 text-center text-indigo-700 border-b border-gray-200 pb-2">
              {day}
            </h4>
            <div className="space-y-4">
              {SHIFT_TYPES.map((shiftType) => (
                <div key={shiftType} className="shift-needs">
                  <h5 className="text-sm font-medium mb-2 text-gray-600">
                    {SHIFT_TYPE_LABELS[shiftType]}
                  </h5>
                  <div className="space-y-1.5">
                    {ALL_ROLES.map((role) => {
                      const inputId = `needs_${day}_${shiftType}_${role}`;
                      const currentValue =
                        weeklyNeeds[day]?.[shiftType]?.[role] ?? 0;
                      return (
                        <div
                          key={role}
                          className="flex items-center justify-between space-x-2"
                        >
                          <label
                            htmlFor={inputId}
                            className="text-xs text-gray-600 w-16 text-right mr-1 shrink-0"
                          >
                            {role}:
                          </label>
                          <input
                            type="number"
                            id={inputId}
                            name={inputId}
                            value={currentValue}
                            onChange={handleInputChange}
                            min="0"
                            step="1"
                            className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center transition duration-150 ease-in-out hover:border-gray-400"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NeedsInputGrid;
