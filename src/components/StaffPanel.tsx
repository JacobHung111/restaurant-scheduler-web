// src/components/StaffPanel.tsx
import React, { useState } from "react";
import type { StaffMember } from "../types";
import StaffForm from "./StaffForm";
import StaffList from "./StaffList";
import { useTranslation } from 'react-i18next';
import { useStaffStore } from "../stores/useStaffStore";
import { useShallow } from "zustand/react/shallow";

interface StaffPanelProps {
  staffList: StaffMember[];
  definedRoles: string[];
  onAddStaff: (data: Omit<StaffMember, "id">) => void;
  onDeleteStaff: (id: string) => void;
  onReorderStaff: (list: StaffMember[]) => void;
  onExportSuccess?: (fileName: string, dataType: string) => void;
  onExportError?: (error: string) => void;
  onNoDataToExport?: (dataType: string) => void;
}

interface StaffManagementExportData {
  staffList: StaffMember[];
  definedRoles: string[];
}

// RoleManager component integrated into StaffPanel
function RoleManager() {
  const { t } = useTranslation();
  const { definedRoles, addRole, deleteRole } = useStaffStore(
    useShallow((state) => ({
      definedRoles: state.definedRoles,
      addRole: state.addRole,
      deleteRole: state.deleteRole,
    }))
  );
  const [newRoleName, setNewRoleName] = useState("");

  const handleAddSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addRole(newRoleName);
    setNewRoleName("");
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-slate-100">{t('roles.manageRoles')}</h3>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          {t('roles.currentRoles')}
        </h4>
        {definedRoles.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400 italic">{t('roles.noRolesDefined')}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {definedRoles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800"
              >
                {role}
                <button
                  onClick={() => deleteRole(role)}
                  className="ml-2 flex-shrink-0 p-0.5 rounded-full inline-flex items-center justify-center text-blue-600 dark:text-blue-400 hover:bg-red-200 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                  aria-label={t('roles.deleteRole', { role })}
                >
                  <svg
                    className="h-3 w-3"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 8 8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.5"
                      d="M1 1l6 6m0-6L1 7"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <form
        onSubmit={handleAddSubmit}
        className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-slate-600"
      >
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder={t('roles.enterNewRoleName')}
          className="flex-grow block w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-green-400 transition-all duration-200"
        >
          {t('roles.add')}
        </button>
      </form>
    </div>
  );
}

function StaffPanel({
  staffList,
  definedRoles,
  onAddStaff,
  onDeleteStaff,
  onReorderStaff,
  onExportSuccess,
  onExportError,
  onNoDataToExport,
}: StaffPanelProps) {
  const { t } = useTranslation();
  
  // Create export data that includes both staffList and definedRoles
  const exportData: StaffManagementExportData = {
    staffList,
    definedRoles,
  };

  // Check if there's data to export
  const hasDataToExport = staffList.length > 0 || definedRoles.length > 0;

  const handleExport = () => {
    if (!hasDataToExport) {
      onNoDataToExport?.(t('staff.management'));
      return;
    }

    try {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `${t('staff.management')
        .toLowerCase()
        .replace(/\s+/g, "_")}_data.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onExportSuccess?.(fileName, t('staff.management'));
    } catch (error) {
      onExportError?.(error instanceof Error ? error.message : 'Unknown export error');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">
        {t('staff.management')}
      </h2>
      
      {/* Custom export button */}
      <div className="io-buttons border-b border-gray-200 dark:border-slate-600 pb-4 mb-4 flex gap-3 flex-wrap items-center">
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-gray-600 dark:bg-slate-600 hover:bg-gray-700 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-slate-400 transition-all duration-200"
        >
          {t('importExport.export', { dataType: t('staff.management') })}
        </button>
      </div>

      {/* Integrated Role Manager */}
      <RoleManager />
      
      <StaffForm definedRoles={definedRoles} onAddStaff={onAddStaff} />
      <StaffList
        staffList={staffList}
        onDeleteStaff={onDeleteStaff}
        onReorderStaff={onReorderStaff}
      />
    </div>
  );
}
export default StaffPanel;
