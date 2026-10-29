import React from "react";
import { FileText } from "lucide-react";
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

const MinimalistCleanTemplate: React.FC<TemplateProps> = ({
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
    <div className={`${isRTL ? "rtl" : "ltr"} bg-white dark:bg-slate-900 p-12`}>
      {/* Minimal Header */}
      <div
        className={`flex justify-between items-start mb-12 pb-8 border-b border-${colors.primary} dark:border-${colors.primary}`}
      >
        <div>
          {company?.logoUrl && (
            <img
              src={company.logoUrl}
              alt={company.name || t("company")}
              className="h-36 w-auto object-contain mb-4 grayscale"
            />
          )}
          <h1 className="text-2xl font-light text-slate-900 dark:text-white tracking-wider">
            {company?.name || t("company")}
          </h1>
        </div>
        <div className={`text-${isRTL ? "left" : "right"}`}>
          <div className="text-5xl font-light text-slate-900 dark:text-white mb-2">
            {invoice.invoiceNumber}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {t(`status.${invoice.status.toLowerCase()}`)}
          </div>
        </div>
      </div>

      {/* Minimal Info */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            {t("from")}
          </div>
          <p className="text-slate-900 dark:text-white font-light">
            {company?.name || t("company")}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {company?.address || t("defaultAddress")}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
            {t("to")}
          </div>
          <p className="text-slate-900 dark:text-white font-light">
            {invoice.customerName}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {invoice.customerEmail}
          </p>
        </div>
      </div>

      {/* Minimal Date Info */}
      <div className="grid grid-cols-2 gap-12 mb-12 text-sm">
        <div>
          <span className="text-slate-500 dark:text-slate-400">
            {t("issueDate")}
          </span>
          <span className="text-slate-900 dark:text-white ml-4 rtl:ml-0 rtl:mr-4">
            {formatDate(invoice.issueDate)}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400">
            {t("dueDate")}
          </span>
          <span className="text-slate-900 dark:text-white ml-4 rtl:ml-0 rtl:mr-4">
            {formatDate(invoice.dueDate)}
          </span>
        </div>
      </div>

      {/* Minimal Items */}
      <div className="mb-12">
        <div className="grid grid-cols-12 gap-4 py-3 border-b border-slate-300 dark:border-slate-700 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div className="col-span-6">{t("item")}</div>
          <div className="col-span-2 text-center">{t("quantity")}</div>
          <div className="col-span-2 text-end rtl:text-start">
            {t("price")}
          </div>
          <div className="col-span-2 text-end rtl:text-start">
            {t("total")}
          </div>
        </div>
        {invoice.items.map((item: any, index: number) => (
          <div
            key={item.id || index}
            className="grid grid-cols-12 gap-4 py-4 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="col-span-6">
              <div className="text-slate-900 dark:text-white font-light">
                {item.itemName || item.name}
              </div>
              {item.description && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {item.description}
                </div>
              )}
            </div>
            <div className="col-span-2 text-center text-slate-900 dark:text-white">
              {item.quantity}
            </div>
            <div className="col-span-2 text-end rtl:text-start text-slate-900 dark:text-white">
              {item.unitPrice?.toFixed(2)}
            </div>
            <div className="col-span-2 text-end rtl:text-start font-medium text-slate-900 dark:text-white">
              {(item.quantity * item.unitPrice)?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Totals */}
      <div className="flex justify-end">
        <div className="w-96 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">
              {t("subtotal")}
            </span>
            <span className="text-slate-900 dark:text-white">
              {formatCurrency(invoice.total - (invoice.vatAmount || 0))}
            </span>
          </div>
          {invoice.vatAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t("vatLabel")}
              </span>
              <span className="text-slate-900 dark:text-white">
                {formatCurrency(invoice.vatAmount || 0)}
              </span>
            </div>
          )}
          <div
            className={`flex justify-between pt-4 border-t border-${colors.primary} dark:border-${colors.primary}`}
          >
            <span className="text-lg text-slate-900 dark:text-white uppercase tracking-wider">
              {t("total")}
            </span>
            <span className="text-2xl font-light text-slate-900 dark:text-white">
              {formatCurrency(invoice.total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Minimal Notes */}
      {invoice.notes && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-light leading-relaxed">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Minimal Attachment */}
      {invoice.attachmentUrl && (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 font-light">
                {isRTL ? "المرفق:" : "Attachment:"} {invoice.attachmentUrl.split('/').pop()}
              </span>
            </div>
            <button
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
              className="text-xs uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-slate-300 dark:border-slate-700 pb-1"
            >
              {isRTL ? "عرض الملف" : "View File"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalistCleanTemplate;
