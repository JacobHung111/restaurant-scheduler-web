// src/components/UnavailabilityForm.tsx
import React, { useState } from "react";
import type { StaffMember, Unavailability, ShiftTime } from "../types";
import { DAYS_OF_WEEK } from "../config";

interface UnavailabilityFormProps {
  staffList: StaffMember[];
  onAddUnavailability: (newUnavData: Unavailability) => void;
}

const UNAVAILABLE_SHIFT_OPTIONS: ShiftTime[] = [
  { start: "11:00", end: "16:00" },
  { start: "16:00", end: "21:00" },
  { start: "00:00", end: "23:59" },
];
const UNAVAILABLE_SHIFT_LABELS: { [key: string]: string } = {
  "11:00-16:00": "11:00 - 16:00",
  "16:00-21:00": "16:00 - 21:00",
  "00:00-23:59": "All Day",
};

function UnavailabilityForm({
  staffList,
  onAddUnavailability,
}: UnavailabilityFormProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedShifts, setSelectedShifts] = useState<ShiftTime[]>([]);

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
      alert("Please select staff, day, and at least one unavailable shift.");
      return;
    }
    const isAllDaySelected = selectedShifts.some(
      (s) => s.start === "00:00" && s.end === "23:59"
    );
    const finalShifts = isAllDaySelected
      ? [{ start: "00:00", end: "23:59" }]
      : selectedShifts;
    const newUnavData: Unavailability = {
      employeeId: selectedStaffId,
      dayOfWeek: selectedDay,
      shifts: finalShifts,
    };
    onAddUnavailability(newUnavData);
    setSelectedStaffId("");
    setSelectedDay("");
    setSelectedShifts([]);
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Staff:
          </label>
          <select
            id="unav-staff-select-form"
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          >
            <option value="" disabled>
              -- Select Staff --
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
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Day:
          </label>
          <select
            id="unav-day-select-form"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
          >
            <option value="" disabled>
              -- Select Day --
            </option>
            {DAYS_OF_WEEK.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* Shift Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Unavailable Shifts:
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {UNAVAILABLE_SHIFT_OPTIONS.map((shiftOpt) => {
              const shiftValue = `${shiftOpt.start}-${shiftOpt.end}`;
              const shiftLabel =
                UNAVAILABLE_SHIFT_LABELS[shiftValue] || shiftValue;
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
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor={`unav-${shiftValue}-form`}
                    className="ml-2 block text-sm text-gray-900"
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
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Add Unavailability
          </button>
        </div>
      </form>
    </div>
  );
}
export default UnavailabilityForm;
