import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  Loader2,
  Grid,
  List,
  Building2,
  Layers,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "../hooks/useDepartments";
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
import { DepartmentDto } from "@/types/departmentTypes";
import DepartmentModal from "@/components/modals/DepartmentModal";

const Departments: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentDto | null>(null);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // API hooks
  const {
    data: departmentsResponse,
    isLoading,
    error,
    refetch,
  } = useDepartments(pagination, {
    search: searchTerm || undefined,
  });

  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  const departments = departmentsResponse?.data?.data || [];
  const totalCount = departmentsResponse?.data?.totalCount || 0;

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: DepartmentDto) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (
      window.confirm(
        t("confirmDeleteDepartment")
      )
    ) {
      try {
        const result = await deleteDepartmentMutation.mutateAsync(departmentId);
        if (result.success) {
          toast.success(
            t("departmentDeletedSuccessfully")
          );
          refetch();
        } else {
          toast.error(
            result.errorMessage ||
              (isRTL ? "فشل في حذف القسم" : t("failedToDeleteDepartment"))
          );
        }
      } catch (error) {
        toast.error(
          isRTL ? "حدث خطأ أثناء حذف القسم" : "Error deleting department"
        );
      }
    }
  };

  const handleDepartmentSuccess = () => {
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
  }, [searchTerm]);

  if (error) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل الأقسام" : "Error Loading Departments"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error
                  ? error.message
                  : "Unknown error occurred"}
              </p>
              <Button onClick={() => refetch()} className="w-full">
                {isRTL ? "إعادة المحاولة" : "Retry"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <div
        className="container !max-w-full mx-auto p-4 space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Enhanced Header */}
        <div className="page-hero">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="page-hero-icon mx-3">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("departments")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع أقسام الشركة"
                    : "Manage all company departments"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleCreateDepartment}
                className="page-hero-action"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "قسم جديد" : "New Department"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Departments */}
          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "إجمالي الأقسام" : "Total Departments"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalCount.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Page */}
          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "الصفحة الحالية" : "Current Page"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {departments.length.toLocaleString(
                      isRTL ? "ar-EG" : "en-US"
                    )}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  <Layers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
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
                    } w-5 h-5 text-slate-400`}
                  />
                  <input
                    type="text"
                    placeholder={
                      isRTL ? "البحث في الأقسام..." : "Search departments..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-end" : "pl-12 pr-4"
                    } py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-all duration-200`}
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
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-12">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground text-lg">
                  {isRTL ? "جاري تحميل الأقسام..." : "Loading departments..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {departments.map((department) => (
                  <Card
                    key={department.id}
                    className="group hover:shadow-lg transition-all duration-300 transform  border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`flex items-start justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {department.name}
                          </CardTitle>
                          <Badge
                            variant="default"
                            className="bg-brand-600 text-white font-medium"
                          >
                            {department.employeesCount || 0} {t("employee")}
                          </Badge>
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
                              onClick={() => handleEditDepartment(department)}
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
                                handleDeleteDepartment(department.id)
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
                        {department.description && (
                          <div className="pt-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                              {department.description}
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
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
                      <tr>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {isRTL ? "اسم القسم" : "Department Name"}
                        </th>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {isRTL ? "الوصف" : "Description"}
                        </th>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {isRTL ? "عدد الموظفين" : "Employees Count"}
                        </th>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {t("actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {departments.map((department, index) => (
                        <tr
                          key={department.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-slate-800"
                              : "bg-slate-50/50 dark:bg-slate-700/50"
                          }`}
                        >
                          <td
                            className={`px-4 py-3 ${
                              isRTL ? "text-end" : "text-start"
                            } `}
                          >
                            <div className="flex items-center">
                              <span className="font-medium">
                                {department.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 ${
                              isRTL ? "text-end" : "text-start"
                            } `}
                          >
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                              {department.description || "-"}
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 ${
                              isRTL ? "text-end" : "text-start"
                            } `}
                          >
                            <span className="text-sm">
                              {department.employeesCount || 0} {t("employee")}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3 ${
                              isRTL ? "text-end" : "text-start"
                            } `}
                          >
                            <div className={`flex space-x-2`}>
                              {roleAccess.canEdit() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditDepartment(department)
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
                                    handleDeleteDepartment(department.id)
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
                  {departments.map((department) => (
                    <Card
                      key={department.id}
                      className="border border-slate-200 dark:border-slate-700"
                    >
                      <CardContent className="p-4">
                        <div
                          className={`flex items-start justify-between mb-3 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {department.name}
                            </h3>
                            <div
                              className={`flex items-center space-x-2 mb-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Building className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-500">
                                {department.employeesCount || 0} {t("employee")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {department.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                            {department.description}
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
                              onClick={() => handleEditDepartment(department)}
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
                              onClick={() =>
                                handleDeleteDepartment(department.id)
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
            {departments.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Building className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {isRTL ? "لا توجد أقسام" : "No departments found"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">
                    {isRTL
                      ? "ابدأ بإضافة قسم جديد"
                      : "Start by adding your first department"}
                  </p>
                  <Button
                    onClick={handleCreateDepartment}
                    size="lg"
                    className="px-8"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {isRTL ? "إضافة قسم" : "Add Department"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Pagination */}
            {totalCount > pagination.pageSize && (
              <Card className="mt-8 shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {isRTL
                        ? `عرض ${departments.length} من أصل ${totalCount} قسم`
                        : `Showing ${departments.length} of ${totalCount} departments`}
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
                        disabled={departments.length < pagination.pageSize}
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

      {/* Department Modal */}
      {isModalOpen && (
        <DepartmentModal
          isOpen={isModalOpen}
          department={selectedDepartment}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleDepartmentSuccess}
        />
      )}
    </div>
  );
};

export default Departments;
