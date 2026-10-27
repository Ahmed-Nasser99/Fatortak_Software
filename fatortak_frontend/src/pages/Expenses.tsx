import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
  Filter,
  Grid,
  List,
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  Building,
} from "lucide-react";
import BranchSelector from "../components/ui/BranchSelector";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "../hooks/useExpenses";
import { ExpenseDto, CreateExpenseDto, UpdateExpenseDto } from "../types/api";
import ExpenseModal from "../components/modals/ExpenseModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { toast } from "react-toastify";
import { formatDate, formatNumber } from "@/Helpers/localization";

const Expenses: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDto | null>(
    null
  );
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [filterBranchId, setFilterBranchId] = useState("");

  // API hooks
  const {
    data: expensesResponse,
    isLoading,
    error,
    refetch,
  } = useExpenses(pagination, {
    notes: searchTerm || undefined,
    branchId: filterBranchId || undefined,
  });

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const expenses = expensesResponse?.data?.data || [];
  const totalCount = expensesResponse?.data?.totalCount || 0;

  const expensesStats = expensesResponse?.success
    ? expensesResponse.data?.metaData || {}
    : {};

  const stats = {
    totalCount: expensesStats.totalCount || 0,
    totalAmount: expensesStats.totalAmount || 0,
    thisMonthAmount: expensesStats.thisMonthAmount || 0,
    lastMonthAmount: expensesStats.lastMonthAmount || 0,
    thisYearAmount: expensesStats.thisYearAmount || 0,
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: ExpenseDto) => {
    setSelectedExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (
      window.confirm(
        t("confirmDeleteExpense")
      )
    ) {
      try {
        const result = await deleteExpenseMutation.mutateAsync(expenseId);
        if (result.success) {
          toast.success(
            t("expenseDeletedSuccessfully")
          );
          refetch();
        } else {
          toast.error(
            result.errorMessage ||
              (isRTL ? "فشل في حذف المصروفات" : t("failedToDeleteExpense"))
          );
        }
      } catch (error) {
        toast.error(
          t("errorDeletingExpense")
        );
      }
    }
  };

  const handleExpenseSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageNumber: 1 }));
      refetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterBranchId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isRTL ? "خطأ في تحميل البيانات" : "Error Loading Data"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <Button onClick={() => refetch()}>
              {isRTL ? "إعادة المحاولة" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div
        className="container !max-w-full mx-auto p-4 space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("expenses")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع المصروفات الخاصة بك"
                    : "Manage all your expenses"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleCreateExpense}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "مصروفات جديدة" : "New Expense"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Count */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {isRTL ? "إجمالي العدد" : "Total Count"}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(stats.totalCount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Amount */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {isRTL ? "إجمالي القيمة" : "Total Amount"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(stats.totalAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {isRTL ? "هذا الشهر" : "This Month"}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatNumber(stats.thisMonthAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Month */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {isRTL ? "الشهر الماضي" : "Last Month"}
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {formatNumber(stats.lastMonthAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* This Year */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20 border-indigo-200 dark:border-indigo-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    {isRTL ? "هذه السنة" : "This Year"}
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                    {formatNumber(stats.thisYearAmount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div
              className={`flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 ${
                isRTL ? "lg:flex-row-reverse lg:space-x-reverse" : ""
              }`}
            >
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 transform -translate-y-1/2 ${
                      isRTL ? "right-4" : "left-4"
                    } w-5 h-5 text-gray-400`}
                  />
                  <input
                    type="text"
                    placeholder={
                      isRTL ? "البحث في المصروفات..." : "Search expenses..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Branch Filter */}
              <div className="flex items-center space-x-2">
                <BranchSelector
                  value={filterBranchId}
                  onChange={setFilterBranchId}
                  className="min-w-[200px]"
                />
              </div>

              {/* View Toggle */}
              <div
                className={`flex items-center space-x-2 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-4" />
                <span className="text-lg text-gray-600 dark:text-gray-400">
                  {isRTL ? "جاري التحميل..." : "Loading expenses..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {expenses.map((expense) => (
                  <Card
                    key={expense.id}
                    className="group relative hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    {/* Action Buttons - Positioned in corner */}
                    <div className={`absolute top-3 ${isRTL ? "left-3" : "right-3"} flex items-center gap-1`}>
                      {roleAccess.canEdit() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      {roleAccess.canDelete() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
                          {expense.date}
                        </p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatNumber(expense.total)}{" "}
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {isRTL ? "ج.م" : "EGP"}
                          </span>
                        </p>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 pb-5">
                      <div className={isRTL ? "text-right" : "text-left"}>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                            {expense.categoryName}
                          </Badge>
                          {expense.projectName && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {expense.projectName}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                            {expense.paymentAccountName}
                          </Badge>
                        </div>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                            {expense.notes}
                          </p>
                        )}
                        {expense.fileUrl && expense.fileName && (
                          <a
                            href={expense.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <FileText className="w-4 h-4" />
                            <span>{expense.fileName}</span>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Table View for larger screens
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <tr>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "التاريخ" : "Date"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "المبلغ" : "Amount"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "التصنيف" : "Category"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "المشروع" : "Project"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "مصدر الدفع" : "Payment Source"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "ملاحظات" : "Notes"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "مرفق" : "Attachment"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {t("actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {expenses.map((expense, index) => (
                        <tr
                          key={expense.id}
                          className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50/50 dark:bg-gray-700/50"
                          }`}
                        >
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <div className="flex items-center">
                              <span className="font-medium">
                                {formatDate(expense.date)}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {formatNumber(expense.total)}{" "}
                              {isRTL ? "ج.م" : "EGP"}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                              {expense.categoryName}
                            </Badge>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            {expense.projectName ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {expense.projectName}
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {expense.paymentAccountName}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4
                            ${isRTL ? "text-right" : "text-left"}`}
                          >
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {expense.notes || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            }`}
                          >
                            {expense.fileUrl && expense.fileName ? (
                              <a
                                href={expense.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline ${
                                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                                }`}
                              >
                                <FileText className="w-4 h-4" />
                                <span className="text-sm truncate max-w-[150px]">{expense.fileName}</span>
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <div className={`flex space-x-2`}>
                              {roleAccess.canEdit() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditExpense(expense)}
                                  className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {roleAccess.canDelete() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteExpense(expense.id)
                                  }
                                  className="hover:bg-red-100 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {expenses.map((expense) => (
                    <Card
                      key={expense.id}
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div
                          className={`flex items-start justify-between mb-3 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {expense.date}
                            </h3>
                            <div
                              className={`flex items-center space-x-2 mb-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {formatNumber(expense.total)}{" "}
                                {isRTL ? "ج.م" : "EGP"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {expense.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {expense.notes}
                          </p>
                        )}

                        <div
                          className={`flex space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {roleAccess.canEdit() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                              className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-2 text-blue-600" />
                              {isRTL ? "تعديل" : "Edit"}
                            </Button>
                          )}
                          {roleAccess.canDelete() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Empty State */}
            {expenses.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <DollarSign className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isRTL ? "لا توجد مصروفات" : "No expenses found"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                    {isRTL
                      ? "ابدأ بإضافة مصروفات جديدة"
                      : "Start by adding your first expense"}
                  </p>
                  <Button
                    onClick={handleCreateExpense}
                    size="lg"
                    className="px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {isRTL ? "إضافة مصروفات" : "Add Expense"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Pagination */}
            {totalCount > pagination.pageSize && (
              <Card className="mt-8 shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {isRTL
                          ? `عرض ${formatNumber(expenses.length)} من أصل ${formatNumber(totalCount)} مصروفات`
                          : `Showing ${formatNumber(expenses.length)} of ${formatNumber(totalCount)} expenses`}
                    </p>
                    <div
                      className={`flex space-x-2 ${
                        isRTL ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: Math.max(1, prev.pageNumber - 1),
                          }))
                        }
                        disabled={pagination.pageNumber === 1}
                      >
                        {isRTL ? "السابق" : "Previous"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: prev.pageNumber + 1,
                          }))
                        }
                        disabled={expenses.length < pagination.pageSize}
                      >
                        {isRTL ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          isOpen={isModalOpen}
          expense={selectedExpense}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleExpenseSuccess}
        />
      )}
    </div>
  );
};

export default Expenses;
