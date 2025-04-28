// src/App.tsx
import { useState, useCallback } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import StaffPanel from "./components/StaffPanel";
import UnavailabilityPanel from "./components/UnavailabilityPanel";
import NeedsPanel from "./components/NeedsPanel";
import ScheduleDisplay from "./components/ScheduleDisplay";
import ShiftDefinitionEditor from "./components/ShiftDefinitionEditor";
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  Schedule,
  ShiftDefinitions,
} from "./types";
import { generateScheduleAPI } from "./api/scheduleApi";
import { createInitialShiftDefinitions } from "./utils";
import { DAYS_OF_WEEK, ALL_ROLES, SHIFT_TYPES } from "./config";
import "./index.css";

// Helper for conditional class names
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  // --- State ---
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [unavailabilityList, setUnavailabilityList] = useState<
    Unavailability[]
  >([]);
  const [weeklyNeeds, setWeeklyNeeds] = useState<WeeklyNeeds>({});
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [staffIdCounter, setStaffIdCounter] = useState<number>(0);
  const [shiftDefinitions, setShiftDefinitions] = useState<ShiftDefinitions>(
    createInitialShiftDefinitions()
  );
  const [shiftPreference, setShiftPreference] = useState<
    "PRIORITIZE_FULL_DAYS" | "PRIORITIZE_HALF_DAYS" | "NONE"
  >("PRIORITIZE_FULL_DAYS");

  // --- Callback Handlers ---

  const handleAddStaff = useCallback(
    (newStaffData: Omit<StaffMember, "id">) => {
      const generatedId = `S${Date.now()}-${staffIdCounter}`;
      setStaffIdCounter((prev) => prev + 1);
      const staffToAdd: StaffMember = { ...newStaffData, id: generatedId };
      setStaffList((prevList) => [...prevList, staffToAdd]);
      console.log("Staff added:", staffToAdd);
    },
    [staffIdCounter]
  );

  const handleDeleteStaff = useCallback(
    (idToDelete: string) => {
      if (
        confirm(
          "Are you sure you want to delete this staff member and their unavailability?"
        )
      ) {
        const staffToDelete = staffList.find((s) => s.id === idToDelete);
        setStaffList((prevList) =>
          prevList.filter((staff) => staff.id !== idToDelete)
        );
        setUnavailabilityList((prevUnav) =>
          prevUnav.filter((unav) => unav.employeeId !== idToDelete)
        );
        console.log(
          `Staff deleted: ${staffToDelete?.name} (ID: ${idToDelete})`
        );
      }
    },
    [staffList]
  );

  const handleReorderStaff = useCallback((reorderedList: StaffMember[]) => {
    setStaffList(reorderedList);
    console.log("Staff list reordered (priority changed).");
  }, []);

  const handleAddUnavailability = useCallback(
    (newUnavData: Unavailability) => {
      if (!staffList.some((staff) => staff.id === newUnavData.employeeId)) {
        alert(`Error: Staff with ID ${newUnavData.employeeId} not found.`);
        return;
      }
      setUnavailabilityList((prevList) => {
        // Avoid adding exact duplicate entries for the same person/day/shifts
        const existingIndex = prevList.findIndex(
          (item) =>
            item.employeeId === newUnavData.employeeId &&
            item.dayOfWeek === newUnavData.dayOfWeek &&
            JSON.stringify(item.shifts.sort()) ===
              JSON.stringify(newUnavData.shifts.sort())
        );
        if (existingIndex > -1) {
          console.log("Duplicate unavailability entry ignored.");
          return prevList;
        }
        return [...prevList, newUnavData];
      });
      console.log("Unavailability added:", newUnavData);
    },
    [staffList]
  );

  const handleDeleteUnavailability = useCallback(
    (employeeId: string, dayOfWeek: string) => {
      if (
        confirm(
          `Are you sure you want to delete all unavailability for ${employeeId} on ${dayOfWeek}?`
        )
      ) {
        setUnavailabilityList((prevList) =>
          prevList.filter(
            (item) =>
              !(item.employeeId === employeeId && item.dayOfWeek === dayOfWeek)
          )
        );
        console.log(`Unavailability deleted for ${employeeId} on ${dayOfWeek}`);
      }
    },
    []
  );

  const handleNeedsChange = useCallback(
    (day: string, shiftType: string, role: string, count: number) => {
      setWeeklyNeeds((prevNeeds) => {
        const newNeeds = JSON.parse(JSON.stringify(prevNeeds));

        // Ensure nested structure exists
        if (!newNeeds[day]) newNeeds[day] = {};
        if (!newNeeds[day][shiftType]) newNeeds[day][shiftType] = {};

        if (count > 0) {
          newNeeds[day][shiftType][role] = count;
        } else {
          // Clean up: delete role, then shift, then day if they become empty
          if (newNeeds[day]?.[shiftType]) {
            delete newNeeds[day][shiftType][role];
            if (Object.keys(newNeeds[day][shiftType]).length === 0) {
              delete newNeeds[day][shiftType];
            }
            if (Object.keys(newNeeds[day]).length === 0) {
              delete newNeeds[day];
            }
          }
        }
        return newNeeds;
      });
    },
    []
  );

  const handleShiftDefinitionsChange = useCallback(
    (newDefinitions: ShiftDefinitions) => {
      setShiftDefinitions(newDefinitions);
      console.log("Shift definitions updated in App:", newDefinitions);
      setSchedule(null);
      setWarnings([]);
    },
    []
  );

  // --- Import Handlers ---
  const handleImportStaff = useCallback((importedData: any) => {
    if (!Array.isArray(importedData)) {
      alert("Import failed: Staff data must be an array.");
      return;
    }
    const isValid = importedData.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        "name" in item &&
        "roles" in item &&
        Array.isArray(item.roles)
    );
    if (!isValid) {
      alert("Import failed: Staff data structure is invalid.");
      return;
    }
    const importedIds = new Set<string>();
    let hasDuplicates = false;
    for (const item of importedData) {
      if (importedIds.has(item.id)) {
        alert(
          `Import failed: Duplicate staff ID found in imported data: ${item.id}.`
        );
        hasDuplicates = true;
        break;
      }
      importedIds.add(item.id);
    }
    if (hasDuplicates) return;

    if (
      confirm(
        `Import ${importedData.length} staff records? This will replace the current list and clear unavailability.`
      )
    ) {
      setStaffList(importedData as StaffMember[]);
      setUnavailabilityList([]);
      console.log("Staff data imported.");
    }
  }, []);

  const handleImportUnavailability = useCallback(
    (importedData: any) => {
      if (!Array.isArray(importedData)) {
        alert("Import failed: Unavailability data must be an array.");
        return;
      }
      const currentStaffIds = new Set(staffList.map((s) => s.id));
      let invalidEntries = 0;
      const validatedData: Unavailability[] = [];
      for (const item of importedData) {
        if (
          item &&
          typeof item === "object" &&
          item.employeeId &&
          typeof item.employeeId === "string" &&
          DAYS_OF_WEEK.includes(item.dayOfWeek) &&
          Array.isArray(item.shifts) &&
          item.shifts.every(
            (s: any) =>
              s && typeof s.start === "string" && typeof s.end === "string"
          )
        ) {
          if (currentStaffIds.has(item.employeeId)) {
            validatedData.push(item as Unavailability);
          } else {
            invalidEntries++;
            console.warn(
              `Ignoring unavailability for unknown staff ID: ${item.employeeId}`
            );
          }
        } else {
          invalidEntries++;
          console.warn("Ignoring invalid unavailability record:", item);
        }
      }
      if (validatedData.length === 0 && importedData.length > 0) {
        alert(
          "Import failed: No valid unavailability records found or all records belong to unknown staff."
        );
        return;
      }
      let message = `Import ${validatedData.length} valid unavailability records? This will replace the current list.`;
      if (invalidEntries > 0)
        message += ` (${invalidEntries} invalid/unknown records ignored)`;
      if (confirm(message)) {
        setUnavailabilityList(validatedData);
        console.log("Unavailability data imported.");
      }
    },
    [staffList]
  );

  const handleImportNeeds = useCallback((importedData: any) => {
    if (
      typeof importedData !== "object" ||
      importedData === null ||
      Array.isArray(importedData)
    ) {
      alert("Import failed: Weekly needs data must be an object.");
      return;
    }
    let isValid = true;
    let errorMsg = "";
    for (const day in importedData) {
      if (!DAYS_OF_WEEK.includes(day)) {
        isValid = false;
        errorMsg = `Invalid day: ${day}`;
        break;
      }
      if (typeof importedData[day] !== "object") {
        isValid = false;
        errorMsg = `Data for ${day} is not object`;
        break;
      }
      for (const shiftType in importedData[day]) {
        // Use shiftType here
        // *** Use SHIFT_TYPES constant for validation ***
        if (!SHIFT_TYPES.includes(shiftType as any)) {
          // Use SHIFT_TYPES from config
          isValid = false;
          errorMsg = `Invalid shift type for ${day}: ${shiftType}`;
          break;
        }
        if (typeof importedData[day][shiftType] !== "object") {
          isValid = false;
          errorMsg = `Data for ${day}/${shiftType} is not object`;
          break;
        }
        for (const role in importedData[day][shiftType]) {
          if (!ALL_ROLES.includes(role)) {
            isValid = false;
            errorMsg = `Invalid role for ${day}/${shiftType}: ${role}`;
            break;
          }
          const count = importedData[day][shiftType][role];
          if (
            typeof count !== "number" ||
            !Number.isInteger(count) ||
            count < 0
          ) {
            isValid = false;
            errorMsg = `Invalid count for ${day}/${shiftType}/${role}: ${count}`;
            break;
          }
        }
        if (!isValid) break; // Break inner role loop
      }
      if (!isValid) break; // Break outer shift loop
    }
    if (!isValid) {
      alert(`Import failed: Invalid weekly needs structure. ${errorMsg}`);
      return;
    }
    if (
      confirm(`Import weekly needs data? This will replace current settings.`)
    ) {
      setWeeklyNeeds(importedData as WeeklyNeeds);
      console.log("Weekly needs imported.");
      alert("Weekly needs imported. Input fields will update.");
    }
  }, []);

  // --- Generate Schedule API Call  ---
  const handleGenerateSchedule = async () => {
    console.log("Generate button clicked. Preparing data...");
    setIsLoading(true);
    setSchedule(null);
    setWarnings([]);
    if (
      shiftDefinitions.HALF_DAY_AM.end !== shiftDefinitions.HALF_DAY_PM.start
    ) {
      alert("Error: AM shift end time must equal PM shift start time.");
      setIsLoading(false);
      return;
    }
    if (
      !shiftDefinitions.HALF_DAY_AM.start ||
      !shiftDefinitions.HALF_DAY_AM.end ||
      !shiftDefinitions.HALF_DAY_PM.start ||
      !shiftDefinitions.HALF_DAY_PM.end
    ) {
      alert("Error: Shift start and end times cannot be empty.");
      setIsLoading(false);
      return;
    }
    const staffPriority = staffList.map((staff) => staff.id);
    const requestBody = {
      staffList,
      unavailabilityList,
      weeklyNeeds,
      shiftDefinitions,
      shiftPreference,
      staffPriority,
    };
    console.log("Sending request to backend:", requestBody);
    try {
      const responseData = await generateScheduleAPI(requestBody);
      console.log("API Response received:", responseData);
      if (responseData.success) {
        setSchedule(responseData.schedule ?? {});
        setWarnings(responseData.warnings || []);
        if (responseData.warnings && responseData.warnings.length > 0)
          console.warn("Warnings:", responseData.warnings);
      } else {
        setSchedule(null);
        const errorMessages = responseData.warnings || [
          responseData.message || "Unknown error",
        ];
        setWarnings(errorMessages);
        console.error("Failed:", errorMessages);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      setSchedule(null);
      const errorMessage = error?.message ?? "Unknown error.";
      const errorWarnings = Array.isArray(error?.warnings)
        ? error.warnings
        : [];
      setWarnings([`Error: ${errorMessage}`, ...errorWarnings]);
    } finally {
      setIsLoading(false);
      console.log("Generation finished.");
    }
  };

  // --- Render ---
  return (
    <div className="container mx-auto p-4 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Restaurant Schedule Generator
      </h1>

      {/* Shift Definition Editor */}
      <ShiftDefinitionEditor
        initialDefinitions={shiftDefinitions}
        onShiftDefinitionsChange={handleShiftDefinitionsChange}
      />

      {/* Tabs for Staff, Unavailability, Needs */}
      <TabGroup>
        <TabList className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1 my-6">
          {["Staff", "Unavailability", "Needs"].map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                  selected
                    ? "bg-white text-blue-700 shadow"
                    : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {category}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-2">
          {/* Staff Panel */}
          <TabPanel
            className={classNames(
              "rounded-xl bg-white p-4 shadow",
              "focus:outline-none"
            )}
          >
            <StaffPanel
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onReorderStaff={handleReorderStaff}
              onImportStaff={handleImportStaff}
            />
          </TabPanel>
          {/* Unavailability Panel */}
          <TabPanel
            className={classNames(
              "rounded-xl bg-white p-4 shadow",
              "focus:outline-none"
            )}
          >
            <UnavailabilityPanel
              staffList={staffList}
              unavailabilityList={unavailabilityList}
              onAddUnavailability={handleAddUnavailability}
              onDeleteUnavailability={handleDeleteUnavailability}
              onImportUnavailability={handleImportUnavailability}
            />
          </TabPanel>
          {/* Needs Panel */}
          <TabPanel
            className={classNames(
              "rounded-xl bg-white p-4 shadow",
              "focus:outline-none"
            )}
          >
            <NeedsPanel
              weeklyNeeds={weeklyNeeds}
              onNeedsChange={handleNeedsChange}
              onImportNeeds={handleImportNeeds}
            />
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Optimization, Controls, Output */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:gap-8 items-start">
        {/* Optimization Settings */}
        <div className="lg:col-span-1 p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Optimization
          </h2>
          <div className="mb-4">
            <label
              htmlFor="shift-pref-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shift Preference:
            </label>
            <select
              id="shift-pref-select"
              value={shiftPreference}
              onChange={(e) => setShiftPreference(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
            >
              <option value="PRIORITIZE_FULL_DAYS">Prioritize Full Days</option>
              <option value="PRIORITIZE_HALF_DAYS">Prioritize Half Days</option>
              <option value="NONE">No Preference</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Staff priority set by Staff List order.
          </p>
        </div>

        {/* Generate Button */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow flex flex-col items-center justify-center">
          <button
            onClick={handleGenerateSchedule}
            disabled={isLoading}
            className={`w-full max-w-xs px-8 py-4 text-xl font-semibold rounded-md text-white transition duration-150 ease-in-out ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed animate-pulse"
                : "bg-green-600 hover:bg-green-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
          >
            {isLoading ? "Generating..." : "Generate Weekly Schedule"}
          </button>
          {isLoading && (
            <p className="mt-4 text-center text-sm text-blue-600 animate-pulse">
              Fetching schedule from server...
            </p>
          )}
        </div>
      </div>

      {/* Schedule Result and Logs */}
      <div className="mt-8 space-y-6">
        <div className="p-4 bg-white rounded-lg shadow min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Schedule Result
          </h2>
          {!isLoading && (
            <ScheduleDisplay schedule={schedule} staffList={staffList} />
          )}
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Messages & Warnings
          </h2>
          {warnings.length > 0 && (
            <div
              className={`mb-4 p-3 rounded border text-sm ${
                warnings.some((w) => w.toLowerCase().startsWith("error:"))
                  ? "bg-red-100 border-red-300 text-red-800"
                  : "bg-yellow-100 border-yellow-300 text-yellow-800"
              }`}
            >
              <h3 className="font-semibold mb-1">Backend Messages:</h3>
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>
                    {w.replace(/^Warning: /i, "").replace(/^Error: /i, "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-400 italic">
            Frontend logs are in the browser console (Press F12).
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
