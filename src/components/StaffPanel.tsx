// src/components/StaffPanel.tsx
import type { StaffMember } from "../types";
import StaffForm from "./StaffForm";
import StaffList from "./StaffList";
import ImportExportButtons from "./ImportExportButtons";

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
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">
        Staff Management
      </h2>
      <ImportExportButtons
        dataType="Staff"
        dataToExport={staffList}
        onExportSuccess={onExportSuccess}
        onExportError={onExportError}
        onNoDataToExport={() => onNoDataToExport?.('Staff')}
        importDisabled={true}
      />
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
