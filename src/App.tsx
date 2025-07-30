// src/App.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import type { StaffMember, Unavailability } from "./types";
import StaffPanel from "./components/StaffPanel";
import UnavailabilityPanel from "./components/UnavailabilityPanel";
import NeedsPanel from "./components/NeedsPanel";
import ScheduleDisplay from "./components/ScheduleDisplay";
import MessageModal from "./components/MessageModal";
import DataOverview from "./components/DataOverview";
import HistoryPanel from "./components/HistoryPanel";
import { useScheduleGeneration } from "./hooks/useScheduleGeneration";
import { 
  useStaffSelectors, 
  useScheduleSelectors, 
  useUnavailabilitySelectors 
} from "./hooks/useStoreSelectors";
import { validateBulkImportData, validateDataRelationships, type BulkImportData } from "./utils/importValidation";
import { logger } from "./utils/logger";
import "./i18n/config"; // Initialize i18n
import "./index.css";
import { useTranslation } from 'react-i18next';

// Helper for conditional class names
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function App() {
  const { t } = useTranslation();
  
  // --- File Input Ref for Universal Import ---
  const universalImportFileRef = useRef<HTMLInputElement>(null);

  // --- Full Page Drag & Drop State ---
  const [isDragOverPage, setIsDragOverPage] = useState(false);
  const [, setDragCounter] = useState(0);
  
  // --- History Panel State ---
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // --- Optimized Zustand Selectors with useShallow ---
  const staffStore = useStaffSelectors();
  const scheduleStore = useScheduleSelectors();
  const unavailabilityStore = useUnavailabilitySelectors();
  
  // --- TanStack Query Hook ---
  const { generateSchedule } = useScheduleGeneration();

  // --- Handler Functions (now just call store actions directly) ---
  const handleGenerateSchedule = () => {
    generateSchedule();
  };

  // --- Store Action Wrappers with Error Handling ---
  const handleAddStaff = (newStaffData: Omit<StaffMember, 'id'>) => {
    const result = staffStore.addStaff(newStaffData);
    if (!result.success) {
      scheduleStore.showMessage('warning', 'Staff Addition Failed', result.error || 'Unknown error occurred');
    }
  };

  const handleAddUnavailability = (unavailability: Unavailability) => {
    const result = unavailabilityStore.addUnavailability(unavailability);
    if (!result.success) {
      scheduleStore.showMessage('warning', 'Unavailability Addition Failed', result.error || 'Unknown error occurred');
    }
  };

  const handleDeleteStaff = (id: string) => {
    const result = staffStore.deleteStaff(id);
    if (result.success) {
      unavailabilityStore.deleteAllUnavailabilityForStaff(id);
    } else {
      scheduleStore.showMessage('error', 'Staff Deletion Failed', result.error || 'Unknown error occurred');
    }
  };



  // --- Universal Import Handler (supports both bulk and individual data) ---
  const handleUniversalImport = () => {
    universalImportFileRef.current?.click();
  };

  const handleUniversalImportFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      scheduleStore.showMessage(
        'error',
        'Invalid File Type',
        'Please select a valid JSON file (.json).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file content.');
        }

        const rawData = JSON.parse(result);
        
        // Only support bulk format - validate and import
        const validation = validateBulkImportData(rawData);
        
        if (validation.isValid) {
          const relationshipWarnings = validateDataRelationships(validation.data);
          validation.warnings.push(...relationshipWarnings);
        }

        if (!validation.isValid) {
          scheduleStore.showMessage(
            'error',
            'Import Failed', 
            'Invalid bulk data format in JSON file.',
            validation.errors
          );
          return;
        }

        handleBulkImport(validation.data, 'replace');

      } catch (error) {
        scheduleStore.showMessage(
          'error',
          'Import Failed',
          'Failed to parse JSON file.',
          [error instanceof Error ? error.message : 'Invalid JSON format']
        );
      } finally {
        if (universalImportFileRef.current) universalImportFileRef.current.value = '';
      }
    };

    reader.onerror = () => {
      scheduleStore.showMessage(
        'error',
        'Import Failed',
        'Error reading the selected file.'
      );
      if (universalImportFileRef.current) universalImportFileRef.current.value = '';
    };

    reader.readAsText(file);
  };


  // --- Bulk Export Handler ---
  const handleBulkExport = () => {
    try {
      const bulkData: BulkImportData = {};
      let hasData = false;

      // Export only parts with data
      if (staffStore.staffList.length > 0) {
        bulkData.staffList = staffStore.staffList;
        hasData = true;
      }

      // Always export definedRoles if they exist (even if no staff)
      if (staffStore.definedRoles.length > 0) {
        bulkData.definedRoles = staffStore.definedRoles;
        hasData = true;
      }

      if (unavailabilityStore.unavailabilityList.length > 0) {
        bulkData.unavailabilityList = unavailabilityStore.unavailabilityList;
        hasData = true;
      }

      if (Object.keys(scheduleStore.weeklyNeeds).length > 0) {
        bulkData.weeklyNeeds = scheduleStore.weeklyNeeds;
        hasData = true;
      }

      // Always export shiftDefinitions if they exist
      if (scheduleStore.shiftDefinitions) {
        bulkData.shiftDefinitions = scheduleStore.shiftDefinitions;
        hasData = true;
      }

      if (!hasData) {
        scheduleStore.showMessage(
          'warning',
          'Export Failed',
          'No data available to export.',
          ['Please add some staff, unavailability, weekly needs, or configuration data first.']
        );
        return;
      }

      // Generate filename with date and time
      const now = new Date();
      const dateString = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeString = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const fileName = `restaurant_scheduler_data_${dateString}_${timeString}.json`;

      // Create and download file
      const jsonString = JSON.stringify(bulkData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Generate export summary
      const exportSummary: string[] = [];
      if (bulkData.staffList) exportSummary.push(`${bulkData.staffList.length} staff members`);
      if (bulkData.definedRoles) exportSummary.push(`${bulkData.definedRoles.length} defined roles`);
      if (bulkData.unavailabilityList) exportSummary.push(`${bulkData.unavailabilityList.length} unavailability entries`);
      if (bulkData.weeklyNeeds) {
        const daysCount = Object.keys(bulkData.weeklyNeeds).length;
        exportSummary.push(`weekly needs for ${daysCount} days`);
      }
      if (bulkData.shiftDefinitions) exportSummary.push('shift definitions');

      scheduleStore.showMessage(
        'success',
        'Export Successful',
        `File saved as: ${fileName}`,
        exportSummary
      );

      logger.log('Bulk export completed:', { fileName, data: bulkData });
    } catch (error) {
      scheduleStore.showMessage(
        'error',
        'Export Failed',
        'Failed to export data. Please try again.',
        [error instanceof Error ? error.message : 'Unknown error occurred']
      );
      logger.error('Bulk export error:', error);
    }
  };

  // --- Bulk Import Handler ---
  const handleBulkImport = useCallback((data: BulkImportData, updateMode: 'replace' | 'merge') => {
    try {
      const importSummary: string[] = [];

      // Import staff data
      if (data.staffList) {
        if (updateMode === 'replace') {
          staffStore.setStaffList(data.staffList);
        } else {
          // Merge mode: add new staff and update existing ones
          const existingStaff = staffStore.staffList;
          const mergedStaff = [...existingStaff];
          
          data.staffList.forEach(newStaff => {
            const existingIndex = mergedStaff.findIndex(staff => staff.id === newStaff.id);
            if (existingIndex >= 0) {
              mergedStaff[existingIndex] = newStaff; // Update existing
            } else {
              mergedStaff.push(newStaff); // Add new
            }
          });
          
          staffStore.setStaffList(mergedStaff);
        }
        importSummary.push(`${data.staffList.length} staff members`);
      }

      // Import defined roles
      if (data.definedRoles) {
        if (updateMode === 'replace') {
          staffStore.setDefinedRoles(data.definedRoles);
        } else {
          // Merge mode: combine with existing roles
          const existingRoles = staffStore.definedRoles;
          const mergedRoles = [...new Set([...existingRoles, ...data.definedRoles])];
          staffStore.setDefinedRoles(mergedRoles);
        }
        importSummary.push(`${data.definedRoles.length} defined roles`);
      }

      // Import unavailability data
      if (data.unavailabilityList) {
        if (updateMode === 'replace') {
          unavailabilityStore.setUnavailabilityList(data.unavailabilityList);
        } else {
          // Merge mode: combine with existing unavailability
          const existingUnavail = unavailabilityStore.unavailabilityList;
          const mergedUnavail = [...existingUnavail];
          
          data.unavailabilityList.forEach(newUnavail => {
            const existingIndex = mergedUnavail.findIndex(
              unavail => unavail.employeeId === newUnavail.employeeId && 
                        unavail.dayOfWeek === newUnavail.dayOfWeek
            );
            if (existingIndex >= 0) {
              mergedUnavail[existingIndex] = newUnavail; // Update existing
            } else {
              mergedUnavail.push(newUnavail); // Add new
            }
          });
          
          unavailabilityStore.setUnavailabilityList(mergedUnavail);
        }
        importSummary.push(`${data.unavailabilityList.length} unavailability entries`);
      }

      // Import weekly needs data
      if (data.weeklyNeeds) {
        if (updateMode === 'replace') {
          scheduleStore.setWeeklyNeeds(data.weeklyNeeds);
        } else {
          // Merge mode: combine with existing needs
          const existingNeeds = scheduleStore.weeklyNeeds;
          const mergedNeeds = { ...existingNeeds };
          
          Object.keys(data.weeklyNeeds).forEach(day => {
            if (!mergedNeeds[day]) {
              mergedNeeds[day] = {};
            }
            Object.keys(data.weeklyNeeds![day]).forEach(shift => {
              if (!mergedNeeds[day][shift]) {
                mergedNeeds[day][shift] = {};
              }
              Object.assign(mergedNeeds[day][shift], data.weeklyNeeds![day][shift]);
            });
          });
          
          scheduleStore.setWeeklyNeeds(mergedNeeds);
        }
        const daysCount = Object.keys(data.weeklyNeeds).length;
        importSummary.push(`weekly needs for ${daysCount} days`);
      }

      // Import shift definitions
      if (data.shiftDefinitions) {
        scheduleStore.setShiftDefinitions(data.shiftDefinitions);
        importSummary.push('shift definitions');
      }

      const modeText = updateMode === 'replace' ? 'imported and replaced' : 'imported and merged';
      scheduleStore.showMessage(
        'success',
        'Import Successful',
        `Successfully ${modeText} data:`,
        importSummary
      );
      
      logger.log(`Bulk import completed (${updateMode} mode):`, data);
    } catch (error) {
      scheduleStore.showMessage(
        'error',
        'Import Failed',
        'Failed to import bulk data. Please check the format and try again.',
        [error instanceof Error ? error.message : 'Unknown error occurred']
      );
      logger.error("Bulk import error:", error);
    }
  }, [staffStore, unavailabilityStore, scheduleStore]);

  // --- Drag Drop Upload Handler ---
  const handleDragDropUpload = useCallback((file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      scheduleStore.showMessage(
        'error',
        'Invalid File Type',
        'Please drop a valid JSON file (.json).'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file content.');
        }

        const rawData = JSON.parse(result);
        
        // Only support bulk format - validate and import
        const validation = validateBulkImportData(rawData);
        
        if (validation.isValid) {
          const relationshipWarnings = validateDataRelationships(validation.data);
          validation.warnings.push(...relationshipWarnings);
        }

        if (!validation.isValid) {
          scheduleStore.showMessage(
            'error',
            'Drag & Drop Import Failed', 
            'Invalid bulk data format in JSON file.',
            validation.errors
          );
          return;
        }

        handleBulkImport(validation.data, 'replace');

        logger.log('File imported via drag & drop:', file.name);
        
      } catch (error) {
        scheduleStore.showMessage(
          'error',
          'Drag & Drop Import Failed',
          'Failed to parse JSON file. Please check the file format.',
          [error instanceof Error ? error.message : 'Unknown parsing error']
        );
        logger.error('Drag & drop import error:', error);
      }
    };

    reader.onerror = () => {
      scheduleStore.showMessage(
        'error',
        'File Read Error',
        'Failed to read the dropped file. Please try again.'
      );
    };

    reader.readAsText(file);
  }, [scheduleStore, handleBulkImport]);

  // --- Setup Full Page Drag & Drop Event Listeners ---
  useEffect(() => {
    const handlePageDragEnterWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => prev + 1);
      
      // Check if dragged items contain files
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOverPage(true);
      }
    };

    const handlePageDragLeaveWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragOverPage(false);
        }
        return newCounter;
      });
    };

    const handlePageDragOverWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handlePageDropWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragOverPage(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer?.files || []);
      
      if (files.length === 0) return;

      // Filter for JSON files only
      const jsonFiles = files.filter(file => 
        file.type === 'application/json' || file.name.endsWith('.json')
      );

      if (jsonFiles.length === 0) {
        scheduleStore.showMessage(
          'error',
          'Invalid File Type',
          'Please drop JSON files only (.json).'
        );
        return;
      }

      // Process the first JSON file found
      handleDragDropUpload(jsonFiles[0]);
    };

    // Add event listeners to document
    document.addEventListener('dragenter', handlePageDragEnterWrapper);
    document.addEventListener('dragleave', handlePageDragLeaveWrapper);
    document.addEventListener('dragover', handlePageDragOverWrapper);
    document.addEventListener('drop', handlePageDropWrapper);

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('dragenter', handlePageDragEnterWrapper);
      document.removeEventListener('dragleave', handlePageDragLeaveWrapper);
      document.removeEventListener('dragover', handlePageDragOverWrapper);
      document.removeEventListener('drop', handlePageDropWrapper);
    };
  }, [scheduleStore, handleDragDropUpload]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-2 sm:p-4">
      {/* Full Page Drag & Drop Overlay */}
      {isDragOverPage && (
        <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-blue-50 dark:bg-slate-700/50 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-bounce"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                {t('dragDrop.releaseToUpload')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                {t('dragDrop.dropJsonFile')}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-slate-700/50 border border-blue-200 dark:border-slate-600 rounded-lg">
                <svg
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{t('dragDrop.jsonFilesOnly')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">
            {t('app.title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400 px-2">
            {t('app.subtitle')}
          </p>
          
          {/* Data Overview with Actions */}
          <div className="mt-6">
            <DataOverview
              staffList={staffStore.staffList}
              unavailabilityList={unavailabilityStore.unavailabilityList}
              weeklyNeeds={scheduleStore.weeklyNeeds}
              onBulkExport={handleBulkExport}
              onUniversalImport={handleUniversalImport}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          </div>
        </div>

        {/* Main Tab Interface */}
        <TabGroup>
          <TabList className="grid grid-cols-2 sm:flex sm:space-x-1 gap-1 sm:gap-0 rounded-xl bg-blue-100 dark:bg-slate-800 p-1">
            {[
              { key: "staff", label: t('navigation.staff') },
              { key: "unavailability", label: t('navigation.unavailability') },
              { key: "needs", label: t('navigation.needs') },
              { key: "schedule", label: t('navigation.schedule') }
            ].map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2 sm:py-2.5 text-xs sm:text-sm font-medium leading-5 transition-all duration-200",
                    "ring-blue-500/50 dark:ring-blue-400/50 ring-offset-2 ring-offset-transparent focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "text-blue-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/50 hover:text-blue-800 dark:hover:text-slate-200"
                  )
                }
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels className="mt-4 sm:mt-6">
            {/* Staff Panel */}
            <TabPanel>
              <StaffPanel
                staffList={staffStore.staffList}
                definedRoles={staffStore.definedRoles}
                onAddStaff={handleAddStaff}
                onDeleteStaff={handleDeleteStaff}
                onReorderStaff={staffStore.reorderStaff}
              />
            </TabPanel>

            {/* Unavailability Panel */}
            <TabPanel>
              <UnavailabilityPanel
                staffList={staffStore.staffList}
                unavailabilityList={unavailabilityStore.unavailabilityList}
                onAddUnavailability={handleAddUnavailability}
                onDeleteUnavailability={unavailabilityStore.deleteUnavailability}
              />
            </TabPanel>

            {/* Weekly Needs Panel */}
            <TabPanel>
              <NeedsPanel
                definedRoles={staffStore.definedRoles}
                weeklyNeeds={scheduleStore.weeklyNeeds}
                shiftDefinitions={scheduleStore.shiftDefinitions}
                onUpdateNeeds={scheduleStore.updateWeeklyNeeds}
                onUpdateShiftDefinitions={scheduleStore.setShiftDefinitions}
              />
            </TabPanel>

            {/* Schedule Panel */}
            <TabPanel>
              <div className="space-y-6">
                {/* Schedule Preferences */}
                <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                    {t('schedule.schedulePreferences')}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { value: "PRIORITIZE_FULL_DAYS", label: t('schedule.prioritizeFullDays') },
                      { value: "PRIORITIZE_HALF_DAYS", label: t('schedule.prioritizeHalfDays') },
                      { value: "NONE", label: t('schedule.noPreference') },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="shiftPreference"
                          value={option.value}
                          checked={scheduleStore.shiftPreference === option.value}
                          onChange={(e) =>
                            scheduleStore.setShiftPreference(
                              e.target.value as "PRIORITIZE_FULL_DAYS" | "PRIORITIZE_HALF_DAYS" | "NONE"
                            )
                          }
                          className="mr-3 h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <span className="text-gray-900 dark:text-slate-100">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Generate Schedule Button */}
                <div className="text-center">
                  <button
                    onClick={handleGenerateSchedule}
                    disabled={scheduleStore.isLoading}
                    className="rounded-lg bg-blue-600 dark:bg-blue-500 px-8 py-3 text-white font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 shadow-sm"
                  >
                    {scheduleStore.isLoading ? t('schedule.generating') : t('schedule.generateSchedule')}
                  </button>
                </div>

                {/* Schedule Display */}
                <ScheduleDisplay
                  schedule={scheduleStore.schedule}
                  warnings={scheduleStore.warnings}
                  staffList={staffStore.staffList}
                  shiftDefinitions={scheduleStore.shiftDefinitions}
                />
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
        
        {/* Hidden File Input for Universal Import */}
        <input
          type="file"
          ref={universalImportFileRef}
          accept=".json"
          onChange={handleUniversalImportFileChange}
          style={{ display: 'none' }}
        />
        
        {/* History Panel */}
        <HistoryPanel
          staffList={staffStore.staffList}
          definedRoles={staffStore.definedRoles}
          unavailabilityList={unavailabilityStore.unavailabilityList}
          weeklyNeeds={scheduleStore.weeklyNeeds}
          shiftDefinitions={scheduleStore.shiftDefinitions}
          generatedSchedule={scheduleStore.schedule}
          shiftPreference={scheduleStore.shiftPreference}
          warnings={scheduleStore.warnings}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
        
        {/* Message Modal */}
        <MessageModal
          isOpen={scheduleStore.messageModal.isOpen}
          onClose={scheduleStore.closeMessage}
          type={scheduleStore.messageModal.type}
          title={scheduleStore.messageModal.title}
          message={scheduleStore.messageModal.message}
          details={scheduleStore.messageModal.details}
        />
      </div>
    </div>
  );
}

export default App;