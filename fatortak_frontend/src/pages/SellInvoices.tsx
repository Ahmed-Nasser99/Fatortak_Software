"use client";

import type React from "react";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  MoreVertical,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useInvoices,
  useDeleteInvoice,
  useDuplicateInvoice,
  useSendInvoice,
  useInvoice,
  useUpdateInvoiceStatus,
} from "../hooks/useInvoices";
import type { PaginationDto, InvoiceFilterDto } from "../types/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import EnhancedInvoiceModal from "../components/modals/EnhancedInvoiceModal";
import InvoiceDetailsModal from "../components/modals/InvoiceDetailsModal";
import EnhancedDeleteDialog from "../components/ui/enhanced-delete-dialog";
import InvoiceFilterModal from "@/components/modals/InvoiceFilterModal";
import InvoiceUpdateModal from "@/components/modals/InvoiceUpdateModal";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatDate, formatNumber } from "@/Helpers/localization";
import IntegratedInstallmentsManager from "@/components/modals/InstallmentsManager";
import { toast } from "react-toastify";
import { useCurrentCompany } from "@/hooks/useCompanies";

const SellInvoices: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [installmentsInvoiceId, setInstallmentsInvoiceId] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<InvoiceFilterDto>({
    invoiceType: "Sell",
  });

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  // Fetch invoices with filters
  const {
    data: invoicesResponse,
    isLoading,
    error,
    refetch,
  } = useInvoices(pagination, filters);

  const deleteInvoiceMutation = useDeleteInvoice();
  const duplicateInvoiceMutation = useDuplicateInvoice();
  const sendInvoiceMutation = useSendInvoice();
  const updateStatusMutation = useUpdateInvoiceStatus();

  const invoices = invoicesResponse?.success
    ? invoicesResponse.data?.data || []
    : [];
  const totalCount = invoicesResponse?.success
    ? invoicesResponse.data?.totalCount || 0
    : 0;

  const invoiceStats = invoicesResponse?.success
    ? invoicesResponse.data?.metaData || {}
    : {};
  const { data: companyResult, isLoading: companyLoading } =
    useCurrentCompany();
  const company = companyResult?.data;

  // Calculate stats with new structure
  const stats = {
    total: invoiceStats?.total || 0,
    draft: invoiceStats?.draft || 0,
    pending: invoiceStats?.pending || 0,
    cancelled: invoiceStats?.cancelled || 0,
    paid: invoiceStats?.paid || 0,
    overdue: invoiceStats?.overdue || 0,
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    const allStatuses = ["Draft", "Paid", "Pending", "Cancelled"];

    if (currentStatus?.toLowerCase() === "draft") {
      return ["Cancelled", "Paid", "Pending"];
    }
    if (currentStatus?.toLowerCase() === "cancelled") {
      return ["Draft", "Paid", "Pending"];
    }

    if (currentStatus?.toLowerCase() === "overdue") {
      return ["Paid", "Draft", "Cancelled"];
    }

    // Partially paid invoices can only be cancelled
    if (
      currentStatus?.toLowerCase() === "partialpaid" ||
      currentStatus?.toLowerCase() === "partpaid"
    ) {
      return ["Cancelled"];
    }

    return allStatuses.filter(
      (s) => s.toLowerCase() !== currentStatus?.toLowerCase()
    );
  };

  const handleEditInvoice = (invoiceId: string) => {
    setEditInvoiceId(invoiceId);
  };

  const handleCloseDetailsModal = () => {
    setViewInvoiceId(null);
  };

  const handleCloseEditModal = () => {
    setEditInvoiceId(null);
  };

  const handleSendInvoice = async (
    invoiceId: string,
    customerEmail: string
  ) => {
    try {
      const result = await sendInvoiceMutation.mutateAsync({
        id: invoiceId,
        data: {
          email: customerEmail,
          message: t("pleaseFindYourInvoiceAttached"),
        },
      });

      if (result.success) {
        toast.success(t("invoiceSentSuccessfully"));
        refetch();
      }
    } catch (error) {
      toast.error(t("failedToSendInvoice"));
    }
  };

  const handleUpdateStatus = async (invoiceId: string, status: string) => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        id: invoiceId,
        status,
      });

      if (result.success) {
        toast.success(t("invoiceStatusUpdated"));
        refetch();
      }
    } catch (error) {
      console.log(error);
      toast.error(t(error?.message) ?? t("failedToUpdateStatus"));
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast.info(t("downloadingInvoice"));
  };

  const handleGenerateQR = (invoiceId: string) => {
    toast.info(t("qrCodeGeneratedForInvoice"));
  };
  const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return "";

    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, "");

    // If phone doesn't start with country code, assume it's Egyptian (+20)
    if (cleanPhone.length === 10 && !cleanPhone.startsWith("20")) {
      cleanPhone = "+20" + cleanPhone;
    }

    return cleanPhone;
  };
  const handleShareInvoice = (invoice: any) => {
    const formattedPhone = formatPhoneForWhatsApp(invoice?.customerPhoneNumber);

    // Prepare the message based on language
    const message = isRTL
      ? `تفاصيل الفاتورة\n\n` +
        `رقم الفاتورة: ${invoice.invoiceNumber}\n` +
        `العميل: ${invoice.customerName}\n` +
        `المبلغ: ${invoice.total} ${invoice.currency}\n` +
        `الحالة: ${t(`${invoice.status.toLowerCase()}Status`)}\n` +
        `تاريخ الإصدار: ${formatDate(invoice.issueDate)}\n` +
        `تاريخ الاستحقاق: ${formatDate(invoice.dueDate)}\n` +
        `رابط الفاتورة: ${window.location.origin}/invoice/${invoice.id}/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplate || "modern-gradient"
            : company?.purchaseInvoiceTemplate || "modern-gradient"
        }/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplateColor || "professional-dark"
            : company?.purchaseInvoiceTemplateColor || "professional-dark"
        }`
      : `Invoice Details\n\n` +
        `Invoice Number: ${invoice.invoiceNumber}\n` +
        `Customer: ${invoice.customerName}\n` +
        `Amount: ${invoice.total} ${invoice.currency}\n` +
        `Status: ${t(`${invoice.status.toLowerCase()}Status`)}\n` +
        `Issue Date: ${formatDate(invoice.issueDate)}\n` +
        `Due Date: ${formatDate(invoice.dueDate)}\n` +
        `View And Download: ${window.location.origin}/invoice/${
          invoice.id
        }/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplate || "modern-gradient"
            : company?.purchaseInvoiceTemplate || "modern-gradient"
        }/${
          invoice?.invoiceType?.toLowerCase() == "sell"
            ? company?.saleInvoiceTemplateColor || "professional-dark"
            : company?.purchaseInvoiceTemplateColor || "professional-dark"
        }`;

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);

    let whatsappUrl;
    if (formattedPhone) {
      whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    } else {
      whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    }

    // For mobile devices, try to open WhatsApp app directly
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      // Try WhatsApp app first, fallback to web
      try {
        window.location.href = `whatsapp://send?phone=${formattedPhone}&text=${encodedMessage}`;
        // Fallback to web version after a short delay
        setTimeout(() => {
          window.open(whatsappUrl, "_blank");
        }, 1000);
      } catch (error) {
        window.open(whatsappUrl, "_blank");
      }
    } else {
      // Desktop - open WhatsApp Web
      window.open(whatsappUrl, "_blank");
    }
  };
  const handleApplyFilters = (newFilters: any) => {
    const updatedFilters = {
      ...newFilters,
      invoiceType: "Sell", // Ensure we always filter for Sell invoices
    };
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, pageNumber: 1 })); // Reset to first page when filters change
    setIsFilterModalOpen(false);
  };

  const handleNewInvoice = () => {
    setIsModalOpen(true);
  };

  const handleViewInvoice = (invoiceId: string) => {
    setViewInvoiceId(invoiceId);
  };

  const { data: singleInvoiceResponse, isLoading: isLoadingDetails } =
    useInvoice(viewInvoiceId || editInvoiceId || "");

  const handleDeleteInvoice = (invoiceId: string) => {
    setDeleteInvoiceId(invoiceId);
  };

  const invoiceDetails = singleInvoiceResponse?.success
    ? singleInvoiceResponse.data
    : null;

  const { data: editInvoiceResponse, isLoading: isLoadingEditInvoice } =
    useInvoice(editInvoiceId || "");

  const editInvoiceData = editInvoiceResponse?.success
    ? editInvoiceResponse.data
    : null;

  const handleConfirmDelete = async () => {
    if (!deleteInvoiceId) return;

    try {
      const result = await deleteInvoiceMutation.mutateAsync(deleteInvoiceId);

      if (result.success) {
        toast.success(t("deleted"));
        setDeleteInvoiceId(null);
        refetch();
      }
    } catch (error) {
      toast.error(t("failedToDeleteInvoice"));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <CheckCircle className="w-3 h-3" />;
      case "sent":
        return <Send className="w-3 h-3" />;
      case "draft":
        return <Clock className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      case "overdue":
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const handleViewInstallments = (invoiceId: string) => {
    setInstallmentsInvoiceId(invoiceId);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL
                  ? "خطأ في تحميل الفواتير"
                  : "Error Loading Sell Invoices"}
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
      <div className="container !max-w-full mx-auto p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "فواتير المبيعات" : "Sales Invoices"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة جميع فواتير المبيعات الخاصة بك"
                    : "Manage all your sales invoices"}
                </p>
              </div>
            </div>

            {roleAccess.canCreate() && (
              <Button
                onClick={handleNewInvoice}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {isRTL ? "إنشاء فاتورة مبيعات" : "Create Sales Invoice"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Stats Grid - Updated with new structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {isRTL ? "إجمالي الفواتير" : "Total Invoices"}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {formatNumber(stats.total)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {isRTL ? "مسودة" : "Draft"}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatNumber(stats.draft)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    {isRTL ? "معلقة" : "Pending"}
                  </p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {formatNumber(stats.pending)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {isRTL ? "مدفوعة" : "Paid"}
                  </p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {formatNumber(stats.paid)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {isRTL ? "متأخرة" : "Overdue"}
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatNumber(stats.overdue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    {isRTL ? "ملغية" : "Cancelled"}
                  </p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {formatNumber(stats.cancelled)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col xl:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-4" : "left-4"
                  } w-5 h-5 text-muted-foreground`}
                />
                <input
                  type="text"
                  placeholder={t("searchInvoices")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    // Add search term to filters
                    setFilters((prev) => ({ ...prev, search: e.target.value }));
                  }}
                  className={`w-full py-3 px-4 ${
                    isRTL ? "pr-12 text-right" : "pl-12"
                  } border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setStatusFilter(newStatus);
                    setFilters((prev) => ({ ...prev, status: newStatus }));
                  }}
                  className={`w-full py-3 px-4 border rounded-xl bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 ${
                    isRTL ? "text-right" : ""
                  }`}
                >
                  <option value="">{t("allStatus")}</option>
                  <option value="Draft">{t("status.draft")}</option>
                  <option value="Pending">{t("status.pending")}</option>
                  <option value="Paid">{t("status.paid")}</option>
                  <option value="Overdue">{t("status.overdue")}</option>
                  <option value="Cancelled">{t("status.cancelled")}</option>
                  <option value="PartialPaid">{t("status.partialpaid")}</option>
                </select>
                <Button
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(true)}
                  className="bg-background/60 backdrop-blur-sm hover:bg-background/80"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {t("moreFilters")}
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
                  {isRTL ? "جاري تحميل الفواتير..." : "Loading invoices..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && (
          <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("invoiceNumber")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("customer")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "المشروع" : "Project"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("amount")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "المدفوع" : "Paid"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {isRTL ? "المتبقي" : "Remaining"}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("status")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("date")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("dueDate")}
                      </th>
                      <th
                        className={`px-6 py-4 text-${
                          isRTL ? "right" : "left"
                        } text-sm font-semibold text-muted-foreground`}
                      >
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {invoices.map((invoice: any) => (
                      <tr
                        key={invoice.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium">
                              {invoice.invoiceNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <span>{invoice.customerName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-muted-foreground">
                              {invoice.projectName || "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold">
                              {formatCurrency(invoice.total)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("vatLabel")}:{" "}
                              {formatCurrency(invoice.vatAmount)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("discountLabel")}:{" "}
                              {formatCurrency(invoice.totalDiscount)}{" "}
                              {invoice.currency || "EGP"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(invoice.amountPaid || 0)}{" "}
                            {invoice.currency || "EGP"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-rose-600 dark:text-rose-400">
                            {formatCurrency(invoice.remainingAmount)}{" "}
                            {invoice.currency || "EGP"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  disabled={roleAccess.canEdit() === false}
                                  className={`h-auto p-2 ${getStatusColor(
                                    invoice.status
                                  )} border hover:opacity-80`}
                                >
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(invoice.status)}
                                    <span className="text-xs font-medium">
                                      {t(
                                        `${invoice.status.toLowerCase()}Status`
                                      )}
                                    </span>
                                    <MoreVertical className="w-3 h-3" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align={isRTL ? "start" : "end"}
                              >
                                {getAvailableStatusOptions(invoice.status).map(
                                  (status) => (
                                    <DropdownMenuItem
                                      key={status}
                                      onClick={() =>
                                        handleUpdateStatus(invoice.id, status)
                                      }
                                      className="flex items-center space-x-2"
                                    >
                                      {getStatusIcon(status)}
                                      <span>
                                        {t(`${status.toLowerCase()}Status`)}
                                      </span>
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(invoice.issueDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                dir={isRTL ? "rtl" : "ltr"}
                                onClick={() => handleViewInvoice(invoice.id)}
                              >
                                <Eye className="w-4 h-4 mx-2" /> {t("details")}
                              </DropdownMenuItem>

                              {roleAccess.canEdit() && (
                                <DropdownMenuItem
                                  dir={isRTL ? "rtl" : "ltr"}
                                  onClick={() => handleEditInvoice(invoice.id)}
                                >
                                  <Edit className="w-4 h-4 mx-2 text-emerald-600" />{" "}
                                  {t("edit")}
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                dir={isRTL ? "rtl" : "ltr"}
                                onClick={() => handleShareInvoice(invoice)}
                              >
                                <Share2 className="w-4 h-4 mx-2 text-green-600" />{" "}
                                {t("share")}
                              </DropdownMenuItem>

                              {invoice?.hasInstallments && (
                                <DropdownMenuItem
                                  dir={isRTL ? "rtl" : "ltr"}
                                  onClick={() =>
                                    handleViewInstallments(invoice.id)
                                  }
                                >
                                  <Calendar className="w-4 h-4 mx-2 text-purple-600" />{" "}
                                  {t("viewInstallments")}
                                </DropdownMenuItem>
                              )}

                              {roleAccess.canDelete() && (
                                <DropdownMenuItem
                                  dir={isRTL ? "rtl" : "ltr"}
                                  onClick={() =>
                                    handleDeleteInvoice(invoice.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mx-2" />{" "}
                                  {t("delete")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-border/50">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="p-4 space-y-4">
                  <div className={`flex items-start justify-between`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {invoice?.invoiceNumber}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice?.customerName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${getStatusColor(invoice.status)} border`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(invoice.status)}
                        <span className="text-xs">
                          {t(`${invoice.status.toLowerCase()}Status`)}
                        </span>
                      </div>
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">
                        {t("amount")}
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(invoice.total)}{" "}
                        {invoice.currency || "EGP"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">
                        {t("dueDate")}
                      </span>
                      <span>
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewInvoice(invoice.id)}
                      className="flex-1 min-w-0"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {t("view")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareInvoice(invoice)}
                      className="flex-1 min-w-0"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      {t("share")}
                    </Button>
                    {roleAccess.canEdit() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice.id)}
                        className="flex-1 min-w-0"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {t("edit")}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      className="flex-1 min-w-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      {t("download")}
                    </Button>
                    {invoice?.hasInstallments && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInstallments(invoice.id)}
                        className="flex-1 min-w-0"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {t("viewInstallments")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            <div className="border-t bg-muted/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${invoices.length} من ${totalCount} فواتير`
                    : `Showing ${invoices.length} of ${totalCount} invoices`}
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
                    disabled={invoices.length < pagination.pageSize}
                  >
                    {isRTL ? "التالي" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Empty State */}
        {!isLoading && invoices.length === 0 && (
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("noInvoicesFound")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("getStartedByCreatingNewInvoice")}
              </p>
              <Button
                onClick={handleNewInvoice}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("createFirstInvoice")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <EnhancedInvoiceModal
        isSell={true}
        isOpen={isModalOpen}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
        onClose={() => setIsModalOpen(false)}
      />

      <InvoiceFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isSell={true}
      />

      {editInvoiceId && editInvoiceData && (
        <InvoiceUpdateModal
          isSell={true}
          invoice={editInvoiceData}
          onSave={() => {
            setEditInvoiceId(null);
            refetch();
          }}
          onClose={handleCloseEditModal}
        />
      )}

      {viewInvoiceId && invoiceDetails && (
        <InvoiceDetailsModal
          isOpen={!!viewInvoiceId}
          onClose={handleCloseDetailsModal}
          invoice={invoiceDetails}
        />
      )}

      {installmentsInvoiceId && (
        <IntegratedInstallmentsManager
          invoiceId={installmentsInvoiceId}
          invoice={invoices.find((inv) => inv.id === installmentsInvoiceId)}
          isOpen={!!installmentsInvoiceId}
          onClose={() => setInstallmentsInvoiceId(null)}
          onUpdate={refetch}
        />
      )}

      <EnhancedDeleteDialog
        isOpen={!!deleteInvoiceId}
        onClose={() => setDeleteInvoiceId(null)}
        onConfirm={handleConfirmDelete}
        title={t("deleteInvoice")}
        description={t("areYouSureYouWantToDeleteThisInvoice")}
        itemName={
          invoices.find((inv) => inv.id === deleteInvoiceId)?.invoiceNumber
        }
        isLoading={deleteInvoiceMutation.isPending}
      />
    </div>
  );
};

export default SellInvoices;
