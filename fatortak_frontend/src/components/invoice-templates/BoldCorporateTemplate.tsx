import React from "react";
import { TrendingUp, Paperclip, FileText } from "lucide-react";
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

const BoldCorporateTemplate: React.FC<TemplateProps> = ({
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
    <div className={`${isRTL ? "rtl" : "ltr"}`}>
      {/* Bold Header */}
      <div className={`bg-gradient-to-r ${colors.gradient} p-10`}>
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            {company?.logoUrl && (
              <div className="bg-white p-3 rounded-xl">
                <img
                  src={company.logoUrl}
                  alt={company.name || t("company")}
                  className="h-28 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-2">
                {company?.name || t("company")}
              </h3>
            </div>
          </div>
          <div className="text-right rtl:text-left">
            <div className="text-4xl font-black mb-2">
              {invoice.invoiceNumber}
            </div>
            <div className="flex gap-2 justify-end rtl:justify-start">
              <span
                className={`px-3 py-1 rounded text-xs font-bold ${getStatusColor(
                  invoice.status
                )}`}
              >
                {t(`status.${invoice.status.toLowerCase()}`)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-10">
        {/* Bold Info Boxes */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div
            className={`bg-gradient-to-br ${colors.bgLight} dark:${colors.bg}/20 p-6 rounded-2xl border-l-4 border-${colors.primary}`}
          >
            <div
              className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-2`}
            >
              {t("company")}
            </div>
            <div className="text-gray-900 dark:text-white font-bold text-lg mb-1">
              {company?.name || t("company")}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {company?.address || t("defaultAddress")}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {company?.phone || t("defaultPhone")}
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${colors.bgLight} dark:${colors.bg}/20 p-6 rounded-2xl border-l-4 border-${colors.primaryDark}`}
          >
            <div
              className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-2`}
            >
              {t("billTo")}
            </div>
            <div className="text-gray-900 dark:text-white font-bold text-lg mb-1">
              {invoice.customerName}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {invoice.customerEmail}
            </div>
          </div>

          <div
            className={`bg-gradient-to-br ${colors.bgLight} dark:${colors.bg}/20 p-6 rounded-2xl border-l-4 border-${colors.primary}`}
          >
            <div
              className={`text-xs font-bold ${colors.text} uppercase tracking-wider mb-2`}
            >
              {t("dates")}
            </div>
            <div className="text-gray-900 dark:text-white font-bold mb-1">
              {t("issueDate")}: {formatDate(invoice.issueDate)}
            </div>
            <div className="text-gray-900 dark:text-white font-bold">
              {t("dueDate")}: {formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        {/* Bold Table */}
        <div className="mb-10">
          <table className="w-full">
            <thead>
              <tr className={`bg-gradient-to-r ${colors.gradient} text-white`}>
                <th className="text-left rtl:text-right py-4 px-6 font-black uppercase tracking-wider">
                  {t("item")}
                </th>
                <th className="text-center py-4 px-6 font-black uppercase tracking-wider">
                  {t("qty")}
                </th>
                <th className="text-center py-4 px-6 font-black uppercase tracking-wider">
                  {t("price")}
                </th>
                <th className="text-right rtl:text-left py-4 px-6 font-black uppercase tracking-wider">
                  {t("amount")}
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item: any, index: number) => (
                <tr
                  key={item.id || index}
                  className="border-b-2 border-gray-200 dark:border-gray-700"
                >
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {item.itemName || item.name}
                    </div>
                    {item.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-gray-900 dark:text-white">
                    {item.unitPrice?.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right rtl:text-left font-black text-gray-900 dark:text-white text-lg">
                    {(item.quantity * item.unitPrice)?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bold Totals */}
        <div className="flex justify-end">
          <div className="w-96">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span className="font-bold uppercase">{t("subtotal")}</span>
                <span className="font-bold">
                  {formatCurrency(invoice.total - (invoice.vatAmount || 0))}
                </span>
              </div>
              {invoice.vatAmount > 0 && (
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span className="font-bold uppercase">{t("vatLabel")}</span>
                  <span className="font-bold">
                    {formatCurrency(invoice.vatAmount || 0)}
                  </span>
                </div>
              )}
            </div>
            <div className={`${colors.bg} text-white p-6 rounded-2xl`}>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-black uppercase">
                  {t("total")}
                </span>
                <span className="text-4xl font-black">
                  {formatCurrency(invoice.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bold Notes */}
        {invoice.notes && (
          <div
            className={`mt-10 p-6 ${colors.bgLight} dark:${colors.bg}/20 border-l-8 border-${colors.primary} rounded-xl`}
          >
            <h3
              className={`font-black ${colors.text} uppercase tracking-wider mb-3`}
            >
              {t("notes")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Bold Attachment */}
        {invoice.attachmentUrl && (
          <div className={`mt-10 p-6 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-lg`}>
                  <Paperclip className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className={`text-xs font-black ${colors.text} uppercase tracking-widest mb-1`}>
                    {isRTL ? "تم إرفاق ملف" : "Attachment Linked"}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {invoice.attachmentUrl.split('/').pop()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
                className={`px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl`}
              >
                {isRTL ? "فتح" : "Open"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoldCorporateTemplate;
