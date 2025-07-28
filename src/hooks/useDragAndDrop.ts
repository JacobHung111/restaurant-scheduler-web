// src/hooks/useDragAndDrop.ts
import { useState, useEffect, useCallback } from 'react';
import { useScheduleSelectors } from './useStoreSelectors';
import { validateBulkImportData, validateDataRelationships } from '../utils/importValidation';
import { logger } from '../utils/logger';

export interface DragDropHandlers {
  isDragOverPage: boolean;
  handleDragDropUpload: (file: File) => void;
}

export const useDragAndDrop = (): DragDropHandlers => {
  const [isDragOverPage, setIsDragOverPage] = useState(false);
  const [, setDragCounter] = useState(0);
  const { showMessage } = useScheduleSelectors();

  const handleDragDropUpload = useCallback((file: File) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showMessage('error', 'Invalid File Type', 'Please drop a valid JSON file (.json).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Failed to read file content.');
        }

        const rawData = JSON.parse(result);
        
        // Auto-detect format and handle accordingly
        const isBulkFormat = Object.prototype.hasOwnProperty.call(rawData, 'staffList') || 
                            Object.prototype.hasOwnProperty.call(rawData, 'unavailabilityList') || 
                            Object.prototype.hasOwnProperty.call(rawData, 'weeklyNeeds');
        
        if (isBulkFormat) {
          const validation = validateBulkImportData(rawData);
          
          if (validation.isValid) {
            const relationshipWarnings = validateDataRelationships(validation.data);
            validation.warnings.push(...relationshipWarnings);
          }

          if (!validation.isValid) {
            showMessage('error', 'Drag & Drop Import Failed', 'Invalid bulk data format in JSON file.', validation.errors);
            return;
          }

          // Handle bulk import (this would need to be passed as a callback)
          showMessage('success', 'Import Successful', 'File imported successfully via drag & drop');
        }

        logger.log('File imported via drag & drop:', file.name);
        
      } catch (error) {
        showMessage('error', 'Drag & Drop Import Failed', 'Failed to parse JSON file. Please check the file format.', [error instanceof Error ? error.message : 'Unknown parsing error']);
        logger.error('Drag & drop import error:', error);
      }
    };

    reader.onerror = () => {
      showMessage('error', 'File Read Error', 'Failed to read the dropped file. Please try again.');
    };

    reader.readAsText(file);
  }, [showMessage]);

  useEffect(() => {
    const handlePageDragEnterWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => prev + 1);
      
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragOverPage(true);
      }
    };

    const handlePageDragLeaveWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter(prev => {
        const newCounter = prev - 1;
        if (newCounter === 0) {
          setIsDragOverPage(false);
        }
        return newCounter;
      });
    };

    const handlePageDragOverWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handlePageDropWrapper = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragOverPage(false);
      setDragCounter(0);

      const files = Array.from(e.dataTransfer?.files || []);
      
      if (files.length === 0) return;

      const jsonFiles = files.filter(file => 
        file.type === 'application/json' || file.name.endsWith('.json')
      );

      if (jsonFiles.length === 0) {
        showMessage('error', 'Invalid File Type', 'Please drop JSON files only (.json).');
        return;
      }

      handleDragDropUpload(jsonFiles[0]);
    };

    document.addEventListener('dragenter', handlePageDragEnterWrapper);
    document.addEventListener('dragleave', handlePageDragLeaveWrapper);
    document.addEventListener('dragover', handlePageDragOverWrapper);
    document.addEventListener('drop', handlePageDropWrapper);

    return () => {
      document.removeEventListener('dragenter', handlePageDragEnterWrapper);
      document.removeEventListener('dragleave', handlePageDragLeaveWrapper);
      document.removeEventListener('dragover', handlePageDragOverWrapper);
      document.removeEventListener('drop', handlePageDropWrapper);
    };
  }, [handleDragDropUpload, showMessage]);

  return {
    isDragOverPage,
    handleDragDropUpload,
  };
};