"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  User,
  Package,
  Save,
  Loader2,
  Calendar,
  FileText,
  Paperclip,
} from "lucide-react";
import { AccountDto } from "../../types/api";
import { accountingService } from "../../services/accountingService";
import { format } from "date-fns";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCustomers } from "../../hooks/useCustomers";
import { useItems } from "../../hooks/useItems";
import { useCreateInvoice } from "../../hooks/useInvoices";
import CustomerModal from "./CustomerModal";
import ItemModal from "./ItemModal";
import SearchableDropdown from "../ui/SearchableDropdown";
import PartialPaymentPreviewModal from "./PartialPaymentPreviewModal";
import { toast } from "react-toastify";
import BranchSelector from "../ui/BranchSelector";
import { useMainBranch } from "../../hooks/useBranches";
import {
  formatNumber,
  formatDate,
  parseLocalDate,
} from "@/Helpers/localization";
import { DatePicker } from "../ui/date-picker";
import ProjectSelector from "../ui/ProjectSelector";

interface InvoiceItem {
  id: string;
  itemId: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
}

interface Installment {
  dueDate: string;
  amount: number;
}

interface EnhancedInvoiceModalProps {
  isOpen: boolean;
  isSell: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: { projectId?: string };
}

const EnhancedInvoiceModal: React.FC<EnhancedInvoiceModalProps> = ({
  isOpen,
  isSell,
  onClose,
  onSuccess,
  initialData,
}) => {
  const { isRTL, t } = useLanguage();
  const createInvoiceMutation = useCreateInvoice();

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerId: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: "",
    notes: "",
    status: "Draft" as string,
    invoiceType: isSell ? "Sell" : "Buy",
    branchId: "",
    projectId: initialData?.projectId || "",
    paymentAccountId: "",
  });

  const [attachment, setAttachment] = useState<File | null>(null);

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [benefits, setBenefits] = useState<number>(0);
  const [numberOfInstallments, setNumberOfInstallments] = useState<number>(0);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [showInstallmentSection, setShowInstallmentSection] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const { data: mainBranchResult } = useMainBranch();

  useEffect(() => {
    if (mainBranchResult?.data && !invoiceData.branchId) {
      setInvoiceData((prev) => ({
        ...prev,
        branchId: mainBranchResult.data.id,
      }));
    }
  }, [mainBranchResult, isOpen]);

  // Fetch customers and items from API
  const { data: customersResponse, isLoading: loadingCustomers } = useCustomers(
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      isSupplier: !isSell,
      isActive: true,
    },
  );
  const { data: itemsResponse, isLoading: loadingItems } = useItems(
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      isActive: true,
    },
  );

  const customers = customersResponse?.success
    ? customersResponse.data?.data || []
    : [];
  const items = itemsResponse?.success ? itemsResponse.data?.data || [] : [];

  const statusOptions = [
    { value: "Draft", label: t("draftStatus") || "Draft" },
    // { value: "Pending", label: t("pendingStatus") || "Pending" },
    { value: "Paid", label: t("paidStatus") || "Paid" },
    // { value: "PartialPaid", label: t("partialPaidStatus") || "Partial Paid" },
    { value: "partPaid", label: t("partPaidStatus") || "Part Paid" },
  ];

  useEffect(() => {
    if (isOpen) {
      // Set due date to 30 days from now by default

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setInvoiceData((prev) => ({
        ...prev,
        dueDate: format(dueDate, "yyyy-MM-dd"),
      }));

      if (initialData?.projectId) {
        setInvoiceData((prev) => ({
          ...prev,
          projectId: initialData.projectId,
        }));
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const result = await accountingService.getAccounts({
          pageNumber: 1,
          pageSize: 1000,
        });
        if (result.success && result.data?.data) {
          setAccounts(result.data.data);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Show installment section if status is PartialPaid or if numberOfInstallments > 0
    setShowInstallmentSection(
      invoiceData.status === "PartialPaid" || numberOfInstallments > 0,
    );

    // Auto-generate installments when numberOfInstallments changes
    if (numberOfInstallments > 0 && installments.length === 0) {
      generateInstallments();
    }
  }, [invoiceData.status, numberOfInstallments]);

  const calculateItemTotal = (
    quantity: number,
    unitPrice: number,
    vatRate: number,
    discount: number,
  ) => {
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = afterDiscount * vatRate;
    return afterDiscount + vatAmount;
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const totalDiscount = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + itemSubtotal * (item.discount / 100);
    }, 0);
    const afterDiscount = subtotal - totalDiscount;
    const vatTotal = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscountAmount = itemSubtotal * (item.discount / 100);
      const itemAfterDiscount = itemSubtotal - itemDiscountAmount;
      return sum + itemAfterDiscount * item.vatRate;
    }, 0);
    const baseTotal = afterDiscount + vatTotal;
    const total = baseTotal + (showInstallmentSection ? benefits : 0);
    return {
      subtotal,
      totalDiscount,
      vatTotal,
      total: baseTotal,
      adjustedTotal: total,
    };
  };

  const generateInstallments = () => {
    const { adjustedTotal } = calculateTotals();
    const remainingAmount = adjustedTotal - downPayment;

    if (numberOfInstallments > 0 && remainingAmount > 0) {
      const installmentAmount =
        Math.round((remainingAmount / numberOfInstallments) * 100) / 100;
      const newInstallments: Installment[] = [];

      for (let i = 1; i <= numberOfInstallments; i++) {
        const dueDate = new Date(invoiceData?.issueDate || new Date());

        // Move forward i months
        dueDate.setMonth(dueDate.getMonth() + i);

        // Force it to the first day of the month
        dueDate.setDate(1);

        newInstallments.push({
          dueDate: format(dueDate, "yyyy-MM-dd"),
          amount:
            i === numberOfInstallments
              ? remainingAmount - installmentAmount * (numberOfInstallments - 1)
              : installmentAmount,
        });
      }

      setInstallments(newInstallments);
    }
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value;
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);
    setInvoiceData((prev) => ({
      ...prev,
      customerId,
      customerName: customer?.name || "",
    }));
  };

  const handleAddItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newInvoiceItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      description: item.description,
      quantity: 1,
      unitPrice: isSell ? item.unitPrice || 0 : item.purchaseUnitPrice || 0,
      vatRate: item.vatRate || 0.14,
      discount: (item.discount || 0) * 100, // Convert from decimal to percentage for display
      total: calculateItemTotal(
        1,
        isSell ? item.unitPrice || 0 : item.purchaseUnitPrice || 0,
        item.vatRate || 0.14,
        (item.discount || 0) * 100,
      ),
    };

    setInvoiceItems((prev) => [...prev, newInvoiceItem]);
  };

  const handleUpdateItem = (itemId: string, field: string, value: number) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          updatedItem.total = calculateItemTotal(
            updatedItem.quantity,
            updatedItem.unitPrice,
            updatedItem.vatRate,
            updatedItem.discount,
          );
          return updatedItem;
        }
        return item;
      }),
    );
  };

  const handleUpdateInstallment = (
    index: number,
    field: string,
    value: any,
  ) => {
    setInstallments((prev) =>
      prev.map((inst, i) => (i === index ? { ...inst, [field]: value } : inst)),
    );
  };

  const addInstallment = () => {
    setInstallments((prev) => [
      ...prev,
      { dueDate: format(new Date(), "yyyy-MM-dd"), amount: 0 },
    ]);
  };

  const removeInstallment = (index: number) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
  };

  const invoiceTypes = [
    { value: "Buy", label: t("buyInvoice") || "Buy Invoice" },
    { value: "Sell", label: t("sellInvoice") || "Sell Invoice" },
  ];

  const handleRemoveItem = (itemId: string) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceData.customerId) {
      toast.error(t("pleaseSelectCustomer") || "Please select a customer");
      return;
    }

    if (invoiceItems.length === 0) {
      toast.error(
        t("pleaseAddAtLeastOneItem") || "Please add at least one item",
      );
      return;
    }

    if (invoiceData.status === "PartialPaid" || numberOfInstallments > 0) {
      const { adjustedTotal } = calculateTotals();
      const installmentsTotal = installments.reduce(
        (sum, inst) => sum + inst.amount,
        0,
      );

      if (Math.abs(installmentsTotal + downPayment - adjustedTotal) > 0.01) {
        toast.error(
          t("installmentsMustEqualTotal") ||
            "Installments plus down payment must equal the total amount",
        );
        return;
      }

      setShowPreviewModal(true);
      return;
    }

    await submitInvoice();
  };

  const submitInvoice = async () => {
    const { subtotal, totalDiscount, vatTotal, total, adjustedTotal } =
      calculateTotals();

    // Account Balance Validation for Purchase Invoices
    if (
      !isSell &&
      (invoiceData.status === "Paid" || invoiceData.status === "PartialPaid")
    ) {
      const paymentAmount =
        invoiceData.status === "Paid" ? adjustedTotal : downPayment;
      if (paymentAmount > 0) {
        const selectedAccount = accounts.find(
          (a) => a.id === invoiceData.paymentAccountId,
        );
        if (selectedAccount && (selectedAccount.balance || 0) < paymentAmount) {
          toast.error(
            `${isRTL ? "رصيد غير كافٍ في" : "Insufficient funds in"} ${
              selectedAccount.name
            }. ${isRTL ? "المتاح" : "Available"}: ${formatNumber(
              selectedAccount.balance || 0,
            )} EGP`,
          );
          return;
        }
      }
    }

    try {
      // Check if this is a partial payment invoice (either by status or having installments)
      const hasInstallments =
        invoiceData.status === "PartialPaid" || numberOfInstallments > 0;

      const invoiceCreateData = {
        customerName: invoiceData.customerName,
        customerId: invoiceData.customerId,
        issueDate: new Date(invoiceData.issueDate || new Date()).toISOString(),
        dueDate: new Date(invoiceData.dueDate).toISOString(),
        notes: invoiceData.notes,
        total,
        vatTotal,
        discount: totalDiscount,
        currency: "EGP",
        status: invoiceData.status,
        invoiceType: isSell ? "Sell" : "Buy",
        branchId: invoiceData.branchId,
        projectId: invoiceData.projectId,
        paymentAccountId: invoiceData.paymentAccountId,
        items: invoiceItems.map((item) => ({
          ...item,
          discount: item.discount / 100,
        })),
        downPayment: hasInstallments ? downPayment : 0,
        numberOfInstallments: hasInstallments ? numberOfInstallments : 0,
        benefits: hasInstallments ? benefits : 0,
        installments:
          hasInstallments && installments.length > 0
            ? installments.map((inst) => ({
                dueDate: new Date(inst.dueDate).toISOString(),
                amount: inst.amount,
              }))
            : undefined,
        attachment: attachment || undefined,
      };

      const result = await createInvoiceMutation.mutateAsync(invoiceCreateData);

      if (result.success) {
        toast.success(
          t("invoiceCreatedSuccessfully") || "Invoice created successfully",
        );

        // Reset form
        setInvoiceData({
          customerName: "",
          customerId: "",
          issueDate: format(new Date(), "yyyy-MM-dd"),
          dueDate: "",
          notes: "",
          status: "Draft",
          invoiceType: isSell ? "Sell" : "Buy",
          branchId: mainBranchResult?.data?.id || "",
          projectId: "",
          paymentAccountId: "",
        });
        setInvoiceItems([]);
        setSelectedCustomer(null);
        setDownPayment(0);
        setBenefits(0);
        setNumberOfInstallments(0);
        setInstallments([]);
        setAttachment(null);
        setShowPreviewModal(false);
        onSuccess();
      } else {
        toast.error(
          result.errorMessage ||
            t("failedToCreateInvoice") ||
            "Failed to create invoice",
        );
      }
    } catch (error) {
      toast.error(t("failedToCreateInvoice") || "Failed to create invoice");
    }
  };

  const { subtotal, totalDiscount, vatTotal, total, adjustedTotal } =
    calculateTotals();
  const remainingAmount = adjustedTotal - downPayment;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-7xl max-h-[95vh] overflow-hidden animate-scale-in">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20"></div>
          <div className={`flex items-center justify-between relative z-10`}>
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 mx-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {t("newInvoice") || "Create New Invoice"}
                </h2>
                <p className="text-purple-100">
                  {t("createInvoiceDescription") ||
                    "Generate professional invoices with ease"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Invoice Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Package className="w-6 h-6 mr-3 text-purple-600" />
                {t("invoiceDetails") || "Invoice Details"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("status") || "Status"}
                  </label>
                  <select
                    value={invoiceData.status}
                    onChange={(e) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {(invoiceData.status === "Paid" ||
                  invoiceData.status === "PartialPaid") && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {isRTL ? "حساب الدفع" : "Payment Account"} *
                    </label>
                    <select
                      value={invoiceData.paymentAccountId}
                      onChange={(e) =>
                        setInvoiceData((prev) => ({
                          ...prev,
                          paymentAccountId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                      required
                    >
                      <option value="">
                        {isRTL ? "اختر الحساب" : "Select Account"}
                      </option>
                      {accounts
                        .filter((acc) => {
                          if (isSell) {
                            // Sales: Cash (1000) or Bank (1100)
                            return (
                              acc.accountCode.startsWith("1000") ||
                              acc.accountCode.startsWith("110") ||
                              acc.accountCode.startsWith("120")
                            ); // Adjusted logic to find cash/bank
                          } else {
                            // Purchase: Cash, Bank, or Custody (1500)
                            return (
                              acc.accountCode.startsWith("1000") ||
                              acc.accountCode.startsWith("110") ||
                              acc.accountCode.startsWith("1500")
                            );
                          }
                        })
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountCode} - {acc.name} (
                            {formatNumber(acc.balance || 0)})
                          </option>
                        ))}
                    </select>
                    {!isSell &&
                      invoiceData.paymentAccountId &&
                      (() => {
                        const acc = accounts.find(
                          (a) => a.id === invoiceData.paymentAccountId,
                        );
                        const paymentAmount =
                          invoiceData.status === "Paid"
                            ? adjustedTotal
                            : downPayment;
                        if (acc && (acc.balance || 0) < paymentAmount) {
                          return (
                            <p className="text-xs text-red-600 font-bold mt-1.5 animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                              {isRTL ? "رصيد غير كافٍ" : "Insufficient balance"}
                            </p>
                          );
                        }
                        return null;
                      })()}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("issueDate") || "Issue Date"}
                  </label>
                  <DatePicker
                    date={parseLocalDate(invoiceData.issueDate)}
                    setDate={(date) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        issueDate: date ? format(date, "yyyy-MM-dd") : "",
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t("dueDate") || "Due Date"}
                  </label>
                  <DatePicker
                    date={parseLocalDate(invoiceData.dueDate)}
                    setDate={(date) =>
                      setInvoiceData((prev) => ({
                        ...prev,
                        dueDate: date ? format(date, "yyyy-MM-dd") : "",
                      }))
                    }
                    disabled={!invoiceData.issueDate}
                  />
                </div>

                <div className="lg:col-span-1">
                  <BranchSelector
                    value={invoiceData.branchId}
                    onChange={(value) =>
                      setInvoiceData((prev) => ({ ...prev, branchId: value }))
                    }
                    label={isRTL ? "الفرع" : "Branch"}
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {isRTL ? "المشروع" : "Project"}
                  </label>
                  <ProjectSelector
                    value={invoiceData.projectId}
                    onChange={(value) =>
                      setInvoiceData((prev) => ({ ...prev, projectId: value }))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className={`flex items-center justify-between mb-6`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <User className="w-6 h-6 mr-3 text-blue-600" />
                  {!isSell ? t("supplier") : t("client") || "Customer"} *
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {!isSell
                      ? t("newSupplier")
                      : t("newClient") || "New Customer"}
                  </span>
                </button>
              </div>

              {loadingCustomers ? (
                <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("loading") || "Loading"}...
                  </span>
                </div>
              ) : (
                <SearchableDropdown
                  options={customers.map((customer) => ({
                    value: customer.id,
                    label: customer.name,
                  }))}
                  value={invoiceData.customerId}
                  onChange={(value) => {
                    const customer = customers.find((c) => c.id === value);
                    setSelectedCustomer(customer);
                    setInvoiceData((prev) => ({
                      ...prev,
                      customerId: value,
                      customerName: customer?.name || "",
                    }));
                  }}
                  placeholder={
                    isSell
                      ? t("selectClient") || "Select Client"
                      : t("selectSupplier") || "Select Supplier"
                  }
                  isLoading={loadingCustomers}
                  isRTL={isRTL}
                />
              )}
            </div>

            {/* Items Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className={`flex items-center justify-between mb-6`}>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <Package className="w-6 h-6 mr-3 text-green-600" />
                  {t("items") || "Items"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowItemModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("newItem") || "New Item"}</span>
                </button>
              </div>

              {/* Add Item Dropdown */}
              <div className="mb-6">
                {loadingItems ? (
                  <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {t("loading") || "Loading"}...
                    </span>
                  </div>
                ) : (
                  <SearchableDropdown
                    options={items?.map((item) => {
                      const price = isSell
                        ? (item.unitPrice ?? 0)
                        : (item.purchaseUnitPrice ?? 0);

                      const qty = item.quantity ?? 0;

                      const label = isRTL
                        ? `${item.name} • ${
                            isSell ? t("sellPrice") : t("purchasePrice")
                          }: ${formatNumber(price)} • ${t("available")}: ${formatNumber(qty)}`
                        : `${item.name} | ${formatNumber(price)} ${
                            t("currency") ?? "EGP"
                          } | ${formatNumber(qty)} ${t("inStock")}`;

                      return {
                        value: item.id,
                        label,
                      };
                    })}
                    value=""
                    onChange={(value) => value && handleAddItem(value)}
                    placeholder={t("addItem")}
                    isLoading={loadingItems}
                    isRTL={isRTL}
                  />
                )}
              </div>

              {/* Desktop Items Table */}
              <div className="hidden lg:block">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white">
                          {t("item") || "Item"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("quantity") || "Qty"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("price") || "Price"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("discount") || "Discount"} (%)
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("vatRate") || "VAT %"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("total") || "Total"}
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">
                          {t("actions") || "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {invoiceItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50/50 dark:bg-gray-700/30"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {item.itemName}
                              </div>
                              {item.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "quantity",
                                  Number.parseInt(e.target.value) || 1,
                                )
                              }
                              className="w-20 px-3 py-2 text-center border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "unitPrice",
                                  Number.parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-28 px-3 py-2 text-center border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={item.discount}
                                onChange={(e) =>
                                  handleUpdateItem(
                                    item.id,
                                    "discount",
                                    Number.parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-20 px-3 py-2 text-center border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200 pr-6"
                              />
                              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <select
                              value={item.vatRate}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  "vatRate",
                                  Number.parseFloat(e.target.value),
                                )
                              }
                              className="w-20 px-2 py-1 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            >
                              <option value={0}>0%</option>
                              <option value={0.05}>5%</option>
                              <option value={0.14}>14%</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatNumber(item.total, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Items Cards */}
              <div className="lg:hidden space-y-4">
                {invoiceItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {item.itemName}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t("quantity") || "Quantity"}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "quantity",
                              Number.parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t("price") || "Price"}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "unitPrice",
                              Number.parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          {t("discount") || "Discount"} (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "discount",
                                Number.parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200 pr-8"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {t("vatRate") || "VAT %"}
                      </label>
                      <select
                        value={item.vatRate}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            "vatRate",
                            Number.parseFloat(e.target.value),
                          )
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                      >
                        <option value={0}>0%</option>
                        <option value={0.05}>5%</option>
                        <option value={0.14}>14%</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attachment Section */}
            <div className="bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Paperclip className="w-6 h-6 mr-3 text-indigo-600" />
                {isRTL ? "المرفقات" : "Attachments"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isRTL ? "إرفاق ملف" : "Attach File"} (PDF, JPEG, PNG,
                      etc.)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        onChange={(e) =>
                          setAttachment(e.target.files?.[0] || null)
                        }
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl group-hover:border-indigo-500 transition-all duration-200 bg-white dark:bg-gray-800">
                        <Paperclip className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {attachment
                            ? attachment.name
                            : isRTL
                              ? "اختر ملفاً..."
                              : "Choose a file..."}
                        </span>
                      </div>
                    </div>
                  </div>
                  {attachment && (
                    <div className="pt-7">
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {attachment && (
                  <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 animate-fade-in">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      {attachment.name} ({(attachment.size / 1024).toFixed(1)}{" "}
                      KB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Totals Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {t("subtotal") || "Subtotal"}:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(subtotal, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {t("totalDiscount") || "Total Discount"}:
                  </span>
                  <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{" "}
                    {formatNumber(totalDiscount, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg text-gray-600 dark:text-gray-400">
                    {t("vatLabel") || "VAT"}:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(vatTotal, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("baseTotal") || "Base Total"}:
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatNumber(total, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                {showInstallmentSection && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {t("benefits") || "Benefits/Interest"}:
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        +{" "}
                        {formatNumber(benefits, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {t("downPayment") || "Down Payment"}:
                      </span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        -{" "}
                        {formatNumber(downPayment, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg text-gray-600 dark:text-gray-400">
                        {t("remainingAmount") || "Remaining Amount"}:
                      </span>
                      <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {formatNumber(remainingAmount, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {t("adjustedTotal") || "Adjusted Total"}:
                      </span>
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(adjustedTotal, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </>
                )}
                {!showInstallmentSection && (
                  <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-4">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {t("total") || "Total"}:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatNumber(total, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {showInstallmentSection && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-orange-600" />
                  {t("paymentSchedule") || "Payment Schedule"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("downPayment") || "Down Payment"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={adjustedTotal}
                      value={downPayment}
                      onChange={(e) => {
                        const value = Number.parseFloat(e.target.value) || 0;
                        setDownPayment(Math.min(value, adjustedTotal));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("max")}:{" "}
                      {formatNumber(adjustedTotal, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("numberOfInstallmentMonths") ||
                        "Number of Installments"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={numberOfInstallments}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value) || 0;
                        setNumberOfInstallments(Math.min(value, 60));
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {t("max60Months") || "Max: 60 months"}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t("benefits") || "Benefits/Interest"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={benefits}
                      onChange={(e) =>
                        setBenefits(Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("remainingToDistribute", {
                      amount: remainingAmount.toFixed(2),
                    }) || ""}
                  </span>
                  <button
                    type="button"
                    onClick={generateInstallments}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {t("generateInstallmentSchedule") ||
                      "Generate Installment Schedule"}
                  </button>
                </div>

                {installments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("installmentSchedule")} {installments.length}{" "}
                      {t("payments")}
                    </h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {installments.map((installment, index) => (
                        <div
                          key={index}
                          className={`group bg-white relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg`}
                        >
                          {/* Status Indicator Bar */}
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 bg-purple-500`}
                          />

                          <div className="p-4 pl-6">
                            <div className="flex items-center justify-between">
                              {/* Left Section - Installment Info */}
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                </div>

                                {/* Date Input with Icon */}
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-500" />
                                  <input
                                    type="date"
                                    value={installment?.dueDate || ""}
                                    onChange={(e) =>
                                      handleUpdateInstallment(
                                        index,
                                        "dueDate",
                                        e.target.value,
                                      )
                                    }
                                    className="pl-10 pr-3 py-2 border-2 border-purple-200 dark:border-purple-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                                  />
                                </div>
                              </div>

                              {/* Right Section - Amount and Actions */}
                              <div className="flex items-center space-x-3">
                                {/* Amount Input with Icon */}
                                <div className="relative">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={installment?.amount || 0}
                                    onChange={(e) =>
                                      handleUpdateInstallment(
                                        index,
                                        "amount",
                                        Number.parseFloat(e.target.value) || 0,
                                      )
                                    }
                                    className="w-32 pl-10 pr-3 py-2 border-2 border-purple-200 dark:border-purple-700 rounded-lg text-sm text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200 font-semibold"
                                  />
                                </div>

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => removeInstallment(index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                                  title={
                                    t("removeInstallment") ||
                                    "Remove Installment"
                                  }
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Additional Info Row */}
                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>
                                {t("due")}:{" "}
                                {installment?.dueDate
                                  ? formatDate(installment.dueDate)
                                  : t("notSet") || "Not set"}
                              </span>
                              <span className="font-semibold">
                                {formatNumber(installment?.amount || 0, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("notes") || "Notes"}
              </label>
              <textarea
                rows={4}
                value={invoiceData.notes}
                onChange={(e) =>
                  setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-all duration-200 resize-none"
                placeholder={
                  t("additionalNotes") || "Add any additional notes here..."
                }
              />
            </div>

            {/* Action Buttons */}
            <div
              className={`flex justify-end space-x-4 pt-6 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold"
              >
                {t("cancel") || "Cancel"}
              </button>
              <button
                type="submit"
                disabled={
                  !invoiceData.customerId ||
                  invoiceItems.length === 0 ||
                  createInvoiceMutation.isPending
                }
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {createInvoiceMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>
                  {createInvoiceMutation.isPending
                    ? t("creating") || "Creating..."
                    : t("createInvoice") || "Create Invoice"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        isSupplier={isSell ? false : true}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={() => setShowCustomerModal(false)}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSuccess={() => setShowItemModal(false)}
      />

      <PartialPaymentPreviewModal
        isLoadigng={createInvoiceMutation.isPending}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={submitInvoice}
        invoiceData={{
          invoiceNumber: "",
          customerName: invoiceData.customerName,
          total: adjustedTotal,
          originalTotal: total,
          downPayment,
          benefits,
          installments: installments.map((inst, index) => ({
            id: `installment-${index}`,
            dueDate: inst.dueDate,
            amount: inst.amount,
            status: "Pending" as const,
          })),
        }}
      />
    </div>
  );
};

export default EnhancedInvoiceModal;
