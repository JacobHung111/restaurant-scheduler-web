// src/stores/useHistoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StaffMember, Unavailability, WeeklyNeeds, Schedule, ShiftDefinitions } from '../types';
import { logger } from '../utils/logger';

export interface HistoryRecord {
  id: string;
  name: string; // 日期時間格式的名稱
  timestamp: number;
  data: {
    staffList: StaffMember[];
    unavailabilityList: Unavailability[];
    weeklyNeeds: WeeklyNeeds;
    shiftDefinitions: ShiftDefinitions;
    generatedSchedule: Schedule;
  };
}

interface HistoryState {
  records: HistoryRecord[];
  
  // UI State
  showLimitWarning: boolean;
  deleteConfirm: { isOpen: boolean; id: string; name: string };
  editingRecord: { id: string; tempName: string; error?: string } | null;
  
  // Actions
  saveRecord: (
    staffList: StaffMember[],
    unavailabilityList: Unavailability[],
    weeklyNeeds: WeeklyNeeds,
    shiftDefinitions: ShiftDefinitions,
    generatedSchedule: Schedule
  ) => { success: boolean; error?: string; isLimitReached?: boolean };
  deleteRecord: (id: string) => { success: boolean; error?: string };
  loadRecord: (id: string) => { success: boolean; error?: string; record?: HistoryRecord };
  renameRecord: (id: string, newName: string) => { success: boolean; error?: string };
  clearAllRecords: () => { success: boolean; error?: string };
  
  // UI Actions
  setShowLimitWarning: (show: boolean) => void;
  setDeleteConfirm: (config: { isOpen: boolean; id: string; name: string }) => void;
  startEditingRecord: (id: string, currentName: string) => void;
  updateEditingName: (tempName: string) => void;
  cancelEditingRecord: () => void;
  saveEditingRecord: () => { success: boolean; error?: string };
}

const MAX_RECORDS = 3;

// 驗證記錄名稱
const validateRecordName = (name: string, existingNames: string[]): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Record name cannot be empty.' };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Record name must be at least 2 characters long.' };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Record name cannot exceed 50 characters.' };
  }
  
  // Check for invalid characters (basic validation)
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(trimmedName)) {
    return { isValid: false, error: 'Record name contains invalid characters.' };
  }
  
  // Check for duplicate names
  const isDuplicate = existingNames.some(existingName => 
    existingName.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (isDuplicate) {
    return { isValid: false, error: 'A record with this name already exists.' };
  }
  
  return { isValid: true };
};

// 生成日期時間格式的名稱
const generateRecordName = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],
      
      // UI State
      showLimitWarning: false,
      deleteConfirm: { isOpen: false, id: '', name: '' },
      editingRecord: null,

      saveRecord: (staffList, unavailabilityList, weeklyNeeds, shiftDefinitions, generatedSchedule) => {
        try {
          const currentRecords = get().records;
          
          // 檢查是否達到最大記錄數量
          if (currentRecords.length >= MAX_RECORDS) {
            logger.log('History save blocked: maximum records reached');
            return { 
              success: false, 
              error: `Maximum ${MAX_RECORDS} records allowed. Please delete old records first.`,
              isLimitReached: true 
            };
          }

          // 驗證必要數據
          if (!generatedSchedule || Object.keys(generatedSchedule).length === 0) {
            return { 
              success: false, 
              error: 'Cannot save: No schedule has been generated yet.' 
            };
          }

          const now = Date.now();
          const newRecord: HistoryRecord = {
            id: `history_${now}`,
            name: generateRecordName(),
            timestamp: now,
            data: {
              staffList: [...staffList],
              unavailabilityList: [...unavailabilityList],
              weeklyNeeds: { ...weeklyNeeds },
              shiftDefinitions: { ...shiftDefinitions },
              generatedSchedule: { ...generatedSchedule }
            }
          };

          set(state => ({
            records: [...state.records, newRecord].sort((a, b) => b.timestamp - a.timestamp)
          }));

          logger.log('History record saved successfully:', newRecord.name);
          return { success: true };

        } catch (error) {
          logger.error('Failed to save history record:', error);
          return { 
            success: false, 
            error: 'Failed to save record. Please try again.' 
          };
        }
      },

      deleteRecord: (id) => {
        try {
          const currentRecords = get().records;
          const recordToDelete = currentRecords.find(record => record.id === id);
          
          if (!recordToDelete) {
            return { 
              success: false, 
              error: 'Record not found.' 
            };
          }

          set(state => ({
            records: state.records.filter(record => record.id !== id)
          }));

          logger.log('History record deleted successfully:', recordToDelete.name);
          return { success: true };

        } catch (error) {
          logger.error('Failed to delete history record:', error);
          return { 
            success: false, 
            error: 'Failed to delete record. Please try again.' 
          };
        }
      },

      loadRecord: (id) => {
        try {
          const record = get().records.find(r => r.id === id);
          
          if (!record) {
            return { 
              success: false, 
              error: 'Record not found.' 
            };
          }

          logger.log('History record loaded successfully:', record.name);
          return { success: true, record };

        } catch (error) {
          logger.error('Failed to load history record:', error);
          return { 
            success: false, 
            error: 'Failed to load record. Please try again.' 
          };
        }
      },

      renameRecord: (id, newName) => {
        try {
          const currentRecords = get().records;
          const recordIndex = currentRecords.findIndex(record => record.id === id);
          
          if (recordIndex === -1) {
            return { 
              success: false, 
              error: 'Record not found.' 
            };
          }

          const existingNames = currentRecords
            .filter(record => record.id !== id)
            .map(record => record.name);
          
          const validation = validateRecordName(newName, existingNames);
          if (!validation.isValid) {
            return { 
              success: false, 
              error: validation.error || 'Invalid name.' 
            };
          }

          const updatedRecords = [...currentRecords];
          updatedRecords[recordIndex] = {
            ...updatedRecords[recordIndex],
            name: newName.trim()
          };

          set({ records: updatedRecords });
          logger.log('History record renamed successfully:', newName);
          return { success: true };

        } catch (error) {
          logger.error('Failed to rename history record:', error);
          return { 
            success: false, 
            error: 'Failed to rename record. Please try again.' 
          };
        }
      },

      clearAllRecords: () => {
        try {
          set({ records: [] });
          logger.log('All history records cleared');
          return { success: true };

        } catch (error) {
          logger.error('Failed to clear history records:', error);
          return { 
            success: false, 
            error: 'Failed to clear records. Please try again.' 
          };
        }
      },

      // UI Actions
      setShowLimitWarning: (show) => {
        set({ showLimitWarning: show });
      },

      setDeleteConfirm: (config) => {
        set({ deleteConfirm: config });
      },

      startEditingRecord: (id, currentName) => {
        set({ editingRecord: { id, tempName: currentName, error: undefined } });
      },

      updateEditingName: (tempName) => {
        set((state) => ({
          editingRecord: state.editingRecord ? {
            ...state.editingRecord,
            tempName,
            error: undefined
          } : null
        }));
      },

      cancelEditingRecord: () => {
        set({ editingRecord: null });
      },

      saveEditingRecord: () => {
        try {
          const editingRecord = get().editingRecord;
          if (!editingRecord) {
            return { success: false, error: 'No record being edited.' };
          }

          const currentRecords = get().records;
          const existingNames = currentRecords
            .filter(record => record.id !== editingRecord.id)
            .map(record => record.name);
          
          const validation = validateRecordName(editingRecord.tempName, existingNames);
          if (!validation.isValid) {
            set((state) => ({
              editingRecord: state.editingRecord ? {
                ...state.editingRecord,
                error: validation.error
              } : null
            }));
            return { success: false, error: validation.error || 'Invalid name.' };
          }

          const renameResult = get().renameRecord(editingRecord.id, editingRecord.tempName);
          if (renameResult.success) {
            set({ editingRecord: null });
          }
          
          return renameResult;

        } catch (error) {
          logger.error('Failed to save edited record:', error);
          return { 
            success: false, 
            error: 'Failed to save changes. Please try again.' 
          };
        }
      }
    }),
    {
      name: 'restaurant-scheduler-history',
      version: 1,
    }
  )
);