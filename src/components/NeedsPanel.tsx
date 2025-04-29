// src/components/NeedsPanel.tsx
import type { WeeklyNeeds } from "../types";
import NeedsInputGrid from "./NeedsInputGrid";
import ImportExportButtons from "./ImportExportButtons";

interface NeedsPanelProps {
  weeklyNeeds: WeeklyNeeds;
  definedRoles: string[];
  onNeedsChange: (
    day: string,
    shiftKey: string,
    role: string,
    count: number
  ) => void;
  onImportNeeds: (data: any) => void;
}

function NeedsPanel({
  weeklyNeeds,
  definedRoles,
  onNeedsChange,
  onImportNeeds,
}: NeedsPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Weekly Needs</h2>
      <ImportExportButtons
        dataType="Weekly Needs"
        dataToExport={weeklyNeeds}
        onDataImport={onImportNeeds}
      />
      <NeedsInputGrid
        definedRoles={definedRoles}
        weeklyNeeds={weeklyNeeds}
        onNeedsChange={onNeedsChange}
      />
    </div>
  );
}
export default NeedsPanel;
