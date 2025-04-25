// src/components/ScheduleDisplay.tsx
import React from 'react';
import type { Schedule, StaffMember } from '../types';
import { DAYS_OF_WEEK, SHIFT_KEYS, ALL_ROLES } from '../config';

interface ScheduleDisplayProps {
  schedule: Schedule | null;
  staffList: StaffMember[];
}

function ScheduleDisplay({ schedule, staffList }: ScheduleDisplayProps) {

  const getStaffName = (id: string): string => {
    const staff = staffList.find(s => s.id === id);
    return staff ? staff.name : `ID: ${id}`;
  };

  // Handle null or empty schedule
  if (!schedule || Object.keys(schedule).length === 0) {
    return <p className="text-center text-gray-500 italic mt-4">No schedule data to display.</p>;
  }

  return (
    <div className="schedule-display mt-4 space-y-6">
      {DAYS_OF_WEEK.map(day => {
        const daySchedule = schedule[day];
        if (!daySchedule || Object.keys(daySchedule).length === 0) {
          return (
            <div key={day} className="schedule-day p-4 bg-white rounded shadow">
              <h3 className="text-lg font-semibold mb-2 text-blue-700">{day}</h3>
              <p className="text-sm text-gray-500">No shifts scheduled.</p>
            </div>
          );
        }

        return (
          <div key={day} className="schedule-day p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3 border-b border-gray-200 pb-2 text-indigo-700">{day}</h3>
            <div className="space-y-3">
              {SHIFT_KEYS.map(shiftKey => {
                const shiftSchedule = daySchedule[shiftKey];
                if (!shiftSchedule || Object.keys(shiftSchedule).length === 0) {
                  return null;
                }

                return (
                  <div key={shiftKey} className="schedule-shift pl-4 border-l-4 border-green-500">
                    <h4 className="text-md font-medium mb-1 text-gray-800">{shiftKey}</h4>
                    <ul className="list-none pl-2 space-y-1">
                      {ALL_ROLES.map(role => {
                        const assignedStaffIds = shiftSchedule[role];
                        if (!assignedStaffIds || assignedStaffIds.length === 0) {
                          return null;
                        }
                        return (
                          <li key={role} className="text-sm">
                            <strong className="font-semibold text-gray-600 w-20 inline-block">{role}:</strong>
                            <span className="text-gray-700">
                              {assignedStaffIds.map(id => getStaffName(id)).join(', ')}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ScheduleDisplay;