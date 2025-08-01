// src/components/NeedsInputGrid.tsx
import React from "react";
import { useTranslation } from 'react-i18next';
import type { WeeklyNeeds } from "../types";
import { DAYS_OF_WEEK, SHIFT_TYPES } from "../config";
import type { ShiftType } from "../config";
import { logger } from "../utils/logger";

interface NeedsInputGridProps {
  weeklyNeeds: WeeklyNeeds;
  definedRoles: string[];
  onNeedsChange: (
    day: string,
    shiftType: ShiftType,
    role: string,
    count: number
  ) => void;
}

function NeedsInputGrid({
  weeklyNeeds,
  definedRoles,
  onNeedsChange,
}: NeedsInputGridProps) {
  const { t } = useTranslation();
  
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    const day = event.target.dataset.day;
    const shiftType = event.target.dataset.shiftType as ShiftType | undefined;
    const role = event.target.dataset.role;

    if (
      day &&
      shiftType &&
      role &&
      SHIFT_TYPES.includes(shiftType) &&
      definedRoles.includes(role)
    ) {
      let count: number;
      if (value === "") {
        count = 0;
      } else {
        const parsedValue = parseInt(value, 10);
        count = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
      }
      onNeedsChange(day, shiftType, role, count);
    } else {
      logger.error(
        "Missing or invalid data attributes on input:",
        event.target.dataset
      );
    }
  };

  return (
    <div className="needs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
      {DAYS_OF_WEEK.map((day) => (
        <div
          key={day}
          className="day-needs border border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-lg bg-white dark:bg-slate-800 shadow hover:shadow-md transition-shadow duration-200 w-full"
        >
          <h4 className="text-sm sm:text-md font-semibold mb-2 sm:mb-3 text-center text-indigo-700 dark:text-blue-400 border-b border-gray-200 dark:border-slate-600 pb-2">
            {t(`days.${day.toLowerCase()}`)}
          </h4>
          <div className="space-y-3 sm:space-y-4">
            {SHIFT_TYPES.map((shiftType) => (
              <div key={shiftType} className="shift-needs">
                <h5 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-gray-600 dark:text-slate-300">
                  {t(`shifts.${shiftType}`)}
                </h5>
                <div className="space-y-1 sm:space-y-1.5">
                  {definedRoles.map((role) => {
                    const inputId = `needs_${day}_${shiftType}_${role}`;
                    const currentValue =
                      weeklyNeeds[day]?.[shiftType]?.[role] ?? 0;
                    return (
                      <div
                        key={role}
                        className="flex items-center justify-between space-x-1 sm:space-x-2"
                      >
                        <label
                          htmlFor={inputId}
                          className="text-xs text-gray-600 dark:text-slate-300 flex-1 text-left truncate"
                          title={role}
                        >
                          {role}:
                        </label>
                        <input
                          type="number"
                          id={inputId}
                          value={currentValue}
                          onChange={handleInputChange}
                          min="0"
                          step="1"
                          placeholder="0"
                          data-day={day}
                          data-shift-type={shiftType}
                          data-role={role}
                          className="w-12 sm:w-16 px-1 sm:px-2 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-blue-400 focus:border-indigo-500 dark:focus:border-blue-400 text-xs sm:text-sm text-center transition duration-150 ease-in-out hover:border-gray-400 dark:hover:border-slate-500"
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
