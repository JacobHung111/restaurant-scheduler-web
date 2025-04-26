import type { StaffMember } from "../types";
import StaffForm from "./StaffForm";
import StaffList from "./StaffList";
import ImportExportButtons from "./ImportExportButtons";

interface StaffPanelProps {
  staffList: StaffMember[];
  onAddStaff: (data: Omit<StaffMember, "id">) => void;
  onDeleteStaff: (id: string) => void;
  onReorderStaff: (list: StaffMember[]) => void;
  onImportStaff: (data: any) => void;
}

function StaffPanel({
  staffList,
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
      <StaffForm onAddStaff={onAddStaff} />
      <StaffList
        staffList={staffList}
        onDeleteStaff={onDeleteStaff}
        onReorderStaff={onReorderStaff}
      />
    </div>
  );
}
export default StaffPanel;
