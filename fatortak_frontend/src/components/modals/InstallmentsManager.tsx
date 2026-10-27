"use client";

import type React from "react";
import { useState } from "react";
import {
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  TrendingUp,
  Filter,
  Search,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { useInstallmentsByInvoiceId, usePayInstallment, useUnPayInstallment } from "@/hooks/useInvoices";
import InstallmentReceiptModal from "./InstallmentReceiptModal";
import { formatDate } from "@/Helpers/localization";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "react-toastify"; // Import toast from react-toastify
import EarlyPaymentConfirmModal from "./EarlyPaymentConfirmModal";

interface IntegratedInstallmentsManagerProps {
  invoiceId: string;
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const IntegratedInstallmentsManager: React.FC<
  IntegratedInstallmentsManagerProps
> = ({ invoiceId, invoice, isOpen, onClose, onUpdate }) => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [selectedInstallmentIndex, setSelectedInstallmentIndex] =
    useState<number>(0);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [earlyPaymentModal, setEarlyPaymentModal] = useState({
    isOpen: false,
    installment: null as any,
  });

  const {
    data: installmentsResponse,
    isLoading,
    refetch,
  } = useInstallmentsByInvoiceId(invoiceId);
  const payInstallmentMutation = usePayInstallment();
  const unpayInstallmentMutation = useUnPayInstallment();

  const installments = installmentsResponse?.success
    ? installmentsResponse.data || []
    : [];

  const filteredInstallments = installments.filter((installment: any) => {
    const matchesSearch =
      installment.installmentNumber?.toString().includes(searchTerm) ||
      installment.amount?.toString().includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      installment.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateProgress = () => {
    if (!installments || installments.length === 0)
      return { paid: 0, total: 0, percentage: 0 };

    const paidInstallments = installments.filter(
      (inst: any) => inst.status?.toLowerCase() === "paid"
    );
    const totalPaid = paidInstallments.reduce(
      (sum: number, inst: any) => sum + (inst.amount || 0),
      0
    );
    const totalAmount = installments.reduce(
      (sum: number, inst: any) => sum + (inst.amount || 0),
      0
    );

    return {
      paid: paidInstallments.length,
      total: installments.length,
      percentage: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0,
      totalPaid,
      totalAmount,
    };
  };

  const progress = calculateProgress();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handlePayInstallment = async (installment: any, index: number) => {
    const today = new Date();
    const dueDate = new Date(installment.dueDate);

    setSelectedInstallmentIndex(index);
    // Check if payment is being made before due date
    if (today < dueDate) {
      setEarlyPaymentModal({
        isOpen: true,
        installment: installment,
      });
      return;
    }

    // Proceed with normal payment if not early
    await processPayment(installment.id);
  };
  const handleUnPayInstallment = async (installment: any, index: number) => {
    const today = new Date();
    const dueDate = new Date(installment.dueDate);

    setSelectedInstallmentIndex(index);

    await processUnPayment(installment.id);
  };

  const processPayment = async (installmentId: string) => {
    try {
      const result = await payInstallmentMutation.mutateAsync(installmentId);
      if (result.success) {
        toast.success(t("installmentPaidSuccessfully"));
        refetch();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error(t("installmentPaymentFailed"));
    }
  };
  const processUnPayment = async (installmentId: string) => {
    try {
      const result = await unpayInstallmentMutation.mutateAsync(installmentId);
      if (result.success) {
        toast.success(t("installmentMarkedunPaid"));
        refetch();
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      toast.error(t("installmentUnPaymentFailed"));
    }
  };

  const handleConfirmEarlyPayment = async () => {
    if (earlyPaymentModal.installment) {
      await processPayment(earlyPaymentModal.installment.id);
      setEarlyPaymentModal({ isOpen: false, installment: null });
    }
  };

  const handleCancelEarlyPayment = () => {
    setEarlyPaymentModal({ isOpen: false, installment: null });
  };

  const handleViewReceipt = (installment: any, index: number) => {
    setSelectedInstallment(installment);
    setSelectedInstallmentIndex(index);
    setReceiptModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t("installmentsManager")}</h2>
              <p className="text-purple-100">
                {t("invoice")} #{invoice?.invoiceNumber} -{" "}
                {invoice?.customerName}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {t("progress")}
                    </p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {progress.paid}/{progress.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    {progress.percentage.toFixed(1)}% {t("complete")}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {t("paidAmount")}
                    </p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(progress.totalPaid)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {t("totalAmount")}
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(progress.totalAmount)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      {t("remaining")}
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {formatCurrency(
                        progress.totalAmount - progress.totalPaid
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t("searchInstallments")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  {t("status")}:{" "}
                  {statusFilter === "all" ? t("all") : t(statusFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                  {t("allStatuses")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("paid")}>
                  {t("paid")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                  {t("pending")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>
                  {t("overdue")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Installments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">
                {t("loadingInstallments")}
              </span>
            </div>
          ) : filteredInstallments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("noInstallmentsFound")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== "all"
                  ? t("noInstallmentsMatchFilters")
                  : t("noInstallmentsForInvoice")}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInstallments.map((installment: any, index: number) => (
                <Card
                  key={installment.id || index}
                  className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {t("installment")} #
                          {installment.installmentNumber || index + 1}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("due")}:{" "}
                          {formatDate(installment.dueDate)}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          installment.status
                        )} border`}
                      >
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(installment.status)}
                          <span className="text-xs capitalize">
                            {t(installment.status?.toLowerCase())}
                          </span>
                        </div>
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("amount")}:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(installment.amount)}{" "}
                          {invoice?.currency || "EGP"}
                        </span>
                      </div>
                      {installment.paidDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {t("paidDate")}:
                          </span>
                          <span className="text-sm text-emerald-600 dark:text-emerald-400">
                            {formatDate(installment.paidDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleViewReceipt(installment, index + 1)
                        }
                        className="flex-1 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/20"
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        {t("receipt")}
                      </Button>
                      {installment.status?.toLowerCase() !== "paid" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePayInstallment(installment, index + 1)
                          }
                          disabled={payInstallmentMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          {t("pay")}
                        </Button>
                      )}
                      {installment.status?.toLowerCase() === "paid" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUnPayInstallment(installment, index + 1)
                          }
                          disabled={unpayInstallmentMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          {t("unPay")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <InstallmentReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        installment={selectedInstallment}
        installmentNo={selectedInstallmentIndex}
        invoice={invoice}
      />

      <EarlyPaymentConfirmModal
        isOpen={earlyPaymentModal.isOpen}
        onClose={handleCancelEarlyPayment}
        onConfirm={handleConfirmEarlyPayment}
        installment={earlyPaymentModal.installment}
        installmentIndex={selectedInstallmentIndex}
        invoice={invoice}
        isProcessing={payInstallmentMutation.isPending}
      />
    </div>
  );
};

export default IntegratedInstallmentsManager;
