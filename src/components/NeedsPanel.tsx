// src/components/NeedsPanel.tsx
import type { WeeklyNeeds } from "../types";
import { useTranslation } from 'react-i18next';
import NeedsInputGrid from "./NeedsInputGrid";
import ImportExportButtons from "./ImportExportButtons";

interface NeedsPanelProps {
  weeklyNeeds: WeeklyNeeds;
  definedRoles: string[];
  onUpdateNeeds: (
    day: string,
    shiftKey: string,
    role: string,
    count: number
  ) => void;
  onExportSuccess?: (fileName: string, dataType: string) => void;
  onExportError?: (error: string) => void;
  onNoDataToExport?: (dataType: string) => void;
}

function NeedsPanel({
  weeklyNeeds,
  definedRoles,
  onUpdateNeeds,
  onExportSuccess,
  onExportError,
  onNoDataToExport,
}: NeedsPanelProps) {
  const { t } = useTranslation();
  
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-slate-100">{t('needs.weeklyNeeds')}</h2>
      <ImportExportButtons
        dataType={t('needs.weeklyNeeds')}
        dataToExport={weeklyNeeds}
        onExportSuccess={onExportSuccess}
        onExportError={onExportError}
        onNoDataToExport={() => onNoDataToExport?.(t('needs.weeklyNeeds'))}
        importDisabled={true}
      />
      <NeedsInputGrid
        definedRoles={definedRoles}
        weeklyNeeds={weeklyNeeds}
        onNeedsChange={onUpdateNeeds}
      />
    </div>
  );
}
export default NeedsPanel;
