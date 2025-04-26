import type { StaffMember, Unavailability } from "../types";
import UnavailabilityForm from "./UnavailabilityForm";
import UnavailabilityList from "./UnavailabilityList";
import ImportExportButtons from "./ImportExportButtons";

interface UnavailabilityPanelProps {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  onAddUnavailability: (data: Unavailability) => void;
  onDeleteUnavailability: (employeeId: string, dayOfWeek: string) => void;
  onImportUnavailability: (data: any) => void;
}

function UnavailabilityPanel({
  staffList,
  unavailabilityList,
  onAddUnavailability,
  onDeleteUnavailability,
  onImportUnavailability,
}: UnavailabilityPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Staff Unavailability
      </h2>
      <ImportExportButtons
        dataType="Unavailability"
        dataToExport={unavailabilityList}
        onDataImport={onImportUnavailability}
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
