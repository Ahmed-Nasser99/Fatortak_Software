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
          bgColor: "bg-green-50",
          iconBg: "bg-green-500",
          iconColor: "text-white",
          tooltip: t("tooltips.totalCashAvailable"),
        },
        {
          title: isRTL ? "إجمالي الرصيد البنكي" : "Total Bank Available",
          value: `${formatCurrency(stats.totalBankAvailable)}`,
          icon: Landmark,
          bgColor: "bg-blue-50",
          iconBg: "bg-blue-500",
          iconColor: "text-white",
          tooltip: isRTL
            ? "إجمالي الأرصدة المتوفرة في البنوك"
            : "Total balances available in all bank accounts",
        },
        {
          title: t("totalReceivables"),
          value: `${formatCurrency(stats.totalReceivables)}`,
          icon: DollarSign,
          bgColor: "bg-orange-50",
          iconBg: "bg-orange-400",
          iconColor: "text-white",
          tooltip: t("tooltips.totalReceivables"),
        },
        {
          title: t("totalPayables"),
          value: `${formatCurrency(stats.totalPayables)}`,
          icon: DollarSign,
          bgColor: "bg-red-50",
          iconBg: "bg-red-400",
          iconColor: "text-white",
          tooltip: t("tooltips.totalPayables"),
        },
        {
          title: isRTL ? "إجمالي العهد المالية" : "Total Custody",
          value: `${formatCurrency(stats.totalCustody)}`,
          icon: Users,
          bgColor: "bg-purple-50",
          iconBg: "bg-purple-500",
          iconColor: "text-white",
          tooltip: isRTL
            ? "إجمالي العهد المالية للموظفين"
            : "Total employee custody",
        },
        {
          title: isRTL ? "شيكات تحت التحصيل" : "Cheques Under Collection",
          value: `${formatCurrency(stats.totalChequesUnderCollection)}`,
          icon: CreditCard,
          bgColor: "bg-teal-50",
          iconBg: "bg-teal-500",
          iconColor: "text-white",
          tooltip: isRTL
            ? "إجمالي الشيكات تحت التحصيل"
            : "Total cheques waiting for collection",
        },
      ]
    : [];



  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>{t("retry")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  {userProfile?.firstName
                    ? `${t("welcome")}, ${userProfile.firstName}`
                    : t("welcome")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
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
              className="w-48"
            />

            <ProjectSelector
              value={filterProjectId}
              onChange={setFilterProjectId}
              className="w-48"
            />

            {filterProjectId !== "all" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowExpenseModal(true)}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl gap-2 h-10 shadow-sm"
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
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl gap-2 h-10 shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {mainStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-help`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {stat.title}
                          </CardTitle>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {stat.value}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm`}
                        >
                          <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {stat.subtitle}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="p-0 border-0 bg-transparent shadow-none">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px]">
                      <div className="space-y-3">
                        {/* Header with title and date range */}
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {stat.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stats?.startDate && stats?.endDate
                              ? `${formatDate(stats.startDate)} - ${formatDate(stats.endDate)}`
                              : t("thisMonth")}
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("businessHealth")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cash & Stock */}
                <div className="grid grid-cols-2 gap-4">
                  {businessHealthStats.slice(0, 2).map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-start gap-3 p-3 ${stat.bgColor} dark:bg-slate-700/50 rounded-lg cursor-help`}
                            >
                              <div
                                className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                              >
                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {stat.title}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
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

                {/* Receivables & Payables */}
                <div className="grid grid-cols-2 gap-4">
                  {businessHealthStats.slice(2, 4).map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-start gap-3 p-3 ${stat.bgColor} dark:bg-slate-700/50 rounded-lg cursor-help`}
                            >
                              <div
                                className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                              >
                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {stat.title}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
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

                {/* Final Row: Custody & Cheques */}
                <div className="grid grid-cols-2 gap-4">
                  {businessHealthStats.slice(4, 6).map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`flex items-start gap-3 p-3 ${stat.bgColor} dark:bg-slate-700/50 rounded-lg cursor-help`}
                            >
                              <div
                                className={`w-10 h-10 ${stat.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                              >
                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                              </div>
                              <div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  {stat.title}
                                </div>
                                <div className="text-lg font-bold text-gray-900 dark:text-white">
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
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("recentTransactions")}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b dark:border-gray-700">
                      <tr className="text-left text-gray-600 dark:text-gray-400">
                        <th className="pb-2 font-medium">{t("date")}</th>
                        <th className="pb-2 font-medium">{t("type")}</th>
                        <th className="pb-2 font-medium">{t("reference")}</th>
                        <th className="pb-2 font-medium">{t("amount")}</th>
                        <th className="pb-2 font-medium">{t("paid")}</th>
                        <th className="pb-2 font-medium">{t("remaining")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 !text-center text-gray-500 dark:text-gray-400"
                          >
                            {t("noTransactionsFound")}
                          </td>
                        </tr>
                      ) : (
                        recentTransactions.map((tx, idx) => (
                          <tr
                            key={idx}
                            className="border-b last:border-0 dark:border-gray-700"
                          >
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {formatDate(tx.date)}
                            </td>
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {formatTypeText(tx.type)}
                            </td>
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {tx.reference}
                            </td>
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {formatCurrency(tx.amount)}
                            </td>
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {formatCurrency(tx.paid)}
                            </td>
                            <td className="py-3 text-start text-gray-900 dark:text-gray-200">
                              {formatCurrency(tx.remaining)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Charts and Recent Invoices */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profit & Growth Chart */}
            <ProfitGrowthChart monthlyData={monthlyFinancials} t={t} />
            {/* Recent Invoices */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("recentInvoices")}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b dark:border-gray-700">
                      <tr className="text-left text-gray-600 dark:text-gray-400">
                        <th className="pb-2 font-medium">
                          {t("invoiceNumber")}
                        </th>
                        <th className="pb-2 font-medium">{t("customer")}</th>
                        <th className="pb-2 font-medium ">{t("date")}</th>
                        <th className="pb-2 font-medium">{t("amount")}</th>
                        <th className="pb-2 font-medium">{t("status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t("noInvoicesFound")}</p>
                          </td>
                        </tr>
                      ) : (
                        recentInvoices.map((invoice) => (
                          <tr
                            key={invoice.id}
                            className="border-b last:border-0 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-start dark:border-gray-700"
                          >
                            <td className="py-3 text-gray-900 dark:text-gray-200 font-medium">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="py-3 text-gray-900 dark:text-gray-200">
                              {invoice.customerName}
                            </td>
                            <td className="py-3 text-gray-900 dark:text-gray-200">
                              {formatDate(invoice.issueDate)}
                            </td>
                            <td className="py-3 text-gray-900 dark:text-gray-200 font-semibold">
                              {formatCurrency(invoice.total)}
                            </td>
                            <td className="py-3">
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusLabel(invoice.status)}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
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
