// src/App.tsx
import React, { useState, useCallback } from "react";
import StaffForm from "./components/StaffForm";
import StaffList from "./components/StaffList";
import UnavailabilityForm from "./components/UnavailabilityForm";
import UnavailabilityList from "./components/UnavailabilityList";
import NeedsInputGrid from "./components/NeedsInputGrid";
import ScheduleDisplay from "./components/ScheduleDisplay";
import ImportExportButtons from "./components/ImportExportButtons";
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  Schedule,
} from "./types";
import { DAYS_OF_WEEK, SHIFT_KEYS, ALL_ROLES } from "./config";
import { generateScheduleAPI } from "./api/scheduleApi";
import "./index.css";

function App() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [unavailabilityList, setUnavailabilityList] = useState<
    Unavailability[]
  >([]);
  const [weeklyNeeds, setWeeklyNeeds] = useState<WeeklyNeeds>({});
  const [schedule, setSchedule] = useState<Schedule | null>(null); // Schedule can be null initially
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [staffIdCounter, setStaffIdCounter] = useState<number>(0);

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

    const requestBody = {
      staffList: staffList,
      unavailabilityList: unavailabilityList,
      weeklyNeeds: weeklyNeeds,
    };

    console.log("Sending request to backend:", requestBody);

    try {
      const responseData = await generateScheduleAPI(requestBody);

      console.log("API Response received:", responseData);

      if (responseData.success) {
        setSchedule(responseData.schedule ?? {}); // Use empty object if schedule is null/undefined on success
        setWarnings(responseData.warnings || []);
        console.log("Schedule generated successfully:", responseData.schedule);
        if (responseData.warnings && responseData.warnings.length > 0) {
          console.warn(
            "Schedule generated with warnings:",
            responseData.warnings
          );
          alert(
            "The schedule has been generated, but there are the following warnings:\n" +
              responseData.warnings.join("\n")
          );
        } else {
          alert("The schedule has been generated！");
        }
      } else {
        setSchedule(null);
        const errorMessages = responseData.warnings || [
          responseData.message || "Unknown backend Error",
        ];
        setWarnings(errorMessages);
        console.error("Schedule generation failed:", errorMessages);
        alert("The schedule generation failed:\n" + errorMessages.join("\n"));
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setSchedule(null);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setWarnings([`The schedule generation failed: ${errorMessage}`]);
      alert(`The schedule generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      console.log("Generation process finished.");
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Staff Management Section */}
          <ImportExportButtons
            dataType="Staff"
            dataToExport={staffList}
            onDataImport={handleImportStaff}
          />
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Staff Management
            </h2>
            {/* --- Render Staff Components --- */}
            <StaffForm onAddStaff={handleAddStaff} />
            <StaffList
              staffList={staffList}
              onDeleteStaff={handleDeleteStaff}
            />
            {/* --- End Render Staff Components --- */}
          </div>
          {/* Unavailability Section */}
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Staff Unavailability
            </h2>
            <ImportExportButtons
              dataType="Unavailability"
              dataToExport={unavailabilityList}
              onDataImport={handleImportUnavailability}
            />
            {/* --- Render Unavailability Components --- */}
            <UnavailabilityForm
              staffList={staffList}
              onAddUnavailability={handleAddUnavailability}
            />
            <UnavailabilityList
              unavailabilityList={unavailabilityList}
              staffList={staffList}
              onDeleteUnavailability={handleDeleteUnavailability}
            />
            {/* --- End Render Unavailability Components --- */}
          </div>
        </div>

        {/* Needs Section Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Needs Section
            </h2>
            <ImportExportButtons
              dataType="Weekly Needs"
              dataToExport={weeklyNeeds}
              onDataImport={handleImportNeeds}
            />
            <NeedsInputGrid
              weeklyNeeds={weeklyNeeds}
              onNeedsChange={handleNeedsChange}
            />
          </div>
        </div>
      </div>

      {/* Control and Output Section Placeholders */}
      <div className="mt-8 space-y-6">
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
        </div>
        <div className="p-4 bg-white rounded-lg shadow min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Generate Schedule Result
          </h2>
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
