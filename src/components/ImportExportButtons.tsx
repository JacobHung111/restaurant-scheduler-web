// src/components/ImportExportButtons.tsx
import React, { useRef } from "react";
import { logger } from "../utils/logger";

interface ImportExportButtonsProps<T> {
  dataType: string;
  dataToExport: T;
  onDataImport?: (importedData: T) => void;
  onExportSuccess?: (fileName: string, dataType: string) => void;
  onExportError?: (error: string) => void;
  onNoDataToExport?: () => void;
  importDisabled?: boolean;
}

function ImportExportButtons<T>({
  dataType,
  dataToExport,
  onDataImport,
  onExportSuccess,
  onExportError,
  onNoDataToExport,
  importDisabled = false,
}: ImportExportButtonsProps<T>) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const hasData = Array.isArray(dataToExport)
      ? dataToExport.length > 0
      : typeof dataToExport === "object" &&
        dataToExport !== null &&
        Object.keys(dataToExport).length > 0;

    if (!hasData) {
      onNoDataToExport?.();
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
      logger.log(`${dataType} data exported as ${fileName}`);
      onExportSuccess?.(fileName, dataType);
    } catch (error) {
      logger.error(`Failed to export ${dataType} data:`, error);
      onExportError?.(error instanceof Error ? error.message : 'Unknown export error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      // File type validation is now handled by parent component
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
        logger.log(
          `Successfully parsed imported ${dataType} data:`,
          importedData
        );

        onDataImport?.(importedData);
      } catch (error) {
        logger.error(`Failed to import ${dataType} data:`, error);
        // Error handling is now done by parent component through MessageModal
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = (e) => {
      logger.error("Error reading file:", e);
      // File reading error is now handled by parent component
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <div className="io-buttons border-b border-gray-200 pb-4 mb-4 flex gap-3 flex-wrap items-center">
      {" "}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {!importDisabled && (
        <button
          type="button"
          onClick={handleImportClick}
          className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 transition ease-in-out duration-150"
        >
          Import {dataType} (.json)
        </button>
      )}
      <button
        type="button"
        onClick={handleExport}
        className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 transition ease-in-out duration-150"
      >
        Export {dataType} (.json)
      </button>
    </div>
  );
}

export default ImportExportButtons;
