import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Loader2,
  Filter,
  Grid,
  List,
  Box,
  Wrench,
  Building,
} from "lucide-react";
import { formatNumber, formatDate } from "@/Helpers/localization";
import { formatCurrency } from "@/Helpers/formatCurrency";
import BranchSelector from "../components/ui/BranchSelector";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  useToggleItemActivation,
  useItemCategories,
} from "../hooks/useItems";
import { ItemDto, ItemCreateDto, ItemUpdateDto } from "../types/api";
import ItemModal from "../components/modals/ItemModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { toast } from "react-toastify";

const Items: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "product" | "service">(
    "all"
  );
  const [filterBranchId, setFilterBranchId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null);
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 12 });
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // API hooks
  const {
    data: itemsResponse,
    isLoading,
    error,
    refetch,
  } = useItems(pagination, {
    nameOrCode: searchTerm || undefined,
    type: filterType !== "all" ? filterType : undefined,
    isActive: true,
    branchId: filterBranchId || undefined,
  });

  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();
  const deleteItemMutation = useDeleteItem();
  const toggleActivationMutation = useToggleItemActivation();

  const items = itemsResponse?.data?.data || [];
  const totalCount = itemsResponse?.data?.totalCount || 0;

  const itemStats = itemsResponse?.success
    ? itemsResponse.data?.metaData || {}
    : {};

  const stats = {
    total: itemStats.total || 0,
    products: itemStats.products || 0,
    services: itemStats.services || 0,
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ItemDto) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (
      window.confirm(
        t("confirmDeleteItem")
      )
    ) {
      try {
        const result = await deleteItemMutation.mutateAsync(itemId);
        if (result.success) {
          toast.success(
            t("itemDeletedSuccessfully")
          );
          refetch();
        } else {
          toast.error(
            result.errorMessage ||
              (isRTL ? "فشل في حذف الصنف" : t("failedToDeleteItem"))
          );
        }
      } catch (error) {
        toast.error(isRTL ? "حدث خطأ أثناء حذف الصنف" : "Error deleting item");
      }
    }
  };

  const handleToggleActivation = async (itemId: string) => {
    try {
      const result = await toggleActivationMutation.mutateAsync(itemId);
      if (result.success) {
        toast.success(
          isRTL
            ? "تم تغيير حالة الصنف بنجاح"
            : "Item status changed successfully"
        );
        refetch();
      } else {
        toast.error(
          result.errorMessage ||
            (isRTL ? "فشل في تغيير حالة الصنف" : "Failed to change item status")
        );
      }
    } catch (error) {
      toast.error(
        isRTL ? "حدث خطأ أثناء تغيير حالة الصنف" : "Error changing item status"
      );
    }
  };

  const handleItemSuccess = () => {
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
  }, [searchTerm, filterType, filterBranchId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل الأصناف" : "Error Loading Items"}
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
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("items")}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع الأصناف والخدمات الخاصة بك"
                    : "Manage all your products and services"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleCreateItem}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "صنف جديد" : "New Item"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Like SellInvoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Items */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {isRTL ? "إجمالي الأصناف" : "Total Items"}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(stats.total)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {isRTL ? "منتجات" : "Products"}
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {formatNumber(stats.products)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Box className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {isRTL ? "خدمات" : "Services"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(stats.services)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-emerald-600" />
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
                      isRTL ? "البحث في الأصناف..." : "Search items..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                    } py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value as "all" | "product" | "service"
                    )
                  }
                  className={`px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[150px] ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="all">
                    {isRTL ? "جميع الأنواع" : "All Types"}
                  </option>
                  <option value="product">
                    {isRTL ? "منتجات" : "Products"}
                  </option>
                  <option value="service">
                    {isRTL ? "خدمات" : "Services"}
                  </option>
                </select>
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
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                <span className="text-muted-foreground text-lg">
                  {isRTL ? "جاري تحميل الأصناف..." : "Loading items..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      {item.imageUrl && (
                        <div className="mb-4 rounded-lg overflow-hidden h-48 w-full relative group">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                            <span className="text-white text-sm truncate w-full">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      )}
                      <div
                        className={`flex items-start justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {item.name}
                          </CardTitle>
                          <Badge
                            variant={
                              item.type === "product" ? "default" : "secondary"
                            }
                            className={`${
                              item.type === "product"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            } font-medium`}
                          >
                            {item.type === "product"
                              ? isRTL
                                ? "منتج"
                                : "Product"
                              : isRTL
                              ? "خدمة"
                              : "Service"}
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
                              onClick={() => handleEditItem(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </Button>
                          )}
                          {roleAccess.canDelete() && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
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
                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "الكود" : "Code"}
                          </span>
                          <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.code}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "سعر البيع" : "Sale Price"}
                          </span>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(item.unitPrice)}
                          </span>
                        </div>

                        {/* Purchase Unit Price */}
                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "سعر الشراء" : "Purchase Price"}
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {formatCurrency(item.purchaseUnitPrice || 0)}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "الكمية" : "Quantity"}
                          </span>
                          <Badge variant="outline" className="font-medium">
                            {formatNumber(item.quantity)}
                          </Badge>
                        </div>

                        <div
                          className={`flex items-center justify-between ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "ض.ق.م" : "VAT"}
                          </span>
                          <span className="text-sm font-medium">
                            {formatNumber(item.vatRate)}%
                          </span>
                        </div>

                        {/* Activation Toggle */}
                        <div
                          className={`flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "الحالة" : "Status"}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm ${
                                item.isActive
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {item.isActive
                                ? isRTL
                                  ? "نشط"
                                  : "Active"
                                : isRTL
                                ? "غير نشط"
                                : "Inactive"}
                            </span>
                            {roleAccess.canEdit() && (
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() =>
                                  handleToggleActivation(item.id)
                                }
                                disabled={toggleActivationMutation.isPending}
                              />
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {item.description}
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
                          {isRTL ? "الكود" : "Code"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "الصورة" : "Image"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "الاسم" : "Name"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "النوع" : "Type"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "سعر البيع" : "Sale Price"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "سعر الشراء" : "Purchase Price"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "الكمية" : "Quantity"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "ض.ق.م %" : "VAT %"}
                        </th>
                        <th
                          className={`px-6 py-4 ${
                            isRTL ? "text-right" : "text-left"
                          } text-sm font-bold text-gray-900 dark:text-white`}
                        >
                          {isRTL ? "الحالة" : "Status"}
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
                      {items.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50/50 dark:bg-gray-700/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Package className="w-5 h-5 text-gray-400 mr-3" />
                              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {item.code}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 text-start">
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                item.type === "product"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`${
                                item.type === "product"
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                  : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              } font-medium`}
                            >
                              {item.type === "product"
                                ? isRTL
                                  ? "منتج"
                                  : "Product"
                                : isRTL
                                ? "خدمة"
                                : "Service"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {formatCurrency(item.unitPrice)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrency(item.purchaseUnitPrice || 0)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="font-medium">
                              {formatNumber(item.quantity)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium">{formatNumber(item.vatRate)}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-sm ${
                                  item.isActive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {item.isActive
                                  ? isRTL
                                    ? "نشط"
                                    : "Active"
                                  : isRTL
                                  ? "غير نشط"
                                  : "Inactive"}
                              </span>
                              {roleAccess.canEdit() && (
                                <Switch
                                  checked={item.isActive}
                                  onCheckedChange={() =>
                                    handleToggleActivation(item.id)
                                  }
                                  disabled={toggleActivationMutation.isPending}
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`flex space-x-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              {roleAccess.canEdit() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditItem(item)}
                                  className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                >
                                  <Edit className="w-4 h-4 text-blue-600" />
                                </Button>
                              )}
                              {roleAccess.canDelete() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteItem(item.id)}
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
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="mb-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          )}
                        </div>
                        <div
                          className={`flex items-start justify-between mb-3 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item.name}
                            </h3>
                            <div
                              className={`flex items-center space-x-2 mb-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {item.code}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              item.type === "product" ? "default" : "secondary"
                            }
                            className={`${
                              item.type === "product"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            } font-medium`}
                          >
                            {item.type === "product"
                              ? isRTL
                                ? "منتج"
                                : "Product"
                              : isRTL
                              ? "خدمة"
                              : "Service"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {isRTL ? "سعر البيع" : "Sale Price"}
                            </span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {item.unitPrice.toLocaleString()}{" "}
                              {isRTL ? "ج.م" : "EGP"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {isRTL ? "سعر الشراء" : "Purchase Price"}
                            </span>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {item.purchaseUnitPrice?.toLocaleString() || "0"}{" "}
                              {isRTL ? "ج.م" : "EGP"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                              {isRTL ? "الكمية" : "Quantity"}
                            </span>
                            <Badge variant="outline" className="font-medium">
                              {item.quantity}
                            </Badge>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* Activation Toggle for Mobile */}
                        <div
                          className={`flex items-center justify-between mb-3 pt-3 border-t border-gray-200 dark:border-gray-700 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {isRTL ? "الحالة" : "Status"}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm ${
                                item.isActive
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {item.isActive
                                ? isRTL
                                  ? "نشط"
                                  : "Active"
                                : isRTL
                                ? "غير نشط"
                                : "Inactive"}
                            </span>
                            {roleAccess.canEdit() && (
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() =>
                                  handleToggleActivation(item.id)
                                }
                                disabled={toggleActivationMutation.isPending}
                              />
                            )}
                          </div>
                        </div>

                        <div
                          className={`flex space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {roleAccess.canEdit() && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
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
                              onClick={() => handleDeleteItem(item.id)}
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
            {items.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                    <Package className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {isRTL ? "لا توجد أصناف" : "No items found"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                    {isRTL
                      ? "ابدأ بإضافة صنف جديد"
                      : "Start by adding your first item"}
                  </p>
                  <Button onClick={handleCreateItem} size="lg" className="px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    {isRTL ? "إضافة صنف" : "Add Item"}
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
                        ? `عرض ${items.length} من أصل ${totalCount} صنف`
                        : `Showing ${items.length} of ${totalCount} items`}
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
                        disabled={items.length < pagination.pageSize}
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

      {/* Item Modal */}
      {isModalOpen && (
        <ItemModal
          isOpen={isModalOpen}
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleItemSuccess}
        />
      )}
    </div>
  );
};

export default Items;
