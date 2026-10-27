import React from "react";
import { Zap, Code, Paperclip, FileText } from "lucide-react";
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

const TechModernTemplate: React.FC<TemplateProps> = ({
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
      className={`${isRTL ? "rtl" : "ltr"} bg-gradient-to-br ${
        colors.gradient
      } text-${colors.textLight} p-10`}
    >
      {/* Tech Header */}
      <div
        className={`${colors.bg}/30 backdrop-blur border border-${colors.primary}/50 rounded-2xl p-8 mb-8`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {company?.logoUrl && (
              <div
                className={`${colors.bg}/10 p-3 rounded-xl border border-${colors.primary}/30`}
              >
                <img
                  src={company.logoUrl}
                  alt={company.name || t("company")}
                  className="h-36 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                <Code className={`w-5 h-5 ${colors.text}`} />
                <h1 className={`text-3xl font-bold ${colors.textLight}`}>
                  {company?.name || t("company")}
                </h1>
              </div>
              <p className={`${colors.text} text-sm font-mono`}>
                {company?.email || "info@company.com"}
              </p>
            </div>
          </div>
          <div className={`text-${isRTL ? "left" : "right"}`}>
            <div className={`font-mono text-xs ${colors.text} mb-2`}>
              {t("invoiceDetails")}
            </div>
            <div className={`text-4xl font-bold ${colors.textLight} font-mono`}>
              {invoice.invoiceNumber}
            </div>
            <div className="mt-3">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-mono ${colors.bg}/20 ${colors.textLight} border border-${colors.primary}/30`}
              >
                {t(`status.${invoice.status.toLowerCase()}`).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div
          className={`${colors.bg}/20 backdrop-blur border border-${colors.primary}/30 rounded-xl p-6`}
        >
          <div
            className={`flex items-center space-x-2 rtl:space-x-reverse ${colors.textLight} mb-3`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {t("from")}
            </span>
          </div>
          <p className={`${colors.textLight} font-semibold text-lg mb-1`}>
            {invoice.customerName}
          </p>
          <p className={`${colors.text} text-sm font-mono`}>
            {invoice.customerEmail}
          </p>
        </div>

        <div
          className={`${colors.bg}/20 backdrop-blur border border-${colors.primary}/30 rounded-xl p-6`}
        >
          <div
            className={`flex items-center space-x-2 rtl:space-x-reverse ${colors.textLight} mb-3`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {t("issueDate")}
            </span>
          </div>
          <p className={`${colors.textLight} font-semibold text-lg font-mono`}>
            {formatDate(invoice.issueDate)}
          </p>
        </div>

        <div
          className={`${colors.bg}/20 backdrop-blur border border-${colors.primary}/30 rounded-xl p-6`}
        >
          <div
            className={`flex items-center space-x-2 rtl:space-x-reverse ${colors.textLight} mb-3`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {t("dueDate")}
            </span>
          </div>
          <p className={`${colors.textLight} font-semibold text-lg font-mono`}>
            {formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      {/* Tech Table */}
      <div
        className={`${colors.bg}/20 backdrop-blur border border-${colors.primary}/30 rounded-xl overflow-hidden mb-8`}
      >
        <table className="w-full">
          <thead>
            <tr
              className={`${colors.bg}/30 border-b border-${colors.primary}/50`}
            >
              <th
                className={`text-left rtl:text-right py-4 px-6 ${colors.textLight} font-mono text-sm uppercase tracking-wider`}
              >
                {t("item")}
              </th>
              <th
                className={`text-center py-4 px-6 ${colors.textLight} font-mono text-sm uppercase tracking-wider`}
              >
                {t("qty")}
              </th>
              <th
                className={`text-center py-4 px-6 ${colors.textLight} font-mono text-sm uppercase tracking-wider`}
              >
                {t("price")}
              </th>
              <th
                className={`text-right rtl:text-left py-4 px-6 ${colors.textLight} font-mono text-sm uppercase tracking-wider`}
              >
                {t("amount")}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item: any, index: number) => (
              <tr
                key={item.id || index}
                className={`border-b border-${colors.primary}/30`}
              >
                <td className="py-4 px-6">
                  <div className={`${colors.textLight} font-semibold`}>
                    {item.itemName || item.name}
                  </div>
                  {item.description && (
                    <div className={`${colors.text} text-sm font-mono mt-1`}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td
                  className={`py-4 px-6 text-center ${colors.textLight} font-mono`}
                >
                  {item.quantity}
                </td>
                <td
                  className={`py-4 px-6 text-center ${colors.textLight} font-mono`}
                >
                  {item.unitPrice?.toFixed(2)}
                </td>
                <td
                  className={`py-4 px-6 text-right rtl:text-left ${colors.textLight} font-mono font-bold`}
                >
                  {(item.quantity * item.unitPrice)?.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tech Totals */}
      <div className="flex justify-end">
        <div
          className={`w-96 ${colors.bg}/30 backdrop-blur border border-${colors.primary}/50 rounded-xl p-6`}
        >
          <div className="space-y-3 mb-4">
            <div className="flex justify-between font-mono">
              <span
                className={`${colors.text} text-sm uppercase tracking-wider`}
              >
                {t("subtotal")}
              </span>
              <span className={colors.textLight}>
                {formatCurrency(invoice.total - (invoice.vatAmount || 0))}
              </span>
            </div>
            {invoice.vatAmount > 0 && (
              <div className="flex justify-between font-mono">
                <span
                  className={`${colors.text} text-sm uppercase tracking-wider`}
                >
                  {t("vatLabel")}
                </span>
                <span className={colors.textLight}>
                  {formatCurrency(invoice.vatAmount || 0)}
                </span>
              </div>
            )}
          </div>
          <div
            className={`border-t border-${colors.primary}/50 pt-4 flex justify-between items-center`}
          >
            <span
              className={`${colors.textLight} font-mono text-lg uppercase tracking-wider`}
            >
              {t("total")}
            </span>
            <span
              className={`text-3xl font-bold ${colors.textLight} font-mono`}
            >
              {formatCurrency(invoice.total || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Tech Attachment */}
      {invoice.attachmentUrl && (
        <div
          className={`mt-8 ${colors.bg}/20 backdrop-blur border border-blue-500/30 rounded-xl p-6`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={`p-2 bg-blue-500/20 rounded-lg border border-blue-500/30`}>
                <Paperclip className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-blue-400 mb-1">
                  {isRTL ? "ملف المرفق" : "Attachment File"}
                </div>
                <div className={`text-sm ${colors.textLight} font-mono`}>
                  {invoice.attachmentUrl.split('/').pop()}
                </div>
              </div>
            </div>
            <button
              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${invoice.attachmentUrl}`, '_blank')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-all border border-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
            >
              {isRTL ? "فتح" : "Open"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechModernTemplate;
