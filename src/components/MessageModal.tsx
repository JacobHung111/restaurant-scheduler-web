// src/components/MessageModal.tsx
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

export type MessageType = 'success' | 'warning' | 'error';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MessageType;
  title: string;
  message: string;
  details?: string[];
}

function MessageModal({ isOpen, onClose, type, title, message, details }: MessageModalProps) {
  const { t } = useTranslation();
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400 dark:text-green-300" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 dark:text-yellow-300" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400 dark:text-red-300" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          title: 'text-green-800 dark:text-green-300',
          text: 'text-green-700 dark:text-green-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          title: 'text-yellow-800 dark:text-yellow-300',
          text: 'text-yellow-700 dark:text-yellow-400'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          title: 'text-red-800 dark:text-red-300',
          text: 'text-red-700 dark:text-red-400'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                {title}
              </DialogTitle>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl ${colors.bg} ${colors.border} border`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`font-medium ${colors.title} mb-2`}>
                    {message}
                  </h3>
                  {details && details.length > 0 && (
                    <ul className={`text-sm ${colors.text} space-y-1`}>
                      {details.map((detail, index) => (
                        <li key={index}>• {detail}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 dark:bg-slate-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-slate-500 transition-all duration-200"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default MessageModal;