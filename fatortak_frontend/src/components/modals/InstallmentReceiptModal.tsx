"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Download,
  X,
  User,
  FileText,
  PawPrint,
  Printer,
  Eye,
  Paperclip,
} from "lucide-react";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatDate } from "@/Helpers/localization";
import { useLanguage } from "../../contexts/LanguageContext";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface InstallmentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: any;
  invoice: any;
  installmentNo: number;
}

type StatusConfig = {
  color: string;
  icon: React.ReactNode;
  text: string;
};

const InstallmentReceiptModal: React.FC<InstallmentReceiptModalProps> = ({
  isOpen,
  onClose,
  installment,
  invoice,
  installmentNo,
}) => {
  const { t, isRTL } = useLanguage();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!installment || !invoice) return null;

  const getStatusConfig = (status: string): StatusConfig => {
    const statusLower = status?.toLowerCase();

    const configs: Record<string, StatusConfig> = {
      paid: {
        color:
          "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400",
        icon: <CheckCircle className="w-4 h-4" />,
        text: t("paid"),
      },
      pending: {
        color:
          "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400",
        icon: <Clock className="w-4 h-4" />,
        text: t("pending"),
      },
      overdue: {
        color:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400",
        icon: <Clock className="w-4 h-4" />,
        text: t("overdue"),
      },
    };

    return (
      configs[statusLower] || {
        color:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400",
        icon: <Clock className="w-4 h-4" />,
        text: status,
      }
    );
  };

  const statusConfig = getStatusConfig(installment.status);
  const totalPaid = (installment.amount || 0) + (installment.lateFee || 0);

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content");
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printContents = printContent.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`receipt-${installment.id?.slice(0, 8).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const InfoCard = ({
    icon,
    title,
    value,
    color = "purple",
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    color?: "purple" | "blue" | "emerald" | "gray";
  }) => (
    <div
      className={`flex items-center space-x-3 p-3 bg-${color}-50 dark:bg-${color}-950/20 rounded-lg`}
    >
      <div
        className={`w-10 h-10 bg-${color}-100 dark:bg-${color}-900/30 rounded-full flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-sm text-${color}-600 dark:text-${color}-400`}>
          {title}
        </p>
        <p
          className={`text-lg font-bold text-${color}-900 dark:text-${color}-100`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t("paymentReceipt")}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6" ref={receiptRef}>
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {t("installmentPaymentReceipt")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("receipt")} #{installment.id?.slice(0, 8).toUpperCase()}
              </p>
            </div>

            {/* Payment Status */}
            <div className="flex justify-center">
              <Badge className={`${statusConfig.color} border px-3 py-1.5`}>
                <div className="flex items-center space-x-2">
                  {statusConfig.icon}
                  <span className="font-medium capitalize">
                    {statusConfig.text}
                  </span>
                </div>
              </Badge>
            </div>

            {/* Invoice Information */}
            <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                {t("invoiceInformation")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("invoiceNumber")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {invoice.invoiceNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    <User className="w-3 h-3 inline mr-1" />
                    {t("customer")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {invoice.customerName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("invoiceTotal")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(invoice.total)} {invoice.currency || "EGP"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("invoiceDate")}:
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(invoice.issueDate)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Installment Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {t("installmentDetails")}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard
                  icon={
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  }
                  title={t("amount")}
                  value={`${formatCurrency(installment.amount)} ${
                    invoice.currency || "EGP"
                  }`}
                  color="purple"
                />

                <InfoCard
                  icon={
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  }
                  title={t("dueDate")}
                  value={formatDate(installment.dueDate)}
                  color="blue"
                />

                {installment.paidDate && (
                  <InfoCard
                    icon={
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    }
                    title={t("paidDate")}
                    value={formatDate(installment.paidDate)}
                    color="emerald"
                  />
                )}

                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t("installmentNumber")}
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    #{installmentNo || t("n/a")}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
                {t("paymentSummary")}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("installmentAmount")}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(installment.amount)}{" "}
                    {invoice.currency || "EGP"}
                  </span>
                </div>
                {installment.lateFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 dark:text-red-400">
                      {t("lateFee")}:
                    </span>
                    <span className="font-medium text-red-900 dark:text-red-100">
                      {formatCurrency(installment.lateFee)}{" "}
                      {invoice.currency || "EGP"}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-purple-900 dark:text-purple-100">
                    {t("totalPaid")}:
                  </span>
                  <span className="text-purple-900 dark:text-purple-100">
                    {formatCurrency(totalPaid)} {invoice.currency || "EGP"}
                  </span>
                </div>
              </div>
            </div>

            {installment.attachmentUrl && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100 italic">
                      {isRTL ? "مرفق الدفع" : "Payment Attachment"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border-blue-200 dark:border-blue-800"
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${installment.attachmentUrl}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-600 dark:text-blue-400">{isRTL ? "عرض" : "View"}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                <Printer className="w-4 h-4 mr-2" />
                {t("print")}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
              >
                <Download className="w-4 h-4 mr-2" />
                {t("downloadPDF")}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {t("close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden content for printing */}
      <div id="receipt-content" className="hidden">
        <div className="p-8 bg-white text-black">
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold mb-2">{t("paymentReceipt")}</h1>
            <p className="text-gray-600">
              {t("receipt")} #{installment.id?.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-gray-500">
              {formatDate(new Date())}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {t("invoiceInformation")}
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">{t("invoiceNumber")}:</span>
                <p>{invoice.invoiceNumber}</p>
              </div>
              <div>
                <span className="font-medium">{t("customer")}:</span>
                <p>{invoice.customerName}</p>
              </div>
              <div>
                <span className="font-medium">{t("invoiceTotal")}:</span>
                <p>
                  {formatCurrency(invoice.total)} {invoice.currency || "EGP"}
                </p>
              </div>
              <div>
                <span className="font-medium">{t("invoiceDate")}:</span>
                <p>{formatDate(invoice.issueDate)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {t("installmentDetails")}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t("amount")}:</span>
                <p>
                  {formatCurrency(installment.amount)}{" "}
                  {invoice.currency || "EGP"}
                </p>
              </div>
              <div>
                <span className="font-medium">{t("dueDate")}:</span>
                <p>{formatDate(installment.dueDate)}</p>
              </div>
              {installment.paidDate && (
                <div>
                  <span className="font-medium">{t("paidDate")}:</span>
                  <p>{formatDate(installment.paidDate)}</p>
                </div>
              )}
              <div>
                <span className="font-medium">{t("installmentNumber")}:</span>
                <p>#{installmentNo}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold mb-2">
              {t("paymentSummary")}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("installmentAmount")}:</span>
                <span>
                  {formatCurrency(installment.amount)}{" "}
                  {invoice.currency || "EGP"}
                </span>
              </div>
              {installment.lateFee && (
                <div className="flex justify-between text-red-600">
                  <span>{t("lateFee")}:</span>
                  <span>
                    {formatCurrency(installment.lateFee)}{" "}
                    {invoice.currency || "EGP"}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-bold">
                <span>{t("totalPaid")}:</span>
                <span>
                  {formatCurrency(totalPaid)} {invoice.currency || "EGP"}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-8">
            <p>{t("thankYouPayment")}</p>
            <p>{t("automatedReceipt")}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallmentReceiptModal;
