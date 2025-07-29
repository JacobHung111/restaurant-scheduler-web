// src/components/HistoryPanel.tsx
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { 
  ClockIcon, 
  TrashIcon, 
  BookmarkIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import ConfirmDialog from './ConfirmDialog';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useStaffStore } from '../stores/useStaffStore';
import { useUnavailabilityStore } from '../stores/useUnavailabilityStore';
import { useScheduleStore } from '../stores/useScheduleStore';
import { logger } from '../utils/logger';
import type { StaffMember, Unavailability, WeeklyNeeds, Schedule, ShiftDefinitions } from '../types';

interface HistoryPanelProps {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  weeklyNeeds: WeeklyNeeds;
  shiftDefinitions: ShiftDefinitions;
  generatedSchedule: Schedule | null;
  isOpen: boolean;
  onClose: () => void;
}

function HistoryPanel({
  staffList,
  unavailabilityList,
  weeklyNeeds,
  shiftDefinitions,
  generatedSchedule,
  isOpen,
  onClose
}: HistoryPanelProps) {
  const { t } = useTranslation();
  
  const { 
    records, 
    saveRecord, 
    deleteRecord, 
    loadRecord,
    showLimitWarning,
    deleteConfirm,
    editingRecord,
    setShowLimitWarning,
    setDeleteConfirm,
    startEditingRecord,
    updateEditingName,
    cancelEditingRecord,
    saveEditingRecord
  } = useHistoryStore(
    useShallow((state) => ({
      records: state.records,
      saveRecord: state.saveRecord,
      deleteRecord: state.deleteRecord,
      loadRecord: state.loadRecord,
      showLimitWarning: state.showLimitWarning,
      deleteConfirm: state.deleteConfirm,
      editingRecord: state.editingRecord,
      setShowLimitWarning: state.setShowLimitWarning,
      setDeleteConfirm: state.setDeleteConfirm,
      startEditingRecord: state.startEditingRecord,
      updateEditingName: state.updateEditingName,
      cancelEditingRecord: state.cancelEditingRecord,
      saveEditingRecord: state.saveEditingRecord,
    }))
  );

  const { setStaffList, setDefinedRoles } = useStaffStore(
    useShallow((state) => ({
      setStaffList: state.setStaffList,
      setDefinedRoles: state.setDefinedRoles,
    }))
  );

  const { setUnavailabilityList } = useUnavailabilityStore(
    useShallow((state) => ({
      setUnavailabilityList: state.setUnavailabilityList,
    }))
  );

  const { setWeeklyNeeds, setGeneratedSchedule, setShiftDefinitions, showMessage } = useScheduleStore(
    useShallow((state) => ({
      setWeeklyNeeds: state.setWeeklyNeeds,
      setGeneratedSchedule: state.setGeneratedSchedule,
      setShiftDefinitions: state.setShiftDefinitions,
      showMessage: state.showMessage,
    }))
  );

  const handleSaveRecord = () => {
    if (!generatedSchedule) {
      showMessage('error', t('history.saveFailed'), t('history.noScheduleAvailable'));
      return;
    }
    
    const result = saveRecord(
      staffList,
      unavailabilityList,
      weeklyNeeds,
      shiftDefinitions,
      generatedSchedule
    );

    if (result.success) {
      showMessage('success', t('history.recordSaved'), t('history.recordSavedSuccess'));
    } else if (result.isLimitReached) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 5000);
      showMessage('warning', t('history.storageLimitReached'), result.error || t('history.deleteOldRecordsMessage'));
    } else {
      showMessage('error', t('history.saveFailed'), result.error || t('history.recordSavedSuccess'));
    }
  };

  const handleDeleteRecord = (id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    const result = deleteRecord(deleteConfirm.id);
    
    if (result.success) {
      showMessage('success', t('history.recordDeleted'), t('history.recordDeletedSuccess', { name: deleteConfirm.name }));
    } else {
      showMessage('error', t('history.deleteFailed'), result.error || t('history.deleteFailedMessage'));
    }
    
    setDeleteConfirm({ isOpen: false, id: '', name: '' });
  };

  const handleLoadRecord = (id: string) => {
    const result = loadRecord(id);
    
    if (result.success && result.record) {
      const { data } = result.record;
      
      // 載入所有數據到對應的 stores
      setStaffList(data.staffList);
      setUnavailabilityList(data.unavailabilityList);
      setWeeklyNeeds(data.weeklyNeeds);
      setShiftDefinitions(data.shiftDefinitions);
      setGeneratedSchedule(data.generatedSchedule);
      
      // 更新定義的角色
      const allRoles = [...new Set(
        data.staffList.flatMap(staff => staff.assignedRolesInPriority)
      )];
      setDefinedRoles(allRoles);

      showMessage('success', t('history.recordLoaded'), t('history.recordLoadedSuccess', { name: result.record.name }));
      logger.log('History record loaded:', result.record.name);
    } else {
      showMessage('error', t('history.loadFailed'), result.error || t('history.loadFailedMessage'));
    }
  };

  const handleEditRecord = (id: string, currentName: string) => {
    startEditingRecord(id, currentName);
  };

  const handleSaveEdit = () => {
    const result = saveEditingRecord();
    if (result.success) {
      showMessage('success', t('history.recordRenamed'), t('history.recordRenamedSuccess'));
    }
    // Note: Error handling is done in the store and displayed inline
  };

  const handleCancelEdit = () => {
    cancelEditingRecord();
  };

  const handleEditNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateEditingName(e.target.value);
  };

  const canSave = generatedSchedule && Object.keys(generatedSchedule).length > 0;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                  <DialogTitle className="text-lg font-medium text-gray-900 dark:text-slate-100">
                    {t('history.title')}
                  </DialogTitle>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {records.length}/3
                  </span>
                  <button
                    onClick={onClose}
                    className="p-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
              <button
                onClick={handleSaveRecord}
                disabled={!canSave}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${canSave
                    ? 'bg-indigo-600 dark:bg-blue-600 text-white hover:bg-indigo-700 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-blue-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <BookmarkIcon className="w-4 h-4" />
                <span>{t('history.saveCurrentState')}</span>
              </button>
              
              {!canSave && (
                <p className="mt-2 text-xs text-gray-500 dark:text-slate-400 text-center">
                  {t('history.generateScheduleFirst')}
                </p>
              )}

              {/* Limit Warning */}
              {showLimitWarning && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium">{t('history.storageLimitReached')}</p>
                      <p>{t('history.deleteOldRecordsMessage')}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Records List */}
            <div className="flex-1 overflow-y-auto">
              {records.length === 0 ? (
                <div className="p-6 text-center">
                  <ClockIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {t('history.noHistoryRecords')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    {t('history.generateAndSaveMessage')}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {records.map((record) => {
                    const isEditing = editingRecord?.id === record.id;
                    
                    return (
                      <div
                        key={record.id}
                        className="p-3 mb-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                      >
                        {isEditing ? (
                          /* Editing Mode */
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editingRecord.tempName}
                                onChange={handleEditNameChange}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-400"
                                placeholder={t('history.enterRecordName')}
                                autoFocus
                              />
                              <button
                                onClick={handleSaveEdit}
                                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                                title={t('history.saveChanges')}
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-1.5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-slate-400"
                                title={t('history.cancelEditing')}
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {editingRecord.error && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {editingRecord.error}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 dark:text-slate-400">
                              {record.data.staffList.length} {t('history.staff')}, {record.data.unavailabilityList.length} {t('history.constraints')}
                            </div>
                          </div>
                        ) : (
                          /* Display Mode */
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleLoadRecord(record.id)}
                              className="flex-1 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-blue-400 rounded"
                            >
                              <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                                {record.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                {record.data.staffList.length} {t('history.staff')}, {record.data.unavailabilityList.length} {t('history.constraints')}
                              </div>
                            </button>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditRecord(record.id, record.name)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                                title={t('history.editRecord', { name: record.name })}
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecord(record.id, record.name)}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                                title={t('history.deleteRecord', { name: record.name })}
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Info */}
            {records.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30 rounded-b-xl flex-shrink-0">
                <p className="text-xs text-gray-500 dark:text-slate-400 text-center">
                  {t('history.clickToLoadOrDelete')}
                </p>
              </div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '', name: '' })}
        onConfirm={confirmDelete}
        title={t('history.deleteHistoryRecord')}
        message={t('history.confirmDeleteMessage', { name: deleteConfirm.name })}
        confirmText={t('history.deleteCta')}
        cancelText={t('history.cancel')}
        type="danger"
      />
    </>
  );
}

export default HistoryPanel;