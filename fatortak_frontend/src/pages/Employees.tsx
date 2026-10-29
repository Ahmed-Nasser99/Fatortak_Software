import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Loader2,
  Grid,
  List,
  Mail,
  Phone,
  Briefcase,
  Building,
  Users,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from "../hooks/useEmployees";
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
import { EmployeeDto } from "@/types/employeeTypes";
import EmployeeModal from "@/components/modals/EmployeeModal";

const Employees: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(
    null
  );
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // API hooks
  const {
    data: employeesResponse,
    isLoading,
    error,
    refetch,
  } = useEmployees(pagination, {
    search: searchTerm || undefined,
  });

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const employees = employeesResponse?.data?.data || [];
  const totalCount = employeesResponse?.data?.totalCount || 0;

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: EmployeeDto) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (
      window.confirm(
        t("confirmDeleteEmployee")
      )
    ) {
      try {
        const result = await deleteEmployeeMutation.mutateAsync(employeeId);
        if (result.success) {
          toast.success(
            t("employeeDeletedSuccessfully")
          );
          refetch();
        } else {
          toast.error(
            result.errorMessage ||
              (isRTL ? "فشل في حذف الموظف" : t("failedToDeleteEmployee"))
          );
        }
      } catch (error) {
        toast.error(
          isRTL ? "حدث خطأ أثناء حذف الموظف" : "Error deleting employee"
        );
      }
    }
  };

  const handleEmployeeSuccess = () => {
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
                <User className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل الموظفين" : "Error Loading Employees"}
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
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("employees")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع موظفي الشركة"
                    : "Manage all company employees"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleCreateEmployee}
                className="page-hero-action"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "موظف جديد" : "New Employee"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Employees */}
          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "إجمالي الموظفين" : "Total Employees"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {totalCount.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active/Current Page */}
          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "الصفحة الحالية" : "Current Page"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {employees.length.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <User className="w-6 h-6 text-emerald-600" />
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
                      isRTL ? "البحث في الموظفين..." : "Search employees..."
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
                  {isRTL ? "جاري تحميل الموظفين..." : "Loading employees..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && employees.length === 0 && (
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="flex flex-col items-center p-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                {isRTL ? "لا يوجد موظفون بعد" : "No employees yet"}
              </h3>
              <p className="mb-6 max-w-md text-sm text-slate-500 dark:text-slate-400">
                {isRTL
                  ? "أضف أول موظف لبدء إدارة الفريق والرواتب والحضور."
                  : "Add your first employee to start managing your team, payroll and attendance."}
              </p>
              <Button onClick={handleCreateEmployee} className="bg-brand-600 hover:bg-brand-700">
                <Plus className="h-4 w-4" />
                {isRTL ? "موظف جديد" : "New Employee"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Employees Grid/Table */}
        {!isLoading && employees.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {employees.map((employee) => (
                  <Card
                    key={employee.id}
                    className="group border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`flex items-start justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {employee.fullName}
                          </CardTitle>
                          <Badge
                            variant="default"
                            className="bg-brand-600 text-white font-medium"
                          >
                            {employee.position}
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
                              onClick={() => handleEditEmployee(employee)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {roleAccess.canDelete() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
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
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        {employee.departmentName && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Building className="w-4 h-4 mr-2" />
                            <span>{employee.departmentName}</span>
                          </div>
                        )}
                        {employee.hireDate && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Briefcase className="w-4 h-4 mr-2" />
                            <span>
                              {new Date(employee.hireDate).toLocaleDateString(
                                isRTL ? "ar-EG" : "en-US"
                              )}
                            </span>
                          </div>
                        )}
                        {employee.salary !== undefined && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <span className="font-medium mr-2">
                              {isRTL ? "الراتب:" : "Salary:"}
                            </span>
                            <span>{formatCurrency(employee.salary)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Table View
              <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60">
                      <tr>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "اسم الموظف" : "Employee Name"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "الهاتف" : "Phone"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "المنصب" : "Position"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "القسم" : "Department"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "تاريخ التعيين" : "Hire Date"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{isRTL ? "الراتب" : "Salary"}</th>
                        <th className="px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{employee.fullName}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{employee.email}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{employee.phone || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{employee.position || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{employee.departmentName || "-"}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                            {employee.hireDate
                              ? new Date(employee.hireDate).toLocaleDateString(
                                  isRTL ? "ar-EG" : "en-US"
                                )
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                            {employee.salary !== undefined
                              ? formatCurrency(employee.salary)
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              {roleAccess.canEdit() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEmployee(employee)}
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {roleAccess.canDelete() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteEmployee(employee.id)
                                  }
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
                  {employees.map((employee) => (
                    <Card key={employee.id}>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{employee.fullName}</h3>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center text-sm">
                            <Mail className="w-4 h-4 mr-2" />
                            <span>{employee.email}</span>
                          </div>
                          {employee.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="w-4 h-4 mr-2" />
                              <span>{employee.phone}</span>
                            </div>
                          )}
                          {employee.departmentName && (
                            <div className="flex items-center text-sm">
                              <Building className="w-4 h-4 mr-2" />
                              <span>{employee.departmentName}</span>
                            </div>
                          )}
                          {employee.hireDate && (
                            <div className="flex items-center text-sm">
                              <Briefcase className="w-4 h-4 mr-2" />
                              <span>
                                {new Date(employee.hireDate).toLocaleDateString(
                                  isRTL ? "ar-EG" : "en-US"
                                )}
                              </span>
                            </div>
                          )}
                          {employee.salary !== undefined && (
                            <div className="flex items-center text-sm">
                              <span className="font-medium mr-2">
                                {isRTL ? "الراتب:" : "Salary:"}
                              </span>
                              <span>{formatCurrency(employee.salary)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Employee Modal */}
      {isModalOpen && (
        <EmployeeModal
          isOpen={isModalOpen}
          employee={selectedEmployee}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleEmployeeSuccess}
        />
      )}
    </div>
  );
};

export default Employees;
