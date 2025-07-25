// src/components/DataOverview.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import type { StaffMember, Unavailability, WeeklyNeeds } from "../types";

interface DataOverviewProps {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  weeklyNeeds: WeeklyNeeds;
  onBulkExport: () => void;
  onUniversalImport: () => void;
}

function DataOverview({
  staffList,
  unavailabilityList,
  weeklyNeeds,
  onBulkExport,
  onUniversalImport,
}: DataOverviewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Data Statistics */}
        <div className="flex items-center space-x-6">
          <h3 className="text-lg font-medium text-gray-900">Data Overview</h3>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-blue-600">👥</span>
              <span className="text-gray-600">Staff:</span>
              <span className="font-medium text-gray-900">{staffCount}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-orange-600">📅</span>
              <span className="text-gray-600">Unavailable:</span>
              <span className="font-medium text-gray-900">{unavailabilityCount}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-green-600">📋</span>
              <span className="text-gray-600">Needs:</span>
              <span className="font-medium text-gray-900">{needsDaysCount} days</span>
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
          >
            <span className="text-gray-600">⚙️</span>
            <span>Actions</span>
            <ChevronDownIcon 
              className={`h-4 w-4 text-gray-500 transition-transform duration-150 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <button
                  onClick={() => handleAction(onBulkExport)}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="mr-3 text-green-600">📤</span>
                  <div className="text-left">
                    <div className="font-medium">Export All Data</div>
                    <div className="text-xs text-gray-500">
                      Download JSON ({totalDataItems} items)
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleAction(onUniversalImport)}
                  className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span className="mr-3 text-purple-600">📥</span>
                  <div className="text-left">
                    <div className="font-medium">Import Data</div>
                    <div className="text-xs text-gray-500">
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
  );
}

export default DataOverview;