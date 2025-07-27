// src/components/ConfirmDialog.tsx
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
      case 'danger':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 dark:text-yellow-300" />;
      case 'info':
        return <ExclamationTriangleIcon className="h-6 w-6 text-blue-400 dark:text-blue-300" />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 focus:ring-red-500 dark:focus:ring-red-400';
      case 'warning':
        return 'bg-yellow-600 dark:bg-yellow-600 hover:bg-yellow-700 dark:hover:bg-yellow-700 focus:ring-yellow-500 dark:focus:ring-yellow-400';
      case 'info':
        return 'bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 focus:ring-blue-500 dark:focus:ring-blue-400';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="p-6">
            {/* Icon and Title */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-yellow-50 dark:bg-yellow-900/20">
                  {getIcon()}
                </div>
              </div>
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-slate-100">
                {title}
              </DialogTitle>
            </div>

            {/* Message */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-slate-400 transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${getConfirmButtonColor()}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;