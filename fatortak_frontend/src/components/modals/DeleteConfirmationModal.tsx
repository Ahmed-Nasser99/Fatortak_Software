
import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false
}) => {
  const { isRTL, t } = useLanguage();

  const modalTitle = title || t('deleteConfirmation');
  const modalMessage = message || t('areYouSureDelete');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} items-center gap-3`}>
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {modalTitle}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </DialogHeader>

        <div className="py-4">
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            {modalMessage}
          </p>
          {itemName && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {itemName}
              </p>
            </div>
          )}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {t('thisActionCannotBeUndone')}
            </p>
          </div>
        </div>

        <DialogFooter className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isLoading ? t('loading') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
