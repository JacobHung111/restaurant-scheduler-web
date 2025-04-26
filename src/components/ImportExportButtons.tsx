// src/components/ImportExportButtons.tsx
import React, { useRef } from "react";

interface ImportExportButtonsProps<T> {
  dataType: string;
  dataToExport: T;
  onDataImport: (importedData: T) => void;
}

function ImportExportButtons<T>({
  dataType,
  dataToExport,
  onDataImport,
}: ImportExportButtonsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const hasData = Array.isArray(dataToExport)
      ? dataToExport.length > 0
      : typeof dataToExport === "object" &&
        dataToExport !== null &&
        Object.keys(dataToExport).length > 0;

    if (!hasData) {
      alert(`No ${dataType} data available to export.`);
      return;
    }

    try {
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `${dataType
        .toLowerCase()
        .replace(/\s+/g, "_")}_data.json`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log(`${dataType} data exported as ${fileName}`);
    } catch (error) {
      console.error(`Failed to export ${dataType} data:`, error);
      alert(`Failed to export ${dataType} data. See console for details.`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      alert("Please select a valid JSON file (.json).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== "string") {
          throw new Error("Failed to read file content.");
        }
        const importedData = JSON.parse(result);

        if (importedData === null || typeof importedData === "undefined") {
          throw new Error("Imported JSON data is null or undefined.");
        }
        console.log(
          `Successfully parsed imported ${dataType} data:`,
          importedData
        );

        onDataImport(importedData);
        alert(`${dataType} data imported successfully!`);
      } catch (error) {
        console.error(`Failed to import ${dataType} data:`, error);
        const message =
          error instanceof Error
            ? error.message
            : "Unknown error during import.";
        alert(`Failed to import ${dataType} data: ${message}`);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = (e) => {
      console.error("Error reading file:", e);
      alert("Error reading the selected file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="io-buttons border-t border-gray-200 pt-4 mt-4 flex gap-2 flex-wrap">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        type="button"
        onClick={handleImportClick}
        className="io-btn bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
      >
        Import {dataType} (.json)
      </button>
      <button
        type="button"
        onClick={handleExport}
        className="io-btn bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-1 rounded"
      >
        Export {dataType} (.json)
      </button>
    </div>
  );
}

export default ImportExportButtons;
