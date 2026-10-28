import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  FolderKanban,
  Landmark,
  Receipt,
  Scale,
  Search,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReportCard {
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  group: "Financial" | "Receivables" | "Sales" | "Cash";
  tone: string;
}

const reports: ReportCard[] = [
  {
    title: "Trial Balance",
    description: "Debit and credit balances for every account, with a balance check.",
    path: "/reports/trial-balance",
    icon: Scale,
    group: "Financial",
    tone: "from-indigo-500 to-blue-600",
  },
  {
    title: "General Ledger",
    description: "Account-by-account movements with opening and closing balances.",
    path: "/reports/ledger",
    icon: BookOpen,
    group: "Financial",
    tone: "from-sky-500 to-cyan-600",
  },
  {
    title: "Income Statement",
    description: "Revenue, expenses and net profit for a selected period.",
    path: "/reports/income-statement",
    icon: TrendingUp,
    group: "Financial",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    title: "Balance Sheet",
    description: "Assets, liabilities and equity with a balance check.",
    path: "/reports/balance-sheet",
    icon: Landmark,
    group: "Financial",
    tone: "from-violet-500 to-purple-600",
  },
  {
    title: "Cash Flow",
    description: "Operating, investing and financing cash movements.",
    path: "/reports/cash-flow",
    icon: Wallet,
    group: "Cash",
    tone: "from-amber-500 to-orange-600",
  },
  {
    title: "Cash & Bank Movements",
    description: "Movement by cash or bank account for the selected period.",
    path: "/reports/cash-bank-movements",
    icon: BarChart3,
    group: "Cash",
    tone: "from-cyan-500 to-blue-600",
  },
  {
    title: "AR Aging",
    description: "Outstanding customer balances grouped by age.",
    path: "/reports/ar-aging",
    icon: ClipboardList,
    group: "Receivables",
    tone: "from-rose-500 to-pink-600",
  },
  {
    title: "AP Aging",
    description: "Outstanding supplier balances grouped by age.",
    path: "/reports/ap-aging",
    icon: Truck,
    group: "Receivables",
    tone: "from-orange-500 to-red-600",
  },
  {
    title: "Customer Statement",
    description: "Invoices, payments and running balance for one customer.",
    path: "/reports/customer-statement",
    icon: Users,
    group: "Receivables",
    tone: "from-teal-500 to-emerald-600",
  },
  {
    title: "Vendor Statement",
    description: "Purchases, payments and running balance for one supplier.",
    path: "/reports/vendor-statement",
    icon: Receipt,
    group: "Receivables",
    tone: "from-fuchsia-500 to-purple-600",
  },
  {
    title: "Sales Report",
    description: "Sales by customer, with invoice counts and totals.",
    path: "/reports/sales",
    icon: Receipt,
    group: "Sales",
    tone: "from-blue-500 to-indigo-600",
  },
  {
    title: "Project Profitability",
    description: "Revenue, cost and margin for each project.",
    path: "/reports/project-profitability",
    icon: FolderKanban,
    group: "Sales",
    tone: "from-lime-500 to-emerald-600",
  },
];

const groups = ["All", "Financial", "Receivables", "Sales", "Cash"] as const;

const ReportsHub = () => {
  const { isRTL } = useLanguage();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<(typeof groups)[number]>("All");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesGroup = group === "All" || report.group === group;
      const matchesQuery =
        !term ||
        report.title.toLowerCase().includes(term) ||
        report.description.toLowerCase().includes(term);
      return matchesGroup && matchesQuery;
    });
  }, [group, query]);

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        eyebrow="Reports"
        title={isRTL ? "مركز التقارير" : "Reports hub"}
        description={
          isRTL
            ? "كل التقارير المالية والتشغيلية في مكان واحد، مبنية على نفس دفتر اليومية."
            : "Every financial and operational report in one place, all driven by the same double-entry ledger."
        }
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="input pl-9"
            placeholder={isRTL ? "ابحث في التقارير..." : "Search reports..."}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {groups.map((item) => (
            <button
              key={item}
              onClick={() => setGroup(item)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                group === item
                  ? "bg-slate-900 text-white dark:bg-indigo-600"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            No reports match your search.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different keyword or group.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => (
            <Link
              key={report.path}
              to={report.path}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`rounded-xl bg-gradient-to-br ${report.tone} p-2.5 text-white shadow-sm`}
                >
                  <report.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
              </div>
              <h2 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {report.title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {report.description}
              </p>
              <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {report.group}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsHub;
