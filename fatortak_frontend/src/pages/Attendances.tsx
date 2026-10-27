import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Loader2,
  Grid,
  List,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAttendances,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
} from "../hooks/useAttendances";
import AttendanceModal from "../components/modals/AttendanceModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { toast } from "react-toastify";
import { AttendanceDto } from "@/types/attendanceTypes";
import { formatDate, formatNumber, parseLocalDate } from "@/Helpers/localization";

const Attendances: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceDto | null>(null);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [dateFilter, setDateFilter] = useState<string>("");

  // API hooks
  const {
    data: attendancesResponse,
    isLoading,
    error,
    refetch,
  } = useAttendances(pagination, {
    employeeName: searchTerm || undefined,
    date: dateFilter || undefined,
  });

  const createAttendanceMutation = useCreateAttendance();
  const updateAttendanceMutation = useUpdateAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();

  const attendances = attendancesResponse?.data?.data || [];
  const totalCount = attendancesResponse?.data?.totalCount || 0;

  const handleCreateAttendance = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEditAttendance = (attendance: AttendanceDto) => {
    setSelectedAttendance(attendance);
    setIsModalOpen(true);
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (
      window.confirm(
        t("confirmDeleteAttendance")
      )
    ) {
      try {
        const result = await deleteAttendanceMutation.mutateAsync(attendanceId);
        if (result.success) {
          toast.success(
            t("attendanceDeletedSuccessfully")
          );
          refetch();
        } else {
          toast.error(
            result.errorMessage ||
              (isRTL ? "فشل في حذف الحضور" : t("failedToDeleteAttendance"))
          );
        }
      } catch (error) {
        toast.error(
          t("errorDeletingAttendance")
        );
      }
    }
  };

  const handleAttendanceSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  // Get status badge based on attendance status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Attended":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t("attended")}
          </Badge>
        );
      case "Absent":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            {t("absent")}
          </Badge>
        );
      case "LeaveWithReason":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            {t("leave")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format time for display
  const formatTime = (dateTime: string | Date | null | undefined) => {
    return formatDate(dateTime, 'p');
  };

  // Format date for display
  const formatDateOld = (date: string | Date) => {
    return formatDate(date);
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageNumber: 1 }));
      refetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, dateFilter]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {t("errorLoadingAttendances")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error
                  ? error.message
                  : t("unknownError")}
              </p>
              <Button onClick={() => refetch()} className="w-full">
                {t("retry")}
              </Button>
            </CardContent>
          </Card>
        </div>
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
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("attendances")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {t("manageAllEmployeeAttendanceRecords")}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleCreateAttendance}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {t("newAttendance")}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Records */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {t("totalRecords")}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {totalCount.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Page Records */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("currentRecords")}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {attendances.length.toLocaleString(
                      isRTL ? "ar-EG" : "en-US"
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div
              className={`flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 ${
                isRTL ? "lg:flex-row-reverse lg:space-x-reverse" : ""
              }`}
            >
              {/* Search by Employee Name */}
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
                      isRTL
                        ? "البحث باسم الموظف..."
                        : t("searchByEmployeeName")
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="flex-1">
                <div className="relative">
                  <Calendar
                    className={`absolute top-1/2 transform -translate-y-1/2 ${
                      isRTL ? "right-4" : "left-4"
                    } w-5 h-5 text-gray-400`}
                  />
                  <DatePicker
                    date={parseLocalDate(dateFilter)}
                    setDate={(date) =>
                      setDateFilter(date ? format(date, "yyyy-MM-dd") : "")
                    }
                  />
                </div>
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
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground text-lg">
                  {t("loadingAttendances")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendances Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {attendances.map((attendance) => (
                  <Card
                    key={attendance.id}
                    className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`flex items-start justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {attendance.employeeName}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(attendance.status)}
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            >
                              {formatDate(attendance.attendanceDate)}
                            </Badge>
                          </div>
                        </div>
                        <div
                          className={`flex items-center space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {roleAccess.canEdit() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAttendance(attendance)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {roleAccess.canDelete() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteAttendance(attendance.id)
                              }
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(attendance.attendTime)}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(attendance.leaveTime)}</span>
                          </div>
                        </div>
                        {attendance.reason && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {attendance.reason}
                            </p>
                          </div>
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
                          {t("employeeName")}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {t("date")}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {t("attendTime")}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {t("leaveTime")}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {t("status")}
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
                      {attendances.map((attendance, index) => (
                        <tr
                          key={attendance.id}
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
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span className="font-medium">
                                {attendance.employeeName}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <span className="text-sm">
                              {formatDate(attendance.attendanceDate)}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <span className="text-sm font-mono">
                              {formatTime(attendance.attendTime)}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            <span className="text-sm font-mono">
                              {formatTime(attendance.leaveTime)}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 ${
                              isRTL ? "text-right" : "text-left"
                            } `}
                          >
                            {getStatusBadge(attendance.status)}
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
                                  onClick={() =>
                                    handleEditAttendance(attendance)
                                  }
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
                                    handleDeleteAttendance(attendance.id)
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
                  {attendances.map((attendance) => (
                    <Card
                      key={attendance.id}
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
                              {attendance.employeeName}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {getStatusBadge(attendance.status)}
                              <Badge variant="outline" className="text-xs">
                                {formatDateOld(attendance.attendanceDate)}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(attendance.attendTime)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(attendance.leaveTime)}</span>
                          </div>
                        </div>

                        {attendance.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {attendance.reason}
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
                              onClick={() => handleEditAttendance(attendance)}
                              className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                            >
                              <Edit className="w-4 h-4 mr-2 text-blue-600" />
                              {t("edit")}
                            </Button>
                          )}
                          {roleAccess.canDelete() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteAttendance(attendance.id)
                              }
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
            {attendances.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Clock className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("noAttendanceRecordsFound")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                    {t("startByAddingFirstAttendanceRecord")}
                  </p>
                  <Button
                    onClick={handleCreateAttendance}
                    size="lg"
                    className="px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t("addAttendance")}
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
                          ? `عرض ${formatNumber(attendances.length)} من أصل ${formatNumber(totalCount)} سجل`
                          : `Showing ${formatNumber(attendances.length)} of ${formatNumber(totalCount)} records`}
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
                        {t("previous")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: prev.pageNumber + 1,
                          }))
                        }
                        disabled={attendances.length < pagination.pageSize}
                      >
                        {t("next")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Attendance Modal */}
      {isModalOpen && (
        <AttendanceModal
          isOpen={isModalOpen}
          attendance={selectedAttendance}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
};

export default Attendances;
