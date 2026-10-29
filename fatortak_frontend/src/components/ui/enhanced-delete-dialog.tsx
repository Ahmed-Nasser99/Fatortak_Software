
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
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-md">
        <div className={`flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            {description}
          </p>
          {itemName && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {isRTL ? 'العنصر المحدد:' : 'Selected Item:'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {itemName}
              </p>
            </div>
          )}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-slate-900 dark:text-white font-medium">
              {isRTL ? '⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه' : '⚠️ Warning: This action cannot be undone'}
            </p>
          </div>
        </div>

        <div className={`flex space-x-3 px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-b-xl ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
