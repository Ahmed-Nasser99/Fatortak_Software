import type React from "react";
import {
  X,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calculator,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatDate, formatNumber } from "@/Helpers/localization";

interface Installment {
  id?: string;
  dueDate: string;
  amount: number;
  status?: "Pending" | "Paid" | string;
  paidAt?: string;
}

interface PartialPaymentPreviewModalProps {
  isLoadigng: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoiceData: {
    invoiceNumber: string;
    customerName: string;
    total: number;
    originalTotal: number;
    downPayment: number;
    benefits: number;
    installments: Installment[];
  };
}

const ProgressBar = ({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) => {
  const percentage = Math.min((current / total) * 100, 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {formatNumber(current)} / ${formatNumber(total)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{formatNumber(percentage, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% Complete</span>
        <span>${formatNumber(total - current)} Remaining</span>
      </div>
    </div>
  );
};

const InstallmentCard = ({
  installment,
  index,
  t,
}: {
  installment: Installment;
  index: number;
  t: (key: string) => string;
}) => {
  const status = installment.status || "Pending";
  const isOverdue =
    status === "Pending" &&
    new Date(installment.dueDate) < new Date();
  const isPaid = status === "Paid";
  const isPending = status === "Pending" && !isOverdue;

  const getStatusColor = () => {
    if (isPaid)
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
    if (isOverdue)
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
  };

  const getStatusIcon = () => {
    if (isPaid) return <CheckCircle className="w-4 h-4" />;
    if (isOverdue) return <AlertCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
        isPaid
          ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
          : isOverdue
          ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
          : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("installment")} #{index + 1}
          </span>
          <div
            className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
          >
            {getStatusIcon()}
            <span>
              {isPaid
                ? t("paidStatus")
                : isOverdue
                ? t("overdue")
                : t("pendingStatus")}
            </span>
          </div>
          {isOverdue && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium dark:bg-red-900/20 dark:text-red-400">
              {t("overdue")}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatNumber(installment.amount)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t("due")}: {formatDate(installment.dueDate)}
          </div>
        </div>
      </div>

      {isPaid && installment.paidAt && (
        <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
          <div className="flex items-center space-x-2 text-green-800 dark:text-green-400">
            <CheckCircle className="w-3 h-3" />
            <span className="text-xs font-medium">
              {t("paidOn")} {formatDate(installment.paidAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const PartialPaymentPreviewModal: React.FC<PartialPaymentPreviewModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  invoiceData,
  isLoadigng,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const { total, downPayment, benefits, installments } = invoiceData;

  const adjustedTotal = total;

  const remainingAmount = adjustedTotal - downPayment;

  const installmentsTotal = installments.reduce(
    (sum, inst) => sum + inst.amount,
    0
  );

  const isValidInstallments =
    Math.abs(installmentsTotal + downPayment - adjustedTotal) < 0.01;

  const stats = {
    total: installments.length,
    paid: installments.filter((inst) => inst.status === "Paid").length,
    pending: installments.filter(
      (inst) =>
        (inst.status === "Pending" || !inst.status) && new Date(inst.dueDate) >= new Date()
    ).length,
    overdue: installments.filter(
      (inst) => (inst.status === "Pending" || !inst.status) && new Date(inst.dueDate) < new Date()
    ).length,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t("paymentPlanPreview")}
              </h2>
              <p className="text-purple-100">
                {t("invoice")} {invoiceData.invoiceNumber} -{" "}
                {invoiceData.customerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Validation Warning */}
          {!isValidInstallments && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center space-x-2 text-red-800 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  {t("installmentValidationWarning")}
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {t("installmentValidationMessage")}
              </p>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(adjustedTotal)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("totalAmount")}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatNumber(downPayment)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("downPayment")}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatNumber(remainingAmount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("remaining")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            {/* <ProgressBar
              current={downPayment}
              total={adjustedTotal}
              label={t("paymentProgress")}
            /> */}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(stats.total)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("total")}
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(stats.paid)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("paid")}
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {formatNumber(stats.pending)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("pending")}
                </div>
              </div>
              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatNumber(stats.overdue)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {t("overdue")}
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-600" />
              {t("financialBreakdown")}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("originalTotal")}:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(invoiceData.originalTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {benefits > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("benefitsInterest")}:
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    + {formatNumber(benefits, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("downPayment")}:
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  - {formatNumber(downPayment, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  {t("installmentsTotal")}:
                </span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {formatNumber(installmentsTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("adjustedTotal")}:
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(adjustedTotal, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Installments List */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t("paymentSchedule")} ({installments.length} {t("installments")})
            </h3>
            {installments.map((installment, index) => (
              <InstallmentCard
                key={installment.id || index}
                installment={installment}
                index={index}
                t={t}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={!isValidInstallments || isLoadigng}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadigng
                ? t("creating") || "Creating..."
                : t("confirmCreateInvoice") || "Confirm & Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartialPaymentPreviewModal;
