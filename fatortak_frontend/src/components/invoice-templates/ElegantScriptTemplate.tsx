import React from "react";
import { Heart, Paperclip, FileText } from "lucide-react";
import { getColorClasses } from "./colorUtils";
import { formatDate } from "@/Helpers/localization";

interface TemplateProps {
  invoice: any;
  company: any;
  isRTL: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
  getInvoiceTypeColor: (type: string) => string;
  customColor?: string;
}

const ElegantScriptTemplate: React.FC<TemplateProps> = ({
  invoice,
  company,
  isRTL,
  t,
  formatCurrency,
  getStatusColor,
  getInvoiceTypeColor,
  customColor,
}) => {
  const colors = getColorClasses(customColor);

  return (
    <div
      className={`${isRTL ? "rtl" : "ltr"} ${
        colors.bgLight
      } dark:from-gray-900 dark:via-${colors.primary}/20 dark:to-${
        colors.primaryDark
      }/20 p-12`}
    >
      {/* Elegant Header */}
      <div className="text-center mb-12">
        {company?.logoUrl && (
          <div className="flex justify-center mb-6">
            <img
              src={company.logoUrl}
              alt={company.name || t("company")}
              className="h-36 w-auto object-contain"
            />
          </div>
        )}
        <h1
          className={`text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient} mb-3`}
        >
          {company?.name || t("company")}
        </h1>
        <div
          className={`flex items-center justify-center space-x-2 rtl:space-x-reverse ${colors.text}`}
        >
          <div
            className={`h-px w-12 bg-gradient-to-r from-transparent to-${colors.primary}`}
          ></div>
          <Heart className="w-4 h-4 fill-current" />
          <div
            className={`h-px w-12 bg-gradient-to-l from-transparent to-${colors.primary}`}
          ></div>
        </div>
      </div>

      {/* Elegant Invoice Number */}
      <div className="text-center mb-10">
        <div className="inline-block px-8 py-4 bg-white dark:bg-gray-800 rounded-full shadow-xl">
          <span
            className={`text-sm ${colors.text} font-semibold uppercase tracking-widest`}
          >
            {t("invoice") || "Invoice"}
          </span>
          <span
            className={`text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient} mx-3`}
          >
            {invoice.invoiceNumber}
          </span>
        </div>
      </div>

      {/* Elegant Info Cards */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div
          className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-t-4 border-${colors.primary}`}
        >
          <div className={`text-sm ${colors.text} font-serif italic mb-4`}>
            {t("billingDetails") || "Billing Details"}
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white font-serif text-lg">
              {invoice.customerName}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {invoice.customerEmail}
            </p>
          </div>
        </div>

        <div
          className={`bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border-t-4 border-${colors.primaryDark}`}
        >
          <div className={`text-sm ${colors.text} font-serif italic mb-4`}>
            {t("invoiceDates") || "Invoice Dates"}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("issued")}
              </span>
              <span className="text-gray-900 dark:text-white font-serif">
                {formatDate(invoice.issueDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t("due")}
              </span>
              <span className="text-gray-900 dark:text-white font-serif">
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Items */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8">
        <h3
          className={`text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient} mb-6 text-center`}
        >
          {t("itemsAndServices") || "Items & Services"}
        </h3>
        <div className="space-y-4">
          {invoice.items.map((item: any, index: number) => (
            <div
              key={item.id || index}
              className={`flex justify-between items-start p-4 ${colors.bgLight} dark:${colors.bg}/10 rounded-2xl`}
            >
              <div className="flex-1">
                <div className="font-serif text-lg text-gray-900 dark:text-white mb-1">
                  {item.itemName || item.name}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {item.description}
                  </div>
                )}
                <div className={`text-sm ${colors.text} mt-2`}>
                  {item.quantity} × {item.unitPrice?.toFixed(2)}
                </div>
              </div>
              <div className="text-xl font-serif text-gray-900 dark:text-white">
                {(item.quantity * item.unitPrice)?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Elegant Totals */}
      <div
        className={`bg-gradient-to-r ${colors.gradient} rounded-3xl shadow-2xl p-8 text-white`}
      >
        <div className="space-y-3 mb-4">
          <div
            className={`flex justify-between items-center ${colors.textLight}`}
          >
            <span className="font-serif italic">{t("subtotal")}</span>
            <span className="font-semibold">
              {formatCurrency(invoice.total - (invoice.vatAmount || 0))}
            </span>
          </div>
          {invoice.vatAmount > 0 && (
            <div
              className={`flex justify-between items-center ${colors.textLight}`}
            >
              <span className="font-serif italic">{t("vatLabel")}</span>
              <span className="font-semibold">
                {formatCurrency(invoice.vatAmount || 0)}
              </span>
            </div>
          )}
        </div>
        <div
          className={`border-t-2 border-${colors.primary}/30 pt-4 flex justify-between items-center`}
        >
          <span className="text-2xl font-serif">
            {t("grandTotal") || "Grand Total"}
          </span>
          <span className="text-4xl font-serif font-bold">
            {formatCurrency(invoice.total || 0)}
          </span>
        </div>
      </div>

      {/* Elegant Notes */}
      {invoice.notes && (
        <div className="mt-8 text-center pb-8 border-b border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 font-serif italic leading-relaxed">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Elegant Attachment */}
      {invoice.attachmentUrl && (
        <div className="mt-12 text-center">
          <div className={`inline-flex items-center justify-center p-1 rounded-full bg-gradient-to-r ${colors.gradient} mb-6`}>
            <div className="px-6 py-2 bg-white dark:bg-gray-900 rounded-full flex items-center space-x-3 rtl:space-x-reverse">
              <Paperclip className={`w-5 h-5 ${colors.text}`} />
              <span className={`text-sm font-serif italic ${colors.text}`}>
                {isRTL ? "تم إرفاق مستند" : "Document Attached"}
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 max-w-lg mx-auto transform hover:scale-[1.02] transition-transform">
            <div className="flex flex-col items-center">
              <div className={`p-4 ${colors.bgLight} dark:${colors.bg}/20 rounded-2xl mb-4`}>
                <FileText className={`w-10 h-10 ${colors.text}`} />
              </div>
              <h4 className="text-lg font-serif text-gray-900 dark:text-white mb-2">
                {isRTL ? "معاينة الملف" : "File Preview"}
              </h4>
              <p className="text-sm text-gray-500 mb-6 font-mono">
                {invoice.attachmentUrl.split('/').pop()}
              </p>
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
                className={`w-full py-3 bg-gradient-to-r ${colors.gradient} text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-widest text-sm`}
              >
                {isRTL ? "عرض الملف" : "Review File"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElegantScriptTemplate;
