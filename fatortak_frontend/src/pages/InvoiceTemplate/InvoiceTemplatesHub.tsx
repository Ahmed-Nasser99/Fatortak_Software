import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LayoutTemplate, Receipt, ShoppingCart } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const templates = [
  "Modern Gradient",
  "Classic Professional",
  "Minimalist Clean",
  "Bold Corporate",
  "Elegant Script",
  "Tech Modern",
];

const InvoiceTemplatesHub = () => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        eyebrow="Templates"
        title={isRTL ? "قوالب الفواتير" : "Invoice templates"}
        description={
          isRTL
            ? "اختر شكل الفاتورة المناسب لعلامتك التجارية، ثم خصص الألوان من إعدادات الشركة."
            : "Choose the invoice look that fits your brand, then set the template and colour in company settings."
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Link
          to="/invoice-templates/sell"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white">
              <Receipt className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            {isRTL ? "قوالب البيع" : "Sales templates"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {isRTL
              ? "قوالب جاهزة لفواتير العملاء مع دعم كامل للعربية واتجاه RTL."
              : "Customer-facing invoice designs with full Arabic and RTL support."}
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-emerald-600">
            {isRTL ? "استعراض القوالب" : "Browse sales templates"}
          </span>
        </Link>

        <Link
          to="/invoice-templates/buy"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 p-3 text-white">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
            {isRTL ? "قوالب الشراء" : "Purchase templates"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {isRTL
              ? "قوالب فواتير الموردين والمصروفات بنفس هوية النظام."
              : "Supplier and purchase invoice designs that match the rest of the system."}
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-orange-600">
            {isRTL ? "استعراض القوالب" : "Browse purchase templates"}
          </span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-900 dark:text-white">
            {isRTL ? "القوالب المتاحة" : "Available designs"}
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template}
              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200"
            >
              {template}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplatesHub;
