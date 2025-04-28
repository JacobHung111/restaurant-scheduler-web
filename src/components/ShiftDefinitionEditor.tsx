// src/components/ShiftDefinitionEditor.tsx
import { useState, useEffect, useCallback } from "react";
import type { ShiftDefinitions } from "../types";
import { timeToMinutes } from "../utils";

interface ShiftDefinitionEditorProps {
  initialDefinitions: ShiftDefinitions;
  onShiftDefinitionsChange: (newDefinitions: ShiftDefinitions) => void;
}

// Helper to calculate hours between two HH:MM times
const calculateHours = (start: string, end: string): number => {
  const startMin = timeToMinutes(start);
  const endMin = timeToMinutes(end);
  if (endMin <= startMin) return 0;
  return (endMin - startMin) / 60;
};

const isValidTimeFormat = (time: string): boolean => {
  return /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/.test(time);
};

function ShiftDefinitionEditor({
  initialDefinitions,
  onShiftDefinitionsChange,
}: ShiftDefinitionEditorProps) {
  // Local state to manage input values
  const [amStart, setAmStart] = useState(initialDefinitions.HALF_DAY_AM.start);
  const [amEnd, setAmEnd] = useState(initialDefinitions.HALF_DAY_AM.end);
  const [pmStart, setPmStart] = useState(initialDefinitions.HALF_DAY_PM.start);
  const [pmEnd, setPmEnd] = useState(initialDefinitions.HALF_DAY_PM.end);

  // Derived state for validation messages
  const [validationError, setValidationError] = useState<string | null>(null);

  // Callback to update parent state and perform validation
  const updateDefinitions = useCallback(() => {
    if (
      !isValidTimeFormat(amStart) ||
      !isValidTimeFormat(amEnd) ||
      !isValidTimeFormat(pmStart) ||
      !isValidTimeFormat(pmEnd)
    ) {
      setValidationError(
        "Invalid time format. Please use HH:MM (e.g., 11:00)."
      );
      return;
    }

    // Consistency Validation
    if (amEnd !== pmStart) {
      setValidationError("AM shift end time must equal PM shift start time.");
    } else {
      setValidationError(null);
    }

    // Calculate hours
    const amHours = calculateHours(amStart, amEnd);
    const pmHours = calculateHours(pmStart, pmEnd);

    // Construct the new definitions object
    const newDefinitions: ShiftDefinitions = {
      HALF_DAY_AM: { start: amStart, end: amEnd, hours: amHours },
      HALF_DAY_PM: { start: pmStart, end: pmEnd, hours: pmHours },
      FULL_DAY: { start: amStart, end: pmEnd, hours: amHours + pmHours },
    };

    onShiftDefinitionsChange(newDefinitions);
  }, [amStart, amEnd, pmStart, pmEnd, onShiftDefinitionsChange]);

  // Use useEffect to call updateDefinitions whenever local times change
  useEffect(() => {
    updateDefinitions();
  }, [updateDefinitions]);

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Define Shift Times
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* AM Shift */}
        <fieldset className="border p-3 rounded border-gray-300">
          <legend className="text-sm font-medium text-indigo-600 px-1">
            AM Shift (e.g., Morning)
          </legend>
          <div className="flex items-center space-x-2">
            <label htmlFor="am-start" className="text-sm w-12 text-right">
              Start:
            </label>
            <input
              type="time"
              id="am-start"
              value={amStart}
              onChange={(e) => setAmStart(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label htmlFor="am-end" className="text-sm w-12 text-right">
              End:
            </label>
            <input
              type="time"
              id="am-end"
              value={amEnd}
              onChange={(e) => setAmEnd(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hours: {calculateHours(amStart, amEnd).toFixed(1)}
          </p>
        </fieldset>

        {/* PM Shift */}
        <fieldset className="border p-3 rounded border-gray-300">
          <legend className="text-sm font-medium text-indigo-600 px-1">
            PM Shift (e.g., Evening)
          </legend>
          <div className="flex items-center space-x-2">
            <label htmlFor="pm-start" className="text-sm w-12 text-right">
              Start:
            </label>
            <input
              type="time"
              id="pm-start"
              value={pmStart}
              onChange={(e) => setPmStart(e.target.value)}
              required
              className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                amEnd !== pmStart &&
                isValidTimeFormat(pmStart) &&
                isValidTimeFormat(amEnd)
                  ? "border-red-500 ring-red-500"
                  : ""
              }`}
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label htmlFor="pm-end" className="text-sm w-12 text-right">
              End:
            </label>
            <input
              type="time"
              id="pm-end"
              value={pmEnd}
              onChange={(e) => setPmEnd(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Hours: {calculateHours(pmStart, pmEnd).toFixed(1)}
          </p>
        </fieldset>

        {/* Full Day Info */}
        <div className="md:col-span-2 mt-2 text-sm text-center text-gray-600 bg-gray-100 p-2 rounded">
          Full Day Shift: {amStart} - {pmEnd} (
          {calculateHours(amStart, pmEnd).toFixed(1)} hours)
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <p className="md:col-span-2 text-sm text-red-600 text-center mt-2">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
}

export default ShiftDefinitionEditor;
