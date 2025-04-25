// src/components/NeedsInputGrid.tsx
import React from 'react';
import type { WeeklyNeeds } from '../types';
// *** Corrected Import: Use SHIFT_KEYS instead of the non-existent constant ***
import { DAYS_OF_WEEK, SHIFT_KEYS, ALL_ROLES } from '../config';

interface NeedsInputGridProps {
  weeklyNeeds: WeeklyNeeds;
  onNeedsChange: (day: string, shiftKey: string, role: string, count: number) => void;
}

function NeedsInputGrid({ weeklyNeeds, onNeedsChange }: NeedsInputGridProps) {

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const parts = name.split('_');
    if (parts.length === 4) {
      const [, day, shiftKey, role] = parts;
      const count = parseInt(value) || 0;
      onNeedsChange(day, shiftKey, role, count >= 0 ? count : 0);
    }
  };

  return (
    <div className="needs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {DAYS_OF_WEEK.map(day => (
        <div key={day} className="day-needs border border-gray-200 p-3 rounded bg-white shadow-sm">
          <h4 className="text-md font-semibold mb-3 border-b pb-1 text-gray-800">{day}</h4>
          {/* *** Corrected Usage: Iterate over SHIFT_KEYS *** */}
          {SHIFT_KEYS.map(shiftKey => (
            <div key={shiftKey} className="shift-needs mb-3">
              <h5 className="text-sm font-medium mb-1 text-gray-600">{shiftKey}</h5>
              {ALL_ROLES.map(role => {
                const inputId = `needs_${day}_${shiftKey}_${role}`;
                const currentValue = weeklyNeeds[day]?.[shiftKey]?.[role] ?? 0;
                return (
                  <div key={role} className="flex items-center justify-between mb-1">
                    <label htmlFor={inputId} className="text-xs text-gray-700 w-16 text-right mr-2">{role}:</label>
                    <input
                      type="number"
                      id={inputId}
                      name={inputId}
                      value={currentValue}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs text-center"
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default NeedsInputGrid;