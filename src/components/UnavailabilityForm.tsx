// src/components/UnavailabilityForm.tsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import type { StaffMember, Unavailability, ShiftTime } from "../types";
import { DAYS_OF_WEEK } from "../config";
import { useScheduleStore } from "../stores/useScheduleStore";
import { useShallow } from 'zustand/react/shallow';

interface UnavailabilityFormProps {
  staffList: StaffMember[];
  onAddUnavailability: (newUnavData: Unavailability) => void;
}
function UnavailabilityForm({
  staffList,
  onAddUnavailability,
}: UnavailabilityFormProps) {
  const { t } = useTranslation();
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedShifts, setSelectedShifts] = useState<ShiftTime[]>([]);
  
  const { shiftDefinitions, showMessage } = useScheduleStore(
    useShallow((state) => ({
      shiftDefinitions: state.shiftDefinitions,
      showMessage: state.showMessage,
    }))
  );

  // Generate shift options from current shift definitions - only AM/PM, no full day
  const getUnavailableShiftOptions = (): ShiftTime[] => [
    { start: shiftDefinitions.HALF_DAY_AM.start, end: shiftDefinitions.HALF_DAY_AM.end },
    { start: shiftDefinitions.HALF_DAY_PM.start, end: shiftDefinitions.HALF_DAY_PM.end },
  ];

  const getUnavailableShiftLabel = (shift: ShiftTime): string => {
    return `${shift.start} - ${shift.end}`;
  };

  const handleShiftChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const [start, end] = value.split("-");
    if (!start || !end) return;
    const shiftObj = { start, end };
    setSelectedShifts((prevShifts) =>
      checked
        ? [...prevShifts, shiftObj]
        : prevShifts.filter((s) => !(s.start === start && s.end === end))
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStaffId || !selectedDay || selectedShifts.length === 0) {
      showMessage(
        'warning',
        t('unavailability.incompleteInformation'),
        t('unavailability.pleaseSelectAll')
      );
      return;
    }
    const finalShifts = selectedShifts;
    const newUnavData: Unavailability = {
      employeeId: selectedStaffId,
      dayOfWeek: selectedDay,
      shifts: finalShifts,
    };
    onAddUnavailability(newUnavData);
    // setSelectedStaffId("");
    // setSelectedDay("");
    // setSelectedShifts([]);
    const form = event.target as HTMLFormElement;
    form
      .querySelectorAll('input[type="checkbox"]')
      .forEach((cb) => ((cb as HTMLInputElement).checked = false));
    form.querySelectorAll("select").forEach((sel) => (sel.selectedIndex = 0));
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Staff Selection */}
        <div>
          <label
            htmlFor="unav-staff-select-form"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            {t('unavailability.selectStaff')}
          </label>
          <select
            id="unav-staff-select-form"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm bg-white"
          >
            <option value="" disabled>
              {t('unavailability.selectStaffOption')}
            </option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name} ({staff.id})
              </option>
            ))}
          </select>
        </div>

        {/* Day Selection */}
        <div>
          <label
            htmlFor="unav-day-select-form"
            className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1"
          >
            {t('unavailability.selectDay')}
          </label>
          <select
            id="unav-day-select-form"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-indigo-500 dark:focus:border-blue-400 focus:ring-indigo-500 dark:focus:ring-blue-400 sm:text-sm bg-white"
          >
            <option value="" disabled>
              {t('unavailability.selectDayOption')}
            </option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {t(`days.${day.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t('unavailability.selectUnavailableShifts')}
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {getUnavailableShiftOptions().map((shiftOpt) => {
              const shiftValue = `${shiftOpt.start}-${shiftOpt.end}`;
              const shiftLabel = getUnavailableShiftLabel(shiftOpt);
              return (
                <div key={shiftValue} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`unav-${shiftValue}-form`}
                    name="unav-shift-form"
                    value={shiftValue}
                    checked={selectedShifts.some(
                      (s) =>
                        s.start === shiftOpt.start && s.end === shiftOpt.end
                    )}
                    onChange={handleShiftChange}
                    className="h-4 w-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 dark:text-blue-500 focus:ring-indigo-500 dark:focus:ring-blue-400 dark:bg-slate-700"
                  />
                  <label
                    htmlFor={`unav-${shiftValue}-form`}
                    className="ml-2 block text-sm text-gray-900 dark:text-slate-200"
                  >
                    {shiftLabel}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 dark:bg-blue-600 hover:bg-indigo-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-400 transition duration-150 ease-in-out"
          >
            {t('unavailability.addUnavailability')}
          </button>
        </div>
      </form>
    </div>
  );
}
export default UnavailabilityForm;
