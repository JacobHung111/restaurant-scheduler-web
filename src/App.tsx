// src/App.tsx
import { useState, useCallback } from "react";
import { Tab } from "@headlessui/react";
import StaffPanel from "./components/StaffPanel";
import UnavailabilityPanel from "./components/UnavailabilityPanel";
import NeedsPanel from "./components/NeedsPanel";
import ScheduleDisplay from "./components/ScheduleDisplay";
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  Schedule,
} from "./types";
import { generateScheduleAPI } from "./api/scheduleApi";
import { DAYS_OF_WEEK, SHIFT_KEYS, ALL_ROLES } from "./config";
import "./index.css";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [unavailabilityList, setUnavailabilityList] = useState<
    Unavailability[]
  >([]);
  const [weeklyNeeds, setWeeklyNeeds] = useState<WeeklyNeeds>({});
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [staffIdCounter, setStaffIdCounter] = useState<number>(0);

  const [shiftPreference, setShiftPreference] = useState<
    "PRIORITIZE_FULL_DAYS" | "PRIORITIZE_HALF_DAYS" | "NONE"
  >("PRIORITIZE_FULL_DAYS");

  const handleAddStaff = (newStaffData: Omit<StaffMember, "id">) => {
    const generatedId = `S${Date.now()}-${staffIdCounter}`;
    setStaffIdCounter((prev) => prev + 1);
    const staffToAdd: StaffMember = { ...newStaffData, id: generatedId };
    setStaffList((prevList) => [...prevList, staffToAdd]);
    console.log("Staff added:", staffToAdd);
  };

  const handleDeleteStaff = (idToDelete: string) => {
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
      console.log(`Staff deleted: ${staffToDelete?.name} (ID: ${idToDelete})`);
    }
  };

  const handleAddUnavailability = (newUnavData: Unavailability) => {
    setUnavailabilityList((prevList) => [...prevList, newUnavData]);
    console.log("Unavailability added:", newUnavData);
  };

  const handleDeleteUnavailability = (
    employeeId: string,
    dayOfWeek: string
  ) => {
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
  };

  const handleNeedsChange = useCallback(
    (day: string, shiftKey: string, role: string, count: number) => {
      setWeeklyNeeds((prevNeeds) => {
        const newNeeds = JSON.parse(JSON.stringify(prevNeeds));

        if (!newNeeds[day]) {
          newNeeds[day] = {};
        }
        if (!newNeeds[day][shiftKey]) {
          newNeeds[day][shiftKey] = {};
        }

        if (count > 0) {
          newNeeds[day][shiftKey][role] = count;
        } else {
          delete newNeeds[day][shiftKey][role];
          if (Object.keys(newNeeds[day][shiftKey]).length === 0) {
            delete newNeeds[day][shiftKey];
          }
          if (Object.keys(newNeeds[day]).length === 0) {
            delete newNeeds[day];
          }
        }
        console.log("Weekly Needs Updated:", newNeeds);
        return newNeeds;
      });
    },
    []
  );

  const handleGenerateSchedule = async () => {
    console.log("Generate button clicked. Preparing data...");
    setIsLoading(true);
    setSchedule(null);
    setWarnings([]);

    const staffPriority = staffList.map((staff) => staff.id);

    const requestBody = {
      staffList: staffList,
      unavailabilityList: unavailabilityList,
      weeklyNeeds: weeklyNeeds,
      shiftPreference: shiftPreference,
      staffPriority: staffPriority,
    };

    console.log("Sending request to backend:", requestBody);

    try {
      const responseData = await generateScheduleAPI(requestBody);
      console.log("API Response received:", responseData);
      if (responseData.success) {
        setSchedule(responseData.schedule ?? {});
        setWarnings(responseData.warnings || []);
        console.log("Schedule generated successfully:", responseData.schedule);
        if (responseData.warnings && responseData.warnings.length > 0) {
          console.warn(
            "Schedule generated with warnings:",
            responseData.warnings
          );
        }
      } else {
        setSchedule(null);
        const errorMessages = responseData.warnings || [
          responseData.message || "Unknown backend error",
        ];
        setWarnings(errorMessages);
        console.error("Schedule generation failed:", errorMessages);
        alert("Schedule generation failed:\n" + errorMessages.join("\n"));
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule(null);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setWarnings([`Error fetching schedule: ${errorMessage}`]);
      alert(`Error fetching schedule: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log("Generation process finished.");
    }
  };

  const handleReorderStaff = useCallback((reorderedList: StaffMember[]) => {
    setStaffList(reorderedList);
    console.log("Staff list reordered.");
  }, []);

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
      alert(
        "Import failed: Staff data structure is invalid. Required fields: id, name, roles (array)."
      );
      return;
    }
    const importedIds = new Set();
    for (const item of importedData) {
      if (importedIds.has(item.id)) {
        alert(
          `Import failed: Duplicate staff ID found in imported data: ${item.id}.`
        );
        return;
      }
      importedIds.add(item.id);
    }

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
          }
        } else {
          invalidEntries++;
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
        errorMsg = `Data for ${day} is not an object`;
        break;
      }
      for (const shiftKey in importedData[day]) {
        if (!SHIFT_KEYS.includes(shiftKey)) {
          isValid = false;
          errorMsg = `Invalid shift key for ${day}: ${shiftKey}`;
          break;
        }
        if (typeof importedData[day][shiftKey] !== "object") {
          isValid = false;
          errorMsg = `Data for ${day}/${shiftKey} is not an object`;
          break;
        }
        for (const role in importedData[day][shiftKey]) {
          if (!ALL_ROLES.includes(role)) {
            isValid = false;
            errorMsg = `Invalid role for ${day}/${shiftKey}: ${role}`;
            break;
          }
          const count = importedData[day][shiftKey][role];
          if (
            typeof count !== "number" ||
            !Number.isInteger(count) ||
            count < 0
          ) {
            isValid = false;
            errorMsg = `Invalid count for ${day}/${shiftKey}/${role}: ${count}`;
            break;
          }
        }
      }
      if (!isValid) break;
    }

    if (!isValid) {
      alert(`Import failed: Invalid weekly needs structure. ${errorMsg}`);
      return;
    }

    if (
      confirm(
        `Import weekly needs data? This will replace the current settings.`
      )
    ) {
      setWeeklyNeeds(importedData as WeeklyNeeds);
      console.log(
        "Weekly needs data imported. Grid will reflect on next interaction or re-render."
      );
      alert("Weekly needs imported. The input fields will update.");
    }
  }, []);

  return (
    <div className="container mx-auto p-4 lg:p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Restaurant Weekly Schedule Generator
      </h1>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
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
        </Tab.List>

        <Tab.Panels className="mt-2">
          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            <StaffPanel
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onReorderStaff={handleReorderStaff}
              onImportStaff={handleImportStaff}
            />
          </Tab.Panel>

          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            <UnavailabilityPanel
              staffList={staffList}
              unavailabilityList={unavailabilityList}
              onAddUnavailability={handleAddUnavailability}
              onDeleteUnavailability={handleDeleteUnavailability}
              onImportUnavailability={handleImportUnavailability}
            />
          </Tab.Panel>

          <Tab.Panel
            className={classNames(
              "rounded-xl bg-white p-3",
              "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
            )}
          >
            <NeedsPanel
              weeklyNeeds={weeklyNeeds}
              onNeedsChange={handleNeedsChange}
              onImportNeeds={handleImportNeeds}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <div className="mt-8 space-y-6">
        {/* --- Optimization Settings Section --- */}
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Optimization Settings
          </h2>
          {/* --- Shift Preference Select  --- */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
            >
              <option value="PRIORITIZE_FULL_DAYS">Prioritize Full Days</option>
              <option value="PRIORITIZE_HALF_DAYS">Prioritize Half Days</option>
              <option value="NONE">No Preference</option>
            </select>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Staff priority is now determined by the order in the Staff List
            above (drag to reorder).
          </p>
        </div>
        {/* Control and Output Section Placeholders */}
        <div className="p-4 bg-white rounded-lg shadow text-center">
          <button
            onClick={handleGenerateSchedule}
            disabled={isLoading}
            className={`px-6 py-3 text-lg font-semibold rounded-md text-white ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed animate-pulse"
                : "bg-green-600 hover:bg-green-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out`}
          >
            {isLoading ? "Is Loading..." : "Generated Schedule"}
          </button>
          {isLoading && (
            <p className="text-center text-blue-600 animate-pulse">
              Waiting the result from Web Server...
            </p>
          )}
          {!isLoading && (
            <ScheduleDisplay schedule={schedule} staffList={staffList} />
          )}
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Logs and Warnings
          </h2>
          {warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded">
              <h3 className="font-semibold text-yellow-800">logs/alert:</h3>
              <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
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
