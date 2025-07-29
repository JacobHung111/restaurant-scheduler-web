// src/components/UnavailabilityPanel.tsx
import type { StaffMember, Unavailability } from "../types";
import UnavailabilityForm from "./UnavailabilityForm";
import UnavailabilityList from "./UnavailabilityList";
import ImportExportButtons from "./ImportExportButtons";
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">
        {t('unavailability.staffUnavailability')}
      </h2>
      <ImportExportButtons
        dataType={t('unavailability.management')}
        dataToExport={unavailabilityList}
        onExportSuccess={onExportSuccess}
        onExportError={onExportError}
        onNoDataToExport={() => onNoDataToExport?.(t('unavailability.management'))}
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
