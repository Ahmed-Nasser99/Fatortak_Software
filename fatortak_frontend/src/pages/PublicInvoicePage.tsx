import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [invoice, setInvoice] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!token) throw new Error("Invoice link is invalid or has expired.");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/invoices/public/${invoiceId}?token=${encodeURIComponent(token)}`
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
  }, [invoiceId, token]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "sent":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "draft":
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
      case "overdue":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case "cancelled":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
    }
  };

  const getInvoiceTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "buy":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "sell":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400";
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

    const printWindow = window.open("", "", "height=900,width=1000");
    if (!printWindow) return;

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!doctype html>
      <html dir="${isRTL ? "rtl" : "ltr"}">
        <head>
          <meta charset="utf-8" />
          <title>${t("print")} - ${invoice?.invoiceNumber || ""}</title>
          ${styles}
          <style>
            @page { size: A4; margin: 12mm; }
            html, body { margin: 0; background: #fff; color: #111827; }
            body { font-family: Inter, 'IBM Plex Sans Arabic', sans-serif; }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            {t("loadingInvoice")}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 max-w-md text-center">
          <X className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            {t("invoiceNotFound")}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {t("invoiceExpiredOrDeleted")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-slate-200 dark:border-slate-700 bg-brand-50/60 dark:bg-brand-950/20">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("invoiceDetails")}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title={t("print")} aria-label={t("print")}
            >
              <Printer className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title={t("downloadPDF")} aria-label={t("downloadPDF")}
            >
              <Download className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </button>
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              title={t("shareViaWhatsApp")} aria-label={t("shareViaWhatsApp")}
            >
              <Share2 className="w-6 h-6 text-slate-700 dark:text-slate-300" />
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
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-800/50">
          <div
            className={`flex flex-wrap gap-4 justify-center ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm "
            >
              <Printer className="w-5 h-5" />
              <span>{t("print")}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors shadow-sm "
            >
              <Download className="w-5 h-5" />
              <span>{t("downloadPDF")}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-white transition-colors hover:bg-emerald-700"
            >
              <Share2 className="w-5 h-5" />
              <span>{t("share")}</span>
            </button>
            {invoice?.attachmentUrl && (
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
                className="flex items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2.5 text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300"
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
