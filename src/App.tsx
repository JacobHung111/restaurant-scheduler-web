// src/App.tsx
import { useState, useCallback } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import StaffPanel from "./components/StaffPanel";
import UnavailabilityPanel from "./components/UnavailabilityPanel";
import NeedsPanel from "./components/NeedsPanel";
import ScheduleDisplay from "./components/ScheduleDisplay";
import ShiftDefinitionEditor from "./components/ShiftDefinitionEditor";
import RoleManager from "./components/RoleManager";
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  Schedule,
  ShiftDefinitions,
} from "./types";
import { generateScheduleAPI } from "./api/scheduleApi";
import { createInitialShiftDefinitions } from "./utils";
import {
  DAYS_OF_WEEK,
  ALL_ROLES as DEFAULT_ROLES,
  SHIFT_TYPES,
} from "./config";
import "./index.css";

// Helper for conditional class names
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  // --- State ---
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [definedRoles, setDefinedRoles] = useState<string[]>(DEFAULT_ROLES);
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
      if (
        !newStaffData.assignedRolesInPriority ||
        newStaffData.assignedRolesInPriority.length === 0
      ) {
        alert("Please select and prioritize at least one role for the staff.");
        return;
      }
      const invalidRoles = newStaffData.assignedRolesInPriority.filter(
        (r) => !definedRoles.includes(r)
      );
      if (invalidRoles.length > 0) {
        alert(
          `Error: The following selected roles are not valid: ${invalidRoles.join(
            ", "
          )}`
        );
        return;
      }

      const generatedId = `S${Date.now()}-${staffIdCounter}`;
      setStaffIdCounter((prev) => prev + 1);
      const staffToAdd: StaffMember = { ...newStaffData, id: generatedId };
      setStaffList((prevList) => [...prevList, staffToAdd]);
      console.log("Staff added:", staffToAdd);
    },
    [staffIdCounter, definedRoles]
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

  const handleAddRole = useCallback(
    (newRole: string) => {
      const trimmedRole = newRole.trim();
      if (trimmedRole && !definedRoles.includes(trimmedRole)) {
        setDefinedRoles((prev) => [...prev, trimmedRole].sort());
        console.log("Role added:", trimmedRole);
      } else if (definedRoles.includes(trimmedRole)) {
        alert(`Role "${trimmedRole}" already exists.`);
      } else {
        alert("Role name cannot be empty.");
      }
    },
    [definedRoles]
  );

  const handleDeleteRole = useCallback(
    (roleToDelete: string) => {
      if (!definedRoles.includes(roleToDelete)) return;
      if (
        staffList.some((staff) =>
          staff.assignedRolesInPriority.includes(roleToDelete)
        )
      ) {
        if (
          !confirm(
            `Role "${roleToDelete}" is assigned to some staff. Deleting it will remove it from their assignments. Staff with no roles left will be removed. Continue?`
          )
        ) {
          return;
        }
      } else if (
        !confirm(`Are you sure you want to delete the role "${roleToDelete}"?`)
      ) {
        return;
      }

      // 1. Remove role from defined roles
      setDefinedRoles((prev) => prev.filter((role) => role !== roleToDelete));

      // 2. Update staff list
      const updatedStaffList: StaffMember[] = [];
      const staffToDeleteIds: string[] = [];
      staffList.forEach((staff) => {
        // Filter out the deleted role from assignedRolesInPriority
        const newAssignedRoles = staff.assignedRolesInPriority.filter(
          (role) => role !== roleToDelete
        );
        if (newAssignedRoles.length > 0) {
          updatedStaffList.push({
            ...staff,
            assignedRolesInPriority: newAssignedRoles,
          });
        } else {
          staffToDeleteIds.push(staff.id);
          console.log(
            `Staff ${staff.name} marked for deletion (no roles left).`
          );
        }
      });
      setStaffList(updatedStaffList);

      // 3. Update unavailability list (remove entries for deleted staff)
      if (staffToDeleteIds.length > 0) {
        setUnavailabilityList((prevUnav) =>
          prevUnav.filter((unav) => !staffToDeleteIds.includes(unav.employeeId))
        );
        console.log(
          `Removed unavailability for deleted staff: ${staffToDeleteIds.join(
            ", "
          )}`
        );
      }

      // 4. Update weekly needs (remove needs for the deleted role)
      setWeeklyNeeds((prevNeeds) => {
        const newNeeds = JSON.parse(JSON.stringify(prevNeeds));
        let needsChanged = false;
        for (const day in newNeeds) {
          for (const shiftType in newNeeds[day]) {
            if (newNeeds[day][shiftType]?.[roleToDelete]) {
              delete newNeeds[day][shiftType][roleToDelete];
              needsChanged = true;
              if (Object.keys(newNeeds[day][shiftType]).length === 0)
                delete newNeeds[day][shiftType];
              if (Object.keys(newNeeds[day]).length === 0) delete newNeeds[day];
            }
          }
        }
        if (needsChanged)
          console.log(`Removed needs for deleted role: ${roleToDelete}`);
        return newNeeds;
      });

      console.log(`Role "${roleToDelete}" deleted.`);
    },
    [definedRoles, staffList]
  );

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
      if (!definedRoles.includes(role)) {
        console.error(
          `Attempted to change needs for an undefined role: ${role}`
        );
        alert(
          `Cannot set needs for role "${role}" as it's not currently defined.`
        );
        return;
      }
      setWeeklyNeeds((prevNeeds) => {
        const newNeeds = JSON.parse(JSON.stringify(prevNeeds));
        if (!newNeeds[day]) newNeeds[day] = {};
        if (!newNeeds[day][shiftType]) newNeeds[day][shiftType] = {};
        if (count > 0) {
          newNeeds[day][shiftType][role] = count;
        } else {
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
    [definedRoles]
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
  const handleImportStaff = useCallback(
    (importedData: any) => {
      if (!Array.isArray(importedData)) {
        alert("Import failed: Staff data must be an array.");
        return;
      }
      const currentDefinedRolesSet = new Set(definedRoles);
      const isValid = importedData.every(
        (item) =>
          item &&
          typeof item === "object" &&
          "id" in item &&
          "name" in item &&
          // Check assignedRolesInPriority exists and its elements are valid roles
          "assignedRolesInPriority" in item &&
          Array.isArray(item.assignedRolesInPriority) &&
          item.assignedRolesInPriority.length > 0 &&
          item.assignedRolesInPriority.every(
            (r: any) => typeof r === "string" && currentDefinedRolesSet.has(r)
          ) &&
          (item.minHoursPerWeek === null ||
            item.minHoursPerWeek === undefined ||
            typeof item.minHoursPerWeek === "number") &&
          (item.maxHoursPerWeek === null ||
            item.maxHoursPerWeek === undefined ||
            typeof item.maxHoursPerWeek === "number")
      );
      if (!isValid) {
        alert(
          "Import failed: Invalid staff structure or contains undefined/invalid roles in 'assignedRolesInPriority'."
        );
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
        const formattedStaffList = importedData.map(
          (item: any): StaffMember => ({
            id: item.id,
            name: item.name,
            assignedRolesInPriority: item.assignedRolesInPriority,
            minHoursPerWeek: item.minHoursPerWeek ?? null,
            maxHoursPerWeek: item.maxHoursPerWeek ?? null,
          })
        );
        setStaffList(formattedStaffList);
        setUnavailabilityList([]);
        console.log("Staff data imported.");
      }
    },
    [definedRoles]
  ); // Depends on definedRoles for validation

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
    const currentDefinedRolesSet = new Set(definedRoles);
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
        if (!SHIFT_TYPES.includes(shiftType as any)) {
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
          if (!currentDefinedRolesSet.has(role)) {
            isValid = false;
            errorMsg = `Invalid role found in needs: ${role}`;
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
        if (!isValid) break;
      }
      if (!isValid) break;
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
    console.log("Sending request to backend:", JSON.stringify(requestBody));
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

      {/* --- Role Manager --- */}
      <RoleManager
        definedRoles={definedRoles}
        onAddRole={handleAddRole}
        onDeleteRole={handleDeleteRole}
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
              definedRoles={definedRoles}
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
              definedRoles={definedRoles}
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
            <ScheduleDisplay
              schedule={schedule}
              staffList={staffList}
              shiftDefinitions={shiftDefinitions}
            />
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
        </div>
      </div>
    </div>
  );
}

export default App;
