import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { InvoiceDto } from "../types/api";
import {
  FileText,
  Download,
  Share2,
  X,
  Loader2,
  Printer,
  Calendar,
  User,
  DollarSign,
  Package,
  Phone,
  Mail,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { invoiceTemplates } from "@/components/invoice-templates";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { exportService } from "@/services/exportService";

const PublicInvoicePage = () => {
  const { t, isRTL } = useLanguage();
  const { invoiceId, invoiceTemplate, invoiceTemplateColor } = useParams();
  const [invoice, setInvoice] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/invoices/public/${invoiceId}`
        );
        if (!response.ok) throw new Error(t("invoiceNotFound"));

        const data = await response.json();
        if (data.success) {
          setInvoice(data.data);
        } else {
          throw new Error(data.errorMessage || t("failedToLoadInvoice"));
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "sent":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "draft":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      case "overdue":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "cancelled":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
    }
  };

  const getInvoiceTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "buy":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "sell":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("invoice-print-content");
      if (!element) return;
      // Use shared export logic (includes Arabic/RTL fixes)
      await exportService.exportToPDF(
        "invoice-print-content",
        `invoice-${invoice.invoiceNumber}.pdf`
      );
    } catch (error) {
      toast.error(t("pdfGenerationFailed"));
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-print-content");
    if (!printContent) return;

    const printWindow = window.open("", "", "height=800,width=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${t("print")} - ${invoice?.invoiceNumber}</title>
          <style>
            @media print { 
              body { margin: 0; font-size: 12px; }
              .no-print { display: none; }
            }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; line-height: 1.6; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #8B5CF6; }
            .company-section { display: flex; align-items: center; gap: 20px; }
            .company-logo { max-height: 80px; max-width: 200px; object-fit: contain; }
            .company-info h1 { margin: 0; font-size: 28px; font-weight: bold; color: #1F2937; }
            .company-info p { margin: 4px 0; color: #6B7280; font-size: 14px; }
            .invoice-header { text-align: right; }
            .invoice-number { font-size: 32px; font-weight: bold; color: #8B5CF6; margin: 0; }
            .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; }
            .invoice-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 40px 0; }
            .detail-section { background: #F9FAFB; padding: 24px; border-radius: 12px; border-left: 4px solid #8B5CF6; }
            .detail-section h3 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1F2937; display: flex; align-items: center; gap: 8px; }
            .detail-item { margin-bottom: 12px; }
            .detail-label { font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
            .detail-value { font-size: 15px; font-weight: 600; color: #1F2937; }
            .items-section { margin: 40px 0; }
            .items-section h3 { font-size: 18px; font-weight: 600; color: #1F2937; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
            .items-table th { background: #8B5CF6; color: white; padding: 16px; text-align: left; font-weight: 600; font-size: 14px; }
            .items-table td { padding: 16px; border-bottom: 1px solid #E5E7EB; }
            .items-table tbody tr:hover { background: #F9FAFB; }
            .items-table tbody tr:last-child td { border-bottom: none; }
            .item-name { font-weight: 600; color: #1F2937; }
            .item-description { color: #6B7280; font-size: 13px; margin-top: 4px; }
            .totals-section { background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%); color: white; padding: 24px; border-radius: 12px; margin-top: 40px; }
            .totals-section h3 { margin: 0 0 16px 0; font-size: 18px; display: flex; align-items: center; gap: 8px; }
            .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .totals-row.total { font-size: 24px; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 12px; margin-top: 12px; }
            .notes-section { margin-top: 40px; padding: 20px; background: #F3F4F6; border-radius: 8px; }
            .notes-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1F2937; }
            .terms-section { margin-top: 20px; padding: 20px; background: #F3F4F6; border-radius: 8px; }
            .terms-section h3 { margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #1F2937; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #6B7280; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            <p>${t("thankYouBusiness")}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
    setTimeout(() => printWindow.close(), 100);
  };

  const handleShare = () => {
    if (!invoice) return;

    const message =
      `${t("invoice")}: ${invoice.invoiceNumber}\n` +
      `${t("amount")}: ${invoice.total} ${invoice.currency}\n` +
      `${t("viewOnline")}: ${window.location.href}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Determine which template to use
  const getEffectiveTemplate = () => {
    if (invoiceTemplate && invoiceTemplates[invoiceTemplate as keyof typeof invoiceTemplates]) {
      return invoiceTemplate;
    }
    
    // Fallback to company settings
    const company = invoice?.company;
    const type = invoice?.invoiceType?.toLowerCase();
    
    if (type === "sell" && company?.saleInvoiceTemplate) {
      return company.saleInvoiceTemplate;
    }
    if (type === "buy" && company?.purchaseInvoiceTemplate) {
      return company.purchaseInvoiceTemplate;
    }
    
    return "modern-gradient"; // Default fallback
  };

  // Determine which color to use
  const getEffectiveColor = () => {
    if (invoiceTemplateColor) {
      return invoiceTemplateColor;
    }
    
    // Fallback to company settings
    const company = invoice?.company;
    const type = invoice?.invoiceType?.toLowerCase();
    
    if (type === "sell" && company?.saleInvoiceTemplateColor) {
      return company.saleInvoiceTemplateColor;
    }
    if (type === "buy" && company?.purchaseInvoiceTemplateColor) {
      return company.purchaseInvoiceTemplateColor;
    }
    
    return "professional-dark"; // Default fallback
  };

  const effectiveTemplate = getEffectiveTemplate();
  const effectiveColor = getEffectiveColor();

  const SelectedTemplateComponent =
    invoiceTemplates[effectiveTemplate as keyof typeof invoiceTemplates] ||
    invoiceTemplates["modern-gradient"];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t("loadingInvoice")}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md text-center">
          <X className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {t("invoiceNotFound")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t("invoiceExpiredOrDeleted")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("invoiceDetails")}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              title={t("print")}
            >
              <Printer className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              title={t("downloadPDF")}
            >
              <Download className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleShare}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
              title={t("shareViaWhatsApp")}
            >
              <Share2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content for both display and print */}
        <div
          id="invoice-print-content"
          className="p-8"
          dir={isRTL ? "rtl" : "ltr"}
          style={
            isRTL
              ? { direction: "rtl", unicodeBidi: "plaintext", textAlign: "right" }
              : undefined
          }
        >
          <SelectedTemplateComponent
            invoice={invoice}
            company={invoice?.company}
            isRTL={isRTL}
            t={t}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getInvoiceTypeColor={getInvoiceTypeColor}
            customColor={effectiveColor}
          />
        </div>

        {/* Actions Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
          <div
            className={`flex flex-wrap gap-4 justify-center ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Printer className="w-5 h-5" />
              <span>{t("print")}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>{t("downloadPDF")}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
              <span>{t("share")}</span>
            </button>
            {invoice?.attachmentUrl && (
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <Paperclip className="w-5 h-5" />
                <span>{isRTL ? "عرض المرفق" : "View Attachment"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicInvoicePage;
