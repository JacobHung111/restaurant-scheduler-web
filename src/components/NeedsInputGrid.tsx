// src/components/NeedsInputGrid.tsx
import React from "react";
import type { WeeklyNeeds } from "../types";
import { DAYS_OF_WEEK, SHIFT_KEYS, ALL_ROLES } from "../config";

interface NeedsInputGridProps {
  weeklyNeeds: WeeklyNeeds;
  onNeedsChange: (
    day: string,
    shiftKey: string,
    role: string,
    count: number
  ) => void;
}

function NeedsInputGrid({ weeklyNeeds, onNeedsChange }: NeedsInputGridProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parts = name.split("_");
    if (parts.length === 4) {
      const [, day, shiftKey, role] = parts;
      const count = parseInt(value) || 0;
      onNeedsChange(day, shiftKey, role, count >= 0 ? count : 0);
    }
  };

  return (
    <div className="needs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          className="day-needs border border-gray-200 p-4 rounded-lg bg-white shadow-sm"
        >
          <h4 className="text-md font-semibold mb-3 border-b border-gray-200 pb-2 text-center text-gray-800">
            {day}
          </h4>
          <div className="space-y-4">
            {SHIFT_KEYS.map((shiftKey) => (
              <div key={shiftKey} className="shift-needs">
                <h5 className="text-sm font-medium mb-2 text-center text-gray-500">
                  {shiftKey}
                </h5>
                <div className="space-y-1">
                  {ALL_ROLES.map((role) => {
                    const inputId = `needs_${day}_${shiftKey}_${role}`;
                    const currentValue =
                      weeklyNeeds[day]?.[shiftKey]?.[role] ?? 0;
                    return (
                      <div
                        key={role}
                        className="flex items-center justify-center mb-1"
                      >
                        <label
                          htmlFor={inputId}
                          className="text-xs text-gray-600 w-14 text-right mr-2 shrink-0"
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
  );
}

export default NeedsInputGrid;
