"use client";

import type React from "react";
import { AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDate } from "@/Helpers/localization";
import { formatCurrency } from "@/Helpers/formatCurrency";

interface EarlyPaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  installment: any;
  installmentIndex: number;
  invoice: any;
  isProcessing?: boolean;
}

const EarlyPaymentConfirmModal: React.FC<EarlyPaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  installment,
  installmentIndex,
  invoice,
  isProcessing = false,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            {t("earlyPaymentWarning")}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>{t("earlyPaymentMessage")}</p>
            {installment && (
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("installment")}:
                    </span>
                    <span className="font-medium">#{installmentIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("amount")}:
                    </span>
                    <span className="font-medium">
                      {formatCurrency(installment.amount)}{" "}
                      {invoice?.currency || "EGP"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("dueDate")}:
                    </span>
                    <span className="font-medium text-amber-600">
                      {formatDate(installment.dueDate)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex !justify-between w-full">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none bg-transparent"
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessing ? t("processing") : t("confirmPayment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EarlyPaymentConfirmModal;
