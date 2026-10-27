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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
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
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {isRTL ? "إجمالي الموظفين" : "Total Employees"}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {totalCount.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active/Current Page */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {isRTL ? "الصفحة الحالية" : "Current Page"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {employees.length.toLocaleString(isRTL ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-emerald-600" />
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
                      isRTL ? "البحث في الموظفين..." : "Search employees..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
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
                  {isRTL ? "جاري تحميل الموظفين..." : "Loading employees..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Employees Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {employees.map((employee) => (
                  <Card
                    key={employee.id}
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
                            {employee.fullName}
                          </CardTitle>
                          <Badge
                            variant="default"
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium"
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
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          <span className="truncate">{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        {employee.departmentName && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Building className="w-4 h-4 mr-2" />
                            <span>{employee.departmentName}</span>
                          </div>
                        )}
                        {employee.hireDate && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Briefcase className="w-4 h-4 mr-2" />
                            <span>
                              {new Date(employee.hireDate).toLocaleDateString(
                                isRTL ? "ar-EG" : "en-US"
                              )}
                            </span>
                          </div>
                        )}
                        {employee.salary !== undefined && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
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
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <tr>
                        <th>{isRTL ? "اسم الموظف" : "Employee Name"}</th>
                        <th>{isRTL ? "البريد الإلكتروني" : "Email"}</th>
                        <th>{isRTL ? "الهاتف" : "Phone"}</th>
                        <th>{isRTL ? "المنصب" : "Position"}</th>
                        <th>{isRTL ? "القسم" : "Department"}</th>
                        <th>{isRTL ? "تاريخ التعيين" : "Hire Date"}</th>
                        <th>{isRTL ? "الراتب" : "Salary"}</th>
                        <th>{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.fullName}</td>
                          <td>{employee.email}</td>
                          <td>{employee.phone || "-"}</td>
                          <td>{employee.position || "-"}</td>
                          <td>{employee.departmentName || "-"}</td>
                          <td>
                            {employee.hireDate
                              ? new Date(employee.hireDate).toLocaleDateString(
                                  isRTL ? "ar-EG" : "en-US"
                                )
                              : "-"}
                          </td>
                          <td>
                            {employee.salary !== undefined
                              ? formatCurrency(employee.salary)
                              : "-"}
                          </td>
                          <td>
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
