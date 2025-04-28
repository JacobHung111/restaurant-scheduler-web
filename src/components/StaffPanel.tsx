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
  onImportStaff: (data: any) => void;
}

function StaffPanel({
  staffList,
  definedRoles,
  onAddStaff,
  onDeleteStaff,
  onReorderStaff,
  onImportStaff,
}: StaffPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Staff Management
      </h2>
      <ImportExportButtons
        dataType="Staff"
        dataToExport={staffList}
        onDataImport={onImportStaff}
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
