// src/components/UnavailabilityPanel.tsx
import type { StaffMember, Unavailability } from "../types";
import UnavailabilityForm from "./UnavailabilityForm";
import UnavailabilityList from "./UnavailabilityList";
import ImportExportButtons from "./ImportExportButtons";

interface UnavailabilityPanelProps {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  onAddUnavailability: (data: Unavailability) => void;
  onDeleteUnavailability: (employeeId: string, dayOfWeek: string) => void;
  onExportSuccess?: (fileName: string, dataType: string) => void;
  onExportError?: (error: string) => void;
  onNoDataToExport?: (dataType: string) => void;
}

function UnavailabilityPanel({
  staffList,
  unavailabilityList,
  onAddUnavailability,
  onDeleteUnavailability,
  onExportSuccess,
  onExportError,
  onNoDataToExport,
}: UnavailabilityPanelProps) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">
        Staff Unavailability
      </h2>
      <ImportExportButtons
        dataType="Unavailability"
        dataToExport={unavailabilityList}
        onExportSuccess={onExportSuccess}
        onExportError={onExportError}
        onNoDataToExport={() => onNoDataToExport?.('Unavailability')}
        importDisabled={true}
      />
      <UnavailabilityForm
        staffList={staffList}
        onAddUnavailability={onAddUnavailability}
      />
      <UnavailabilityList
        unavailabilityList={unavailabilityList}
        staffList={staffList}
        onDeleteUnavailability={onDeleteUnavailability}
      />
    </div>
  );
}
export default UnavailabilityPanel;
