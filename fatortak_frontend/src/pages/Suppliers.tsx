import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Truck,
  UserCheck,
  UserX,
  Building,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useCustomers,
  useDeleteCustomer,
  useCustomer,
  useToggleCustomerActivation,
} from "../hooks/useCustomers";
import { PaginationDto, CustomerFilterDto } from "../types/api";
import { toast } from "react-toastify";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import CustomerModal from "../components/modals/CustomerModal";
import CustomerUpdateModal from "../components/modals/CustomerUpdateModal";
import EnhancedDeleteDialog from "../components/ui/enhanced-delete-dialog";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatDate, formatNumber } from "@/Helpers/localization";

const Suppliers: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState<string | null>(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  // Filters - for suppliers, we want customers where isSupplier is true
  const filters: CustomerFilterDto = {
    ...(searchTerm && { name: searchTerm }),
    isSupplier: true,
    // Note: We'll need to add isSupplier filter to the CustomerFilterDto type
  };

  // Fetch customers (suppliers only)
  const {
    data: customersResponse,
    isLoading,
    error,
    refetch,
  } = useCustomers(pagination, filters);

  // Fetch individual supplier for editing
  const { data: editSupplierResponse, isLoading: isLoadingEditSupplier } =
    useCustomer(editSupplierId || "");

  const deleteSupplierMutation = useDeleteCustomer();
  const toggleActivationMutation = useToggleCustomerActivation();

  // Filter only suppliers on the frontend for now
  const allCustomers = customersResponse?.success
    ? customersResponse.data?.data || []
    : [];

  // For now, we'll show an empty array for suppliers since isSupplier field doesn't exist yet
  const suppliers = []; // This should be filtered based on isSupplier when field exists
  const totalCount = suppliers.length;

  const editSupplier = editSupplierResponse?.success
    ? editSupplierResponse.data
    : null;

  const supplierStats = customersResponse?.success
    ? customersResponse.data?.metaData || {}
    : {};

  const stats = {
    total: supplierStats.total || 0,
    active: supplierStats.active || 0,
    inactive: supplierStats.inactive || 0,
    recent: supplierStats.recent || 0,
  };

  const handleNewSupplier = () => {
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplierId: string) => {
    setEditSupplierId(supplierId);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setDeleteSupplierId(supplierId);
  };

  const handleToggleActivation = async (supplierId: string) => {
    try {
      const result = await toggleActivationMutation.mutateAsync(supplierId);

      if (result.success) {
        toast.success(
          isRTL
            ? "تم تحديث حالة المورد بنجاح"
            : "Supplier status updated successfully",
        );
        refetch();
      }
    } catch (error) {
      toast.error(
        isRTL ? "فشل في تحديث حالة المورد" : "Failed to update supplier status",
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteSupplierId) return;

    try {
      const result = await deleteSupplierMutation.mutateAsync(deleteSupplierId);

      if (result.success) {
        toast.success(t("supplierDeletedSuccessfully"));
        setDeleteSupplierId(null);
        refetch();
      }
    } catch (error) {
      toast.error(isRTL ? "فشل في حذف المورد" : t("failedToDeleteSupplier"));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const generateAvatar = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const initial = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    return { initial, color: colors[colorIndex] };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل الموردين" : "Error Loading Suppliers"}
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
      <div className="container !max-w-full mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="page-hero">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="page-hero-icon mx-3">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "الموردون" : "Suppliers"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع مورديك بسهولة"
                    : "Manage all your suppliers with ease"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={() => setIsModalOpen(true)}
                className="page-hero-action"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "إضافة مورد جديد" : "Add New Supplier"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "إجمالي الموردين" : "Total Suppliers"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.total)}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/40">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "الموردون النشطون" : "Active Suppliers"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.active)}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                  <UserCheck className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "الموردون غير النشطين" : "Inactive Suppliers"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.inactive)}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isRTL ? "موردون جدد" : "New Suppliers"}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formatNumber(stats.recent)}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/40">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Search */}
        <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="relative">
              <Search
                className={`absolute top-1/2 transform -translate-y-1/2 ${
                  isRTL ? "right-4" : "left-4"
                } w-5 h-5 text-muted-foreground`}
              />
              <input
                type="text"
                placeholder={
                  isRTL ? "البحث في الموردين..." : "Search suppliers..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-3 px-4 ${
                  isRTL ? "pr-12 text-end" : "pl-12"
                } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
              />
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
                  {isRTL ? "جاري تحميل الموردين..." : "Loading suppliers..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Customers Display */}
        {!isLoading && allCustomers.length > 0 && (
          <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50/80 dark:bg-slate-800/60">
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {isRTL ? "المورد" : "Supplier"}
                      </th>
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {t("contact")}
                      </th>
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {t("address")}
                      </th>
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {t("status")}
                      </th>
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {t("joinedDate")}
                      </th>
                      <th
                        className={`px-4 py-3 text-${
                          isRTL ? "right" : "left"
                        } text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400`}
                      >
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {allCustomers.map((customer: any) => {
                      const avatar = generateAvatar(customer.name);
                      return (
                        <tr
                          key={customer.id}
                          className="hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-full ${avatar.color} flex items-center justify-center text-white font-semibold`}
                              >
                                {avatar.initial}
                              </div>
                              <div>
                                <div className="font-semibold">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {customer.phone && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{customer.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{customer.address || "No address"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <Switch
                                dir={isRTL ? "rtl" : "ltr"}
                                style={{
                                  direction: isRTL ? "rtl" : "ltr",
                                }}
                                checked={customer.isActive}
                                onCheckedChange={() =>
                                  handleToggleActivation(customer.id)
                                }
                                disabled={
                                  toggleActivationMutation.isPending ||
                                  !roleAccess.canToggleActivation()
                                }
                              />
                              <Badge
                                variant={
                                  customer.isActive ? "default" : "secondary"
                                }
                                className={`${
                                  customer.isActive
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                                    : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400"
                                } border`}
                              >
                                {customer.isActive
                                  ? t("active")
                                  : t("inactive")}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDate(customer.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1">
                              {roleAccess.canEdit() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditSupplier(customer.id)
                                  }
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {roleAccess.canDelete() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteSupplier(customer.id)
                                  }
                                  className="text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {allCustomers.map((customer: any) => {
                const avatar = generateAvatar(customer.name);
                return (
                  <div key={customer.id} className="p-4 space-y-4">
                    <div
                      className={`flex items-start justify-between ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-full ${avatar.color} flex items-center justify-center text-white font-semibold`}
                        >
                          {avatar.initial}
                        </div>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          dir={isRTL ? "rtl" : "ltr"}
                          style={{
                            direction: isRTL ? "rtl" : "ltr",
                          }}
                          checked={customer.isActive}
                          onCheckedChange={() =>
                            handleToggleActivation(customer.id)
                          }
                          disabled={
                            toggleActivationMutation.isPending ||
                            !roleAccess.canToggleActivation()
                          }
                        />
                        <Badge
                          variant={customer.isActive ? "default" : "secondary"}
                          className={`${
                            customer.isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400"
                          } border`}
                        >
                          {customer.isActive ? t("active") : t("inactive")}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-sm">
                      {customer.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{customer.address || "No address"}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {roleAccess.canEdit() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSupplier(customer.id)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {t("edit")}
                        </Button>
                      )}
                      {roleAccess.canDelete() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSupplier(customer.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Pagination */}
            <div className="border-t bg-muted/20 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${formatNumber(allCustomers.length)} من ${formatNumber(totalCount)} مورد`
                    : `Showing ${formatNumber(allCustomers.length)} of ${formatNumber(totalCount)} suppliers`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber <= 1}
                  >
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={allCustomers.length < pagination.pageSize}
                  >
                    {isRTL ? "التالي" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Empty State */}
        {!isLoading && allCustomers.length === 0 && (
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Truck className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "لا يوجد موردون" : "No suppliers found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {isRTL
                  ? "ابدأ بإضافة مورد جديد"
                  : "Get started by adding a new supplier"}
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-brand-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة أول مورد" : "Add First Supplier"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Supplier Modal */}
      <CustomerModal
        isSupplier={true}
        isOpen={isModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
        onClose={() => setIsModalOpen(false)}
      />

      {editSupplierId && editSupplier && !isLoadingEditSupplier && (
        <CustomerUpdateModal
          isSupplier={true}
          customer={editSupplier}
          onSave={() => {
            setEditSupplierId(null);
            refetch();
          }}
          onClose={() => setEditSupplierId(null)}
        />
      )}

      <EnhancedDeleteDialog
        isOpen={!!deleteSupplierId}
        onClose={() => setDeleteSupplierId(null)}
        onConfirm={handleConfirmDelete}
        title={isRTL ? "حذف المورد" : "Delete Supplier"}
        description={
          isRTL
            ? "هل أنت متأكد من رغبتك في حذف هذا المورد؟"
            : t("confirmDeleteSupplier")
        }
        itemName={
          allCustomers.find((customer: any) => customer.id === deleteSupplierId)
            ?.name
        }
        isLoading={deleteSupplierMutation.isPending}
      />
    </div>
  );
};

export default Suppliers;
