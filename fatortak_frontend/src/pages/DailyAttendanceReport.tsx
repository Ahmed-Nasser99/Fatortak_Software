import type React from "react";
import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  Building2,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  BarChart3,
  FileText,
  Table,
  ClipboardList,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
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
import { useDailyReport, useExportDailyReport } from "@/hooks/useAttendances";
import type { DailyAttendanceReportDto } from "@/types/attendanceTypes";
import { useDepartments } from "@/hooks/useDepartments";
import { useLanguage } from "@/contexts/LanguageContext";
import { timeSpanToHours } from "@/Helpers/timeSpanToHours";
import { toast } from "react-toastify";
import { formatDate, formatNumber, parseLocalDate } from "@/Helpers/localization";

const DailyAttendanceReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const { isRTL, t } = useLanguage();

  // API hook
  const {
    data: dailyReportResponse,
    isLoading,
    error,
  } = useDailyReport(selectedDate);

  const dailyData: DailyAttendanceReportDto[] = (dailyReportResponse?.data as DailyAttendanceReportDto[]) || [];

  // Filter data based on search and department
  const filteredData = dailyData.filter((item: DailyAttendanceReportDto) => {
    const matchesSearch = item.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDepartment =
      !departmentFilter || item.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return timeString;
  };

  const getAttendanceStatusBadge = (
    isVacation: boolean,
    isAttended: boolean,
    delayDuration: string
  ) => {
    if (isVacation) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">
          <XCircle className="w-3 h-3 mr-1" />
          {isRTL ? t("onVacation") : t("vacation")}
        </Badge>
      );
    }
    if (!isAttended) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="w-3 h-3 mr-1" />
          {t("absent")}
        </Badge>
      );
    }

    const totalHours = timeSpanToHours(delayDuration);

    if (totalHours > 0) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t("late")}
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="w-3 h-3 mr-1" />
        {t("onTime")}
      </Badge>
    );
  };

  const exportMutation = useExportDailyReport();

  const handleExport = async (format: "excel" | "pdf") => {
    try {
      const blob = await exportMutation.mutateAsync({
        date: selectedDate,
        format,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      // Set appropriate file extension
      const extension = format === "excel" ? "xlsx" : "pdf";
      a.download = `daily_attendance_report_${selectedDate}.${extension}`;

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

  const presentCount = filteredData.filter(
    (item: DailyAttendanceReportDto) => item.isAttended
  ).length;
  const lateCount = filteredData.filter(
    (item: DailyAttendanceReportDto) =>
      item.isAttended && timeSpanToHours(item.delayDurationHours) > 0
  ).length;

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
                  {t("dailyAttendanceReport")}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {isRTL
                    ? "تتبع وإدارة الحضور اليومي للموظفين"
                    : "Track and manage daily employee attendance"}
                </p>
              </div>

              {/* Export Buttons */}
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

          {/* Present */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("present")}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(presentCount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Late Arrivals */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    {t("lateArrivals")}
                  </p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    {formatNumber(lateCount)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 shadow-lg bg-card/60 border dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Date Selection */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t("date")}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <DatePicker
                    date={parseLocalDate(selectedDate)}
                    setDate={(date) =>
                      setSelectedDate(date ? format(date, "yyyy-MM-dd") : "")
                    }
                  />
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
                {t("dailyAttendanceReport")} -{" "}
                {formatDate(selectedDate)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                        {t("arrivalTime")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("departureTime")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("workingHours")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("delay")}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 dark:text-white">
                        {t("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredData.map(
                      (item: DailyAttendanceReportDto, index: number) => (
                        <tr
                          key={index}
                          className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${
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
                              {formatTime(item.attendanceTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                              {formatTime(item.departureTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Timer className="w-4 h-4 mr-2 text-slate-400" />
                              <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                                {item.totalWorkingHours}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-red-600 dark:text-red-400">
                              {item.delayDurationHours || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getAttendanceStatusBadge(
                              item.isVacation,
                              item.isAttended,
                              item.delayDurationHours
                            )}
                          </td>
                        </tr>
                      )
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

export default DailyAttendanceReport;
