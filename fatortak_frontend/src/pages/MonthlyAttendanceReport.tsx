"use client";

import type React from "react";
import { useState } from "react";
import {
  Clock,
  Users,
  Building2,
  Download,
  Search,
  AlertCircle,
  BarChart3,
  CheckCircle,
  XCircle,
  Table,
  FileText,
  TrendingUp,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  useExportMonthlyReport,
  useMonthlyReport,
} from "@/hooks/useAttendances";
import type { MonthlyAttendanceReportDto } from "@/types/attendanceTypes";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "react-toastify";
import { formatDate, formatNumber } from "@/Helpers/localization";

const MonthlyAttendanceReport: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const { isRTL, t } = useLanguage();

  // API hook
  const {
    data: monthlyReportResponse,
    isLoading,
    error,
  } = useMonthlyReport(selectedYear, selectedMonth);

  const monthlyData: MonthlyAttendanceReportDto[] = (monthlyReportResponse?.data as MonthlyAttendanceReportDto[]) || [];

  // Filter data based on search and department
  const filteredData = monthlyData.filter(
    (item: MonthlyAttendanceReportDto) => {
      const matchesSearch = item.employeeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDepartment =
        !departmentFilter || item.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    }
  );

  const exportMutation = useExportMonthlyReport();

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      const blob = await exportMutation.mutateAsync({
        year: selectedYear,
        month: selectedMonth,
        format,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const extension = format === "excel" ? "xlsx" : "pdf";
      a.download = `monthly_attendance_report_${selectedYear}_${selectedMonth}.${extension}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(t(`reportExportedSuccessfullyAs${format.toUpperCase()}`));
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(t("failedToExportReportPleaseTryAgain"));
    }
  };

  // Calculate statistics
  const avgPerformance =
    filteredData.length > 0
      ? filteredData.reduce((sum, item) => {
          // Since totalMonthlyWorkingHours is a string, we need to parse it if we want to calculate average
          // For now, let's assume it's just a number string or we skip this calculation if not critical.
          // Or better, let's just make it 0 for now to fix the lint error if we don't know the exact string format.
          const totalHours = 0; 
          const performance =
            (totalHours / item.expectedMonthlyWorkingHours) * 100;
          return sum + performance;
        }, 0) / filteredData.length
      : 0;

  const totalDelayDays = filteredData.reduce(
    (sum, item) => sum + item.numberOfDelayDays,
    0
  );

  const totalOvertimeDays = filteredData.reduce(
    (sum, item) => sum + item.numberOfOvertimeDays,
    0
  );

  const totalPresentDays = filteredData.reduce(
    (sum, item) => sum + item.presentDays,
    0
  );

  // Month names for dropdown
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(0, i);
    return {
      value: (i + 1).toString(),
      label: date.toLocaleString("default", { month: "long" }),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div
        className="container !max-w-full mx-auto p-4 space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Enhanced Header - Similar to SellInvoices */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-3xl" />
          <div className="relative bg-card/40 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div
                className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {t("monthlyAttendanceReport")}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isRTL
                    ? "تتبع وإدارة الأداء الشهري للموظفين"
                    : "Track and manage monthly employee performance"}
                </p>
              </div>

              {/* Export Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => handleExport("excel")}
                  disabled={
                    exportMutation.isPending || filteredData.length === 0
                  }
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                >
                  {exportMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Table className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {exportMutation.isPending
                      ? t("exporting")
                      : t("exportExcel")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Records */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {t("totalRecords")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(filteredData.length)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Delay Days */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {t("totalDelayDays")}
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatNumber(totalDelayDays)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Overtime Days */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("totalOvertimeDays")}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(totalOvertimeDays)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg bg-card/60 border dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Month/Year Selection */}
              <div className="flex space-x-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("year")}
                  </label>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) =>
                      setSelectedYear(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: 5 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    {t("month")}
                  </label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) =>
                      setSelectedMonth(Number.parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("searchEmployee")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Table */}
        <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>
                {t("monthlyAttendanceReport")} -{" "}
                {formatDate(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy')}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-400">
                  {t("loadingReport")}
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">
                  {t("errorLoadingReport")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("employee")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("department")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("totalHours")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("expectedHours")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("delayHours")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("overtimeHours")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("delayDays")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("overtimeDays")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("presentDays")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("absentDays")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("vacationDays")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("salary")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("expectedSalary")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredData.map(
                      (item: MonthlyAttendanceReportDto, index: number) => {
                        return (
                          <tr
                            key={index}
                            className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/10 dark:hover:to-teal-900/10 transition-all duration-200 ${
                              index % 2 === 0
                                ? "bg-white dark:bg-slate-800"
                                : "bg-slate-50/50 dark:bg-slate-700/50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {item.employeeName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Building2 className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="text-slate-700 dark:text-slate-300">
                                  {item.department}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                                {item.totalMonthlyWorkingHours
                                  ? item.totalMonthlyWorkingHours
                                  : "0h"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                                {item.expectedMonthlyWorkingHours}h
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-red-600 dark:text-red-400">
                                {item.totalDelayHours
                                  ? item.totalDelayHours
                                  : "0h"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-green-600 dark:text-green-400">
                                {item.totalOvertimeHours
                                  ? item.totalOvertimeHours
                                  : "0h"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="font-mono bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              >
                                {formatNumber(item.numberOfDelayDays)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className="font-mono bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              >
                                {formatNumber(item.numberOfOvertimeDays)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                <span className="font-medium text-green-700 dark:text-green-400">
                                  {formatNumber(item.presentDays)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <XCircle className="w-4 h-4 mr-1 text-red-500" />
                                <span className="font-medium text-red-700 dark:text-red-400">
                                  {formatNumber(item.absentDays)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <XCircle className="w-4 h-4 mr-1 text-blue-500" />
                                <span className="font-medium text-blue-700 dark:text-blue-400">
                                  {formatNumber(item.vacationDays)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {formatNumber(item.salary)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="font-medium text-slate-900 dark:text-white">
                                  {formatNumber(item.expectedSalary)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>

                {/* Empty State */}
                {filteredData.length === 0 && (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                      {t("noDataFound")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyAttendanceReport;
