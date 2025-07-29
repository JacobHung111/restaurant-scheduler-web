// src/components/ShiftDefinitionEditor.tsx
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { ShiftDefinitions } from "../types";
import { timeToMinutes } from "../utils";

interface ShiftDefinitionEditorProps {
  shiftDefinitions: ShiftDefinitions;
  onUpdateShiftDefinitions: (newDefinitions: ShiftDefinitions) => void;
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
  shiftDefinitions,
  onUpdateShiftDefinitions,
}: ShiftDefinitionEditorProps) {
  const { t } = useTranslation();

  // Local state to manage input values
  const [amStart, setAmStart] = useState(shiftDefinitions.HALF_DAY_AM.start);
  const [amEnd, setAmEnd] = useState(shiftDefinitions.HALF_DAY_AM.end);
  const [pmStart, setPmStart] = useState(shiftDefinitions.HALF_DAY_PM.start);
  const [pmEnd, setPmEnd] = useState(shiftDefinitions.HALF_DAY_PM.end);

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
      setValidationError(t("shiftDefinition.invalidTimeFormat"));
      return;
    }

    // Consistency Validation
    if (amEnd !== pmStart) {
      setValidationError(t("shiftDefinition.amEndMustEqualPmStart"));
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

    onUpdateShiftDefinitions(newDefinitions);
  }, [amStart, amEnd, pmStart, pmEnd, onUpdateShiftDefinitions]);

  // Use useEffect to call updateDefinitions whenever local times change
  useEffect(() => {
    updateDefinitions();
  }, [updateDefinitions]);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 mb-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">
        {t("shiftDefinition.defineShiftTimes")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* AM Shift */}
        <fieldset className="border p-4 rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700/30">
          <legend className="text-sm font-medium text-blue-600 dark:text-blue-400 px-2">
            {t("shiftDefinition.amShift")}
          </legend>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="am-start"
              className="text-sm w-12 text-right text-gray-700 dark:text-slate-300"
            >
              {t("shiftDefinition.start")}
            </label>
            <input
              type="time"
              id="am-start"
              value={amStart}
              onChange={(e) => setAmStart(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label
              htmlFor="am-end"
              className="text-sm w-12 text-right text-gray-700 dark:text-slate-300"
            >
              {t("shiftDefinition.end")}
            </label>
            <input
              type="time"
              id="am-end"
              value={amEnd}
              onChange={(e) => setAmEnd(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            {t("shiftDefinition.hours")}{" "}
            {calculateHours(amStart, amEnd).toFixed(1)}
          </p>
        </fieldset>

        {/* PM Shift */}
        <fieldset className="border p-4 rounded-lg border-gray-300 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700/30">
          <legend className="text-sm font-medium text-blue-600 dark:text-blue-400 px-2">
            {t("shiftDefinition.pmShift")}
          </legend>
          <div className="flex items-center space-x-2">
            <label
              htmlFor="pm-start"
              className="text-sm w-12 text-right text-gray-700 dark:text-slate-300"
            >
              {t("shiftDefinition.start")}
            </label>
            <input
              type="time"
              id="pm-start"
              value={pmStart}
              onChange={(e) => setPmStart(e.target.value)}
              required
              className={`block w-full rounded-lg shadow-sm sm:text-sm ${
                amEnd !== pmStart &&
                isValidTimeFormat(pmStart) &&
                isValidTimeFormat(amEnd)
                  ? "border-red-500 dark:border-red-400 ring-red-500 dark:ring-red-400 dark:bg-slate-700 dark:text-slate-100"
                  : "border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              }`}
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label
              htmlFor="pm-end"
              className="text-sm w-12 text-right text-gray-700 dark:text-slate-300"
            >
              {t("shiftDefinition.end")}
            </label>
            <input
              type="time"
              id="pm-end"
              value={pmEnd}
              onChange={(e) => setPmEnd(e.target.value)}
              required
              className="block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            {t("shiftDefinition.hours")}{" "}
            {calculateHours(pmStart, pmEnd).toFixed(1)}
          </p>
        </fieldset>

        {/* Full Day Info */}
        <div className="md:col-span-2 mt-4 text-sm text-center text-gray-700 dark:text-slate-300 bg-blue-50 dark:bg-slate-700/50 p-3 rounded-lg border border-blue-200 dark:border-slate-600">
          <strong>{t("shiftDefinition.fullDayShift")}</strong> {amStart} -{" "}
          {pmEnd} ({t("shiftDefinition.hours").toLowerCase()}
          {calculateHours(amStart, pmEnd).toFixed(1)})
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div className="md:col-span-2 text-sm text-red-600 dark:text-red-400 text-center mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShiftDefinitionEditor;
