// src/components/DataOverview.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ClockIcon } from "@heroicons/react/24/outline";
import type { StaffMember, Unavailability, WeeklyNeeds } from "../types";
import ThemeToggle from "./ThemeToggle";

interface DataOverviewProps {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  weeklyNeeds: WeeklyNeeds;
  onBulkExport: () => void;
  onUniversalImport: () => void;
  onOpenHistory: () => void;
}

function DataOverview({
  staffList,
  unavailabilityList,
  weeklyNeeds,
  onBulkExport,
  onUniversalImport,
  onOpenHistory,
}: DataOverviewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileContainer = mobileDropdownRef.current;
      const desktopContainer = desktopDropdownRef.current;
      
      if (
        isDropdownOpen &&
        mobileContainer &&
        desktopContainer &&
        !mobileContainer.contains(event.target as Node) &&
        !desktopContainer.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsDropdownOpen(false);
  };

  // Calculate statistics
  const staffCount = staffList.length;
  const unavailabilityCount = unavailabilityList.length;
  const needsDaysCount = Object.keys(weeklyNeeds).length;
  const totalDataItems = staffCount + unavailabilityCount + (needsDaysCount > 0 ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 sm:p-6 mb-6">
      {/* Mobile Layout - Stack vertically */}
      <div className="flex flex-col space-y-4 sm:hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Data Overview</h3>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={onOpenHistory}
              className="flex items-center justify-center w-[36px] h-[36px] text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
              title="History"
            >
              <ClockIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Statistics - Grid layout on mobile */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col items-center space-y-1 p-2 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-slate-400">Staff</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{staffCount}</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1 p-2 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-slate-400">Unavailable</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{unavailabilityCount}</span>
          </div>
          
          <div className="flex flex-col items-center space-y-1 p-2 bg-gray-50 dark:bg-slate-700/30 rounded-lg">
            <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
            <span className="text-xs text-gray-600 dark:text-slate-400">Needs</span>
            <span className="font-semibold text-gray-900 dark:text-slate-100">{needsDaysCount} days</span>
          </div>
        </div>
        
        {/* Actions dropdown - Full width on mobile */}
        <div className="relative" ref={mobileDropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
          >
            <svg className="w-4 h-4 text-gray-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            <span>Actions</span>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 focus:outline-none z-10">
              <div className="p-1">
                <button
                  onClick={() => handleAction(onBulkExport)}
                  className="group flex w-full items-center px-3 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Export All Data</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      Download JSON ({totalDataItems} items)
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleAction(onUniversalImport)}
                  className="group flex w-full items-center px-3 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Import Data</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      Bulk or individual JSON files
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - Original horizontal layout */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Data Statistics */}
        <div className="flex items-center space-x-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Data Overview</h3>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Staff:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">{staffCount}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Unavailable:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">{unavailabilityCount}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Needs:</span>
              <span className="font-semibold text-gray-900 dark:text-slate-100">{needsDaysCount} days</span>
            </div>
          </div>
        </div>

        {/* Actions and Theme Toggle */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
            title="Open History"
          >
            <ClockIcon className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            <span>History</span>
          </button>
          
          <div className="relative" ref={desktopDropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <span>Actions</span>
              <ChevronDownIcon 
                className={`h-4 w-4 text-gray-500 dark:text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 focus:outline-none z-10">
                <div className="p-1">
                  <button
                    onClick={() => handleAction(onBulkExport)}
                    className="group flex w-full items-center px-3 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Export All Data</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Download JSON ({totalDataItems} items)
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handleAction(onUniversalImport)}
                    className="group flex w-full items-center px-3 py-3 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-100 rounded-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Import Data</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        Bulk or individual JSON files
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataOverview;