import type { WeeklyNeeds } from "../types";
import NeedsInputGrid from "./NeedsInputGrid";
import ImportExportButtons from "./ImportExportButtons";

interface NeedsPanelProps {
  weeklyNeeds: WeeklyNeeds;
  onNeedsChange: (
    day: string,
    shiftKey: string,
    role: string,
    count: number
  ) => void;
  onImportNeeds: (data: any) => void;
  onClearNeeds: () => void;
}

function NeedsPanel({
  weeklyNeeds,
  onNeedsChange,
  onImportNeeds,
  onClearNeeds,
}: NeedsPanelProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Weekly Needs</h2>
      <ImportExportButtons
        dataType="Weekly Needs"
        dataToExport={weeklyNeeds}
        onDataImport={onImportNeeds}
      />
      <button
        type="button"
        onClick={onClearNeeds}
        className="mb-4 text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
      >
        Clear All Needs
      </button>
      <NeedsInputGrid weeklyNeeds={weeklyNeeds} onNeedsChange={onNeedsChange} />
    </div>
  );
}
export default NeedsPanel;
