import React from "react";
import {
  FileText,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Wallet,
  ShoppingCart,
  AlertCircle,
  BarChart3,
  Activity,
  CreditCard,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  Building,
  Landmark,
} from "lucide-react";
import BranchSelector from "../components/ui/BranchSelector";
import ProjectSelector from "../components/ui/ProjectSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardReport } from "../hooks/useDashboardReport";
import EnhancedInvoiceModal from "../components/modals/EnhancedInvoiceModal";
import CustomerModal from "../components/modals/CustomerModal";
import ItemModal from "../components/modals/ItemModal";
import ExpenseModal from "../components/modals/ExpenseModal";
import RecordPaymentModal from "../components/modals/RecordPaymentModal";
import { useInvoices } from "../hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatNumber, formatDate } from "@/Helpers/localization";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import ProfitGrowthChart from "@/components/dashboard/ProfitGrowthChart";
import StatCard from "@/components/ui/StatCard";

const healthToneStyles: Record<string, string> = {
  brand:
    "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300",
  success:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  info: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  warning:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  danger:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  neutral:
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

const Dashboard: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);
  const [isSellInvoice, setIsSellInvoice] = React.useState(false);
  const [showCustomerModal, setShowCustomerModal] = React.useState(false);
  const [isSupplier, setIsSupplier] = React.useState(false);
  const [showItemModal, setShowItemModal] = React.useState(false);
  const [showExpenseModal, setShowExpenseModal] = React.useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] =
    React.useState(false);
  const [period, setPeriod] = React.useState("month");
  const [filterBranchId, setFilterBranchId] = React.useState("");
  const [filterProjectId, setFilterProjectId] = React.useState("all");

  // Fetch invoices to find sales invoice for selected project
  const { data: projInvoicesResponse } = useInvoices(
    { pageNumber: 1, pageSize: 20 },
    { projectId: filterProjectId === "all" ? undefined : filterProjectId },
  );

  const salesInvoice = projInvoicesResponse?.data?.data?.find(
    (inv: any) =>
      inv.invoiceType?.toLowerCase() === "sell" ||
      inv.invoiceType?.toLowerCase() === "sales" ||
      inv.invoiceType?.toLowerCase() === "sale",
  );

  // Fetch real data from API
  const { data: userProfileResponse } = useCurrentUserProfile();
  const {
    data: dashboardResponse,
    isLoading,
    error,
    refetch,
  } = useDashboardReport(
    period,
    filterBranchId || undefined,
    filterProjectId === "all" ? undefined : filterProjectId,
  );

  const userProfile = userProfileResponse?.success
    ? userProfileResponse.data
    : null;

  const dashboardData = dashboardResponse?.data;
  const stats = dashboardData?.stats;
  const recentInvoices = dashboardData?.recentInvoices || [];
  const recentTransactions = dashboardData?.recentTransactions || [];
  const monthlyFinancials = dashboardData?.monthlyFinancials || []; // NEW

  const mainStats = stats
    ? [
        {
          title: t("totalRevenue"),
          value: `${formatCurrency(stats?.totalRevenue)}`,
          icon: DollarSign,
          tone: "success" as const,
          color: "from-emerald-500 to-teal-600",
          bgColor:
            "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950",
          iconColor: "text-emerald-600",
          subtitle: t("thisMonth"),
          tooltip: t("tooltips.totalRevenue"),
        },
        {
          title: t("totalExpenses"),
          value: `${formatCurrency(stats?.totalExpenses)}`,
          icon: FileText,
          tone: "neutral" as const,
          color: "from-blue-500 to-indigo-600",
          bgColor:
            "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950",
          iconColor: "text-blue-600",
          subtitle: `${stats?.paidInvoices} ${t("paidStatus")?.toLowerCase()}`,
          tooltip: t("tooltips.totalExpenses"),
        },
        {
          title: t("currentBalance"),
          value: `${formatCurrency(stats?.currentBalance)}`,
          icon: Wallet,
          tone: "brand" as const,
          color: "from-purple-500 to-violet-600",
          bgColor:
            "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950",
          iconColor: "text-purple-600",
          subtitle: t("thisMonth"),
          tooltip: t("tooltips.currentBalance"),
        },
        {
          title: t("totalCustomers"),
          value: formatNumber(stats?.totalCustomers),
          icon: Users,
          tone: "warning" as const,
          color: "from-amber-500 to-orange-600",
          bgColor:
            "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950",
          iconColor: "text-amber-600",
          subtitle: t("activeCustomers"),
          tooltip: t("tooltips.totalCustomers"),
        },
      ]
    : [];

  const businessHealthStats = stats
    ? [
        {
          title: t("totalCashAvailable"),
          value: `${formatCurrency(stats.totalCashAvailable)}`,
          icon: Wallet,
          tone: "success" as const,
          tooltip: t("tooltips.totalCashAvailable"),
        },
        {
          title: isRTL ? "إجمالي الرصيد البنكي" : "Total Bank Available",
          value: `${formatCurrency(stats.totalBankAvailable)}`,
          icon: Landmark,
          tone: "info" as const,
          tooltip: isRTL
            ? "إجمالي الأرصدة المتوفرة في البنوك"
            : "Total balances available in all bank accounts",
        },
        {
          title: t("totalReceivables"),
          value: `${formatCurrency(stats.totalReceivables)}`,
          icon: DollarSign,
          tone: "warning" as const,
          tooltip: t("tooltips.totalReceivables"),
        },
        {
          title: t("totalPayables"),
          value: `${formatCurrency(stats.totalPayables)}`,
          icon: DollarSign,
          tone: "danger" as const,
          tooltip: t("tooltips.totalPayables"),
        },
        {
          title: isRTL ? "إجمالي العهد المالية" : "Total Custody",
          value: `${formatCurrency(stats.totalCustody)}`,
          icon: Users,
          tone: "brand" as const,
          tooltip: isRTL
            ? "إجمالي العهد المالية للموظفين"
            : "Total employee custody",
        },
        {
          title: isRTL ? "شيكات تحت التحصيل" : "Cheques Under Collection",
          value: `${formatCurrency(stats.totalChequesUnderCollection)}`,
          icon: CreditCard,
          tone: "neutral" as const,
          tooltip: isRTL
            ? "إجمالي الشيكات تحت التحصيل"
            : "Total cheques waiting for collection",
        },
      ]
    : [];



  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";
      case "sent":
        return "border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300";
      case "draft":
        return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "overdue":
        return "border-rose-100 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300";
      case "pending":
        return "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
      default:
        return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    return t(`${status?.toLowerCase()}Status`) || status;
  };

  const formatTypeText = (type: string) => {
    switch (type?.toLowerCase()) {
      case "sales":
      case "paymentreceived":
        return t("salesType");
      case "purchase":
      case "paymentmade":
        return t("purchaseTypeLabel");
      case "salary":
        return t("salaryType");
      case "utility":
        return t("utilityType");
      case "rent":
        return t("rentType");
      case "expense":
        return t("expenseType");
      case "installment":
        return t("installmentType");
      case "other":
        return t("otherType");
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <Button onClick={() => window.location.reload()}>{t("retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
              {t("dashboard")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {userProfile?.firstName
                ? `${t("welcome")}, ${userProfile.firstName}`
                : t("welcome")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {isRTL
                ? "نظرة سريعة على أداء أعمالك اليوم."
                : "A clear view of how your business is doing."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t("selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">{t("reports.thisWeek")}</SelectItem>
                <SelectItem value="month">{t("reports.thisMonth")}</SelectItem>
                <SelectItem value="quarter">
                  {t("reports.thisQuarter")}
                </SelectItem>
                <SelectItem value="year">{t("reports.thisYear")}</SelectItem>
              </SelectContent>
            </Select>

            <BranchSelector
              value={filterBranchId}
              onChange={setFilterBranchId}
              className="w-full sm:w-48"
            />

            <ProjectSelector
              value={filterProjectId}
              onChange={setFilterProjectId}
              className="w-full sm:w-48"
            />

            {filterProjectId !== "all" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl gap-2 h-10 shadow-sm"
                >
                  <DollarSign className="w-4 h-4 text-rose-500" />
                  <span className="hidden md:inline">
                    {isRTL ? "إضافة مصروف" : "Add Expense"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  disabled={!salesInvoice || salesInvoice.status === "Paid"}
                  onClick={() => setShowRecordPaymentModal(true)}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl gap-2 h-10 shadow-sm"
                >
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span className="hidden md:inline">
                    {isRTL ? "تحصيل دفعة" : "Record Payment"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <StatCard
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        icon={Icon}
                        tone={stat.tone}
                        tooltip={stat.tooltip}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="p-0 border-0 bg-transparent shadow-none">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[280px]">
                      <div className="space-y-3">
                        {/* Header with title and date range */}
                        <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {stat.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {stats?.startDate && stats?.endDate
                              ? `${formatDate(stats.startDate)} - ${formatDate(stats.endDate)}`
                              : t("thisMonth")}
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t("total")}
                          </span>
                          <span className={`font-bold ${stat.iconColor}`}>
                            {stat.value}
                          </span>
                        </div>

                        {/* Breakdown by status */}
                        {index === 0 && stats?.revenueBreakdown && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("paidStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(stats.revenueBreakdown.paid)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("partialPaidStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                {formatCurrency(
                                  stats.revenueBreakdown.partialPaid,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("pendingStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatCurrency(stats.revenueBreakdown.pending)}
                              </span>
                            </div>
                          </>
                        )}

                        {index === 1 && stats?.expenseBreakdown && (
                          <>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("paidStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(stats.expenseBreakdown.paid)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("partialPaidStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                {formatCurrency(
                                  stats.expenseBreakdown.partialPaid,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("pendingStatus")}
                                </span>
                              </div>
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatCurrency(stats.expenseBreakdown.pending)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          {/* Left Column - Business Health & Transactions */}
          <div className="lg:col-span-4 space-y-6">
            {/* Business Health */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>
                  {t("businessHealth")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash, bank, receivables, payables, custody and cheques */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {businessHealthStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex cursor-help items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-slate-200 dark:border-slate-800 dark:bg-slate-800/40">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${healthToneStyles[stat.tone]}`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="mb-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                  {stat.title}
                                </div>
                                <div className="text-[15px] font-semibold tabular-nums text-slate-900 dark:text-white">
                                  {stat.value}
                                </div>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{stat.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {t("recentTransactions")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table className="[&_th]:px-3 [&_td]:px-3 [&_th]:text-[10px] [&_td]:text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("type")}</TableHead>
                      <TableHead>{t("reference")}</TableHead>
                      <TableHead>{t("amount")}</TableHead>
                      <TableHead>{t("remaining")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-10 text-center text-slate-500 dark:text-slate-400"
                        >
                          {t("noTransactionsFound")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions.map((tx, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {formatDate(tx.date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-slate-600 dark:text-slate-300">
                            {formatTypeText(tx.type)}
                          </TableCell>
                          <TableCell className="max-w-[210px] truncate text-slate-900 dark:text-slate-100">
                            {tx.reference}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium tabular-nums text-slate-900 dark:text-white">
                            {formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap tabular-nums text-slate-600 dark:text-slate-300">
                            {formatCurrency(tx.remaining)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Charts and Recent Invoices */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profit & Growth Chart */}
            <ProfitGrowthChart monthlyData={monthlyFinancials} t={t} />
            {/* Recent Invoices */}
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brand-600" />
                    <CardTitle>
                      {t("recentInvoices")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <Table className="[&_th]:px-3 [&_td]:px-3 [&_th]:text-[10px] [&_td]:text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("invoiceNumber")}</TableHead>
                      <TableHead>{t("customer")}</TableHead>
                      <TableHead>{t("amount")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="py-12 text-center text-slate-500 dark:text-slate-400"
                        >
                          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
                          <p>{t("noInvoicesFound")}</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="max-w-[140px] truncate text-slate-600 dark:text-slate-300">
                            {invoice.customerName}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-semibold tabular-nums text-slate-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Modals */}
        <EnhancedInvoiceModal
          isSell={isSellInvoice}
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          onSuccess={() => {
            setShowInvoiceModal(false);
          }}
        />
        <CustomerModal
          isOpen={showCustomerModal}
          isSupplier={isSupplier}
          onClose={() => setShowCustomerModal(false)}
          onSuccess={() => setShowCustomerModal(false)}
        />
        <ItemModal
          isOpen={showItemModal}
          item={null}
          onClose={() => setShowItemModal(false)}
          onSuccess={() => {
            setShowItemModal(false);
          }}
        />
        <ExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSuccess={() => setShowExpenseModal(false)}
          initialProjectId={
            filterProjectId !== "all" ? filterProjectId : undefined
          }
        />
        <RecordPaymentModal
          isOpen={showRecordPaymentModal}
          invoice={salesInvoice}
          onClose={() => setShowRecordPaymentModal(false)}
          onSuccess={() => {
            setShowRecordPaymentModal(false);
            refetch();
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
