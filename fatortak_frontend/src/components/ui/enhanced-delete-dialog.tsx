
import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface EnhancedDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

const EnhancedDeleteDialog: React.FC<EnhancedDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}) => {
  const { isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          {itemName && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {isRTL ? 'العنصر المحدد:' : 'Selected Item:'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {itemName}
              </p>
            </div>
          )}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {isRTL ? '⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه' : '⚠️ Warning: This action cannot be undone'}
            </p>
          </div>
        </div>

        <div className={`flex space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-xl ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              {isLoading 
                ? (isRTL ? 'جاري الحذف...' : 'Deleting...') 
                : (isRTL ? 'تأكيد الحذف' : 'Confirm Delete')
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDeleteDialog;
