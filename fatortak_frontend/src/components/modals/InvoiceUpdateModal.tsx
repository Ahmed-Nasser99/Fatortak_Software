import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  User,
  Package,
  Save,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import {
  formatNumber,
  formatDate,
  parseLocalDate,
} from "@/Helpers/localization";
import { DatePicker } from "../ui/date-picker";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCustomers } from "../../hooks/useCustomers";
import { useItems } from "../../hooks/useItems";
import { useUpdateInvoice } from "../../hooks/useInvoices";
import { toast } from "react-toastify";
import CustomerModal from "./CustomerModal";
import ItemModal from "./ItemModal";
import SearchableDropdown from "../ui/SearchableDropdown";
import PartialPaymentPreviewModal from "./PartialPaymentPreviewModal";
import { AccountDto } from "../../types/api";
import { accountingService } from "../../services/accountingService";
import BranchSelector from "../ui/BranchSelector";

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
  id?: string;
  dueDate: string;
  amount: number;
  status?: string;
}

interface InvoiceUpdateModalProps {
  isSell: boolean;
  invoice: any;
  onSave: () => void;
  onClose: () => void;
}

const InvoiceUpdateModal: React.FC<InvoiceUpdateModalProps> = ({
  isSell,
  invoice,
  onSave,
  onClose,
}) => {
  const { t, isRTL } = useLanguage();
  const updateInvoiceMutation = useUpdateInvoice();

  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    customerId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    status: "Draft",
    invoiceType: isSell ? "Sell" : "Buy",
    branchId: "",
    paymentAccountId: "",
  });

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

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

  const { data: customersResponse } = useCustomers(
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      isSupplier: !isSell,
      isActive: true,
    },
  );
  const { data: itemsResponse } = useItems({ pageNumber: 1, pageSize: 100 });

  const customers = customersResponse?.success
    ? customersResponse.data?.data || []
    : [];
  const items = itemsResponse?.success ? itemsResponse.data?.data || [] : [];

  const getFilteredStatusOptions = () => {
    const options = [
      { value: "Draft", label: t("draftStatus") || "Draft" },
      { value: "Paid", label: t("paidStatus") || "Paid" },
      { value: "partPaid", label: t("partialPaidStatus") || "Part Paid" },
      { value: "Cancelled", label: t("cancelledStatus") || "Cancelled" },
    ];

    const currentStatus = invoice?.status?.toLowerCase();
    if (currentStatus === "partialpaid" || currentStatus === "partpaid") {
      return [{ value: "Cancelled", label: t("cancelledStatus") || "Cancelled" }];
    }

    return options;
  };

  const filteredStatusOptions = getFilteredStatusOptions();

  function formatBackendDate(dateStr: string) {
    const [year, month, day] = dateStr.split("T")[0].split("-");
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (invoice) {
      setInvoiceData({
        customerName: invoice.customerName || "",
        customerId: invoice.customerId || "",
        issueDate: invoice.issueDate
          ? formatBackendDate(invoice.issueDate)
          : new Date().toISOString().split("T")[0],
        dueDate: invoice.dueDate
          ? formatBackendDate(invoice.dueDate)
          : new Date().toISOString().split("T")[0],
        notes: invoice.notes || "",
        status: invoice.status || "Draft",
        invoiceType: invoice.invoiceType || "Sell",
        branchId: invoice.branchId || "",
        paymentAccountId: invoice.paymentAccountId || "",
      });

      // Set installment-related data
      setDownPayment(invoice.downPayment || 0);
      setBenefits(invoice.benefits || 0);

      // Set installments if they exist
      if (invoice.installments && Array.isArray(invoice.installments)) {
        const existingInstallments = invoice.installments.map((inst: any) => ({
          id: inst.id,
          dueDate: formatBackendDate(inst.dueDate),
          amount: inst.amount,
          status: inst.status,
        }));
        setInstallments(existingInstallments);
        setNumberOfInstallments(invoice.installments.length);
      }

      if (invoice.items && Array.isArray(invoice.items)) {
        const existingItems = invoice.items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          itemId: item.itemId || "",
          itemName: item.itemName || item.name || "",
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          vatRate: item.vatRate || 0,
          discount: (item.discount || 0) * 100, // Convert to percentage for display
          total: calculateItemTotal(
            item.quantity || 1,
            item.unitPrice || 0,
            item.vatRate || 0,
            (item.discount || 0) * 100,
          ),
        }));
        setInvoiceItems(existingItems);
      }
    }
  }, [invoice]);

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
    setShowInstallmentSection(
      invoiceData.status === "PartialPaid" || numberOfInstallments > 0,
    );
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
        const dueDate = new Date(invoiceData.issueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        dueDate.setDate(1);

        newInstallments.push({
          dueDate: dueDate.toISOString().split("T")[0],
          amount:
            i === numberOfInstallments
              ? remainingAmount - installmentAmount * (numberOfInstallments - 1)
              : installmentAmount,
        });
      }

      setInstallments(newInstallments);
    }
  };

  const handleCustomerSelect = (value: string) => {
    const customer = customers.find((c) => c.id === value);
    setSelectedCustomer(customer);
    setInvoiceData((prev) => ({
      ...prev,
      customerId: value,
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
      unitPrice: item.unitPrice || 0,
      vatRate: item.vatRate || 0.14,
      discount: (item.discount || 0) * 100,
      total: calculateItemTotal(
        1,
        item.unitPrice || 0,
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
      { dueDate: new Date().toISOString().split("T")[0], amount: 0 },
    ]);
  };

  const removeInstallment = (index: number) => {
    setInstallments((prev) => prev.filter((_, i) => i !== index));
  };

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

    try {
      const hasInstallments =
        invoiceData.status === "PartialPaid" || numberOfInstallments > 0;

      const updateData = {
        customerId: invoiceData.customerId,
        issueDate: new Date(invoiceData.issueDate).toISOString(),
        dueDate: new Date(invoiceData.dueDate).toISOString(),
        notes: invoiceData.notes,
        status: invoiceData.status,
        invoiceType: invoiceData.invoiceType,
        branchId: invoiceData.branchId,
        paymentAccountId: invoiceData.paymentAccountId,
        items: invoiceItems.map((item) => ({
          id: item.id,
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          vatRate: item.vatRate,
          discount: item.discount / 100, // Convert back to decimal
        })),
        downPayment: hasInstallments ? downPayment : 0,
        numberOfInstallments: hasInstallments ? numberOfInstallments : 0,
        benefits: hasInstallments ? benefits : 0,
        installments:
          hasInstallments && installments.length > 0
            ? installments.map((inst) => ({
                id: inst.id,
                dueDate: new Date(inst.dueDate).toISOString(),
                amount: inst.amount,
              }))
            : undefined,
      };

      const result = await updateInvoiceMutation.mutateAsync({
        id: invoice.id,
        data: updateData,
      });

      if (result.success) {
        toast.success(
          t("invoiceUpdatedSuccessfully") || "Invoice updated successfully",
        );
        onSave();
        setShowPreviewModal(false);
      } else {
        toast.error(
          result.errorMessage ||
            t("failedToUpdateInvoice") ||
            "Failed to update invoice",
        );
      }
    } catch (error) {
      toast.error(t("failedToUpdateInvoice") || "Failed to update invoice");
    }
  };

  const { subtotal, totalDiscount, vatTotal, total, adjustedTotal } =
    calculateTotals();
  const remainingAmount = adjustedTotal - downPayment;

  const getInvoiceTypeColor = (type: string) => {
    return type === "Buy"
      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
  };
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calculator className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {t("editInvoice") || "Edit Invoice"}
                </h2>
                <p className="text-purple-100">
                  {t("editInvoiceDescription") ||
                    "Update invoice details and payment schedule"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                value={invoiceData.status}
                onChange={(e) =>
                  setInvoiceData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {filteredStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {(invoiceData.status === "Paid" ||
              invoiceData.status === "PartialPaid") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">
                    {isRTL ? "اختر الحساب" : "Select Account"}
                  </option>
                  {accounts
                    .filter((acc) => {
                      if (isSell) {
                        return (
                          acc.accountCode.startsWith("1000") ||
                          acc.accountCode.startsWith("110") ||
                          acc.accountCode.startsWith("120")
                        );
                      } else {
                        return (
                          acc.accountCode.startsWith("1000") ||
                          acc.accountCode.startsWith("110") ||
                          acc.accountCode.startsWith("1500")
                        );
                      }
                    })
                    .map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountCode} - {acc.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("issueDate")}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("dueDate")}
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
            <div className="md:col-span-4">
              <BranchSelector
                value={invoiceData.branchId}
                onChange={(value) =>
                  setInvoiceData((prev) => ({ ...prev, branchId: value }))
                }
                label={isRTL ? "الفرع" : "Branch"}
              />
            </div>
          </div>

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {!isSell ? t("supplier") : t("client")} *
              </label>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400"
              >
                <User className="w-4 h-4" />
                <span>{!isSell ? t("newSupplier") : t("newClient")}</span>
              </button>
            </div>
            <SearchableDropdown
              options={customers.map((customer) => ({
                value: customer.id,
                label: customer.name,
              }))}
              value={invoiceData.customerId}
              onChange={handleCustomerSelect}
              placeholder={isSell ? t("selectClient") : t("selectSupplier")}
              isRTL={isRTL}
            />
          </div>

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t("items")}
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(true)}
                className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400"
              >
                <Package className="w-4 h-4" />
                <span>{t("newItem")}</span>
              </button>
            </div>

            {/* Add Item Dropdown */}
            <div className="mb-6">
              <SearchableDropdown
                options={items?.map((item) => {
                  const price = isSell
                    ? (item.unitPrice ?? 0)
                    : (item.purchaseUnitPrice ?? 0);
                  const qty = item.quantity ?? 0;
                  const label = isRTL
                    ? `${item.name} • ${
                        isSell ? t("sellPrice") : t("purchasePrice")
                      }: ${price} • ${t("available")}: ${qty}`
                    : `${item.name} | ${price} ${
                        t("currency") ?? "EGP"
                      } | ${qty} ${t("inStock")}`;

                  return {
                    value: item.id,
                    label,
                  };
                })}
                value=""
                onChange={(value) => value && handleAddItem(value)}
                placeholder={t("addItem")}
                isRTL={isRTL}
              />
            </div>

            {/* Items Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("item")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("quantity")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("price")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("discount")} (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("vatRate")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("total")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoiceItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.itemName}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
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
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
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
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-24 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
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
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <select
                          value={item.vatRate}
                          onChange={(e) =>
                            handleUpdateItem(
                              item.id,
                              "vatRate",
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                        >
                          <option value={0}>0%</option>
                          <option value={0.05}>5%</option>
                          <option value={0.14}>14%</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          ${item.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("subtotal")}:
                  </span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("totalDiscount")}:
                  </span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -${totalDiscount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("vatLabel")}:
                  </span>
                  <span className="font-semibold">${vatTotal.toFixed(2)}</span>
                </div>
                {showInstallmentSection && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("benefits")}:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +${benefits.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("downPayment")}:
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        -${downPayment.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("remainingAmount")}:
                      </span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        ${remainingAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {showInstallmentSection ? t("adjustedTotal") : t("total")}:
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    $
                    {showInstallmentSection
                      ? adjustedTotal.toFixed(2)
                      : total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Installment Section */}
          {showInstallmentSection && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                {t("paymentSchedule")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("downPayment")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={adjustedTotal}
                    value={downPayment}
                    onChange={(e) =>
                      setDownPayment(
                        Math.min(
                          parseFloat(e.target.value) || 0,
                          adjustedTotal,
                        ),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("numberOfInstallmentMonths")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={numberOfInstallments}
                    onChange={(e) =>
                      setNumberOfInstallments(
                        Math.min(parseInt(e.target.value) || 0, 60),
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("benefits")}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={benefits}
                    onChange={(e) =>
                      setBenefits(parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("remainingToDistribute", {
                    amount: remainingAmount.toFixed(2),
                  })}
                </span>
                <button
                  type="button"
                  onClick={generateInstallments}
                  className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm"
                >
                  {t("generateInstallmentSchedule")}
                </button>
              </div>

              {installments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {t("installmentSchedule")} ({installments.length}{" "}
                    {t("payments")})
                  </h4>
                  {installments.map((installment, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border"
                    >
                      <span className="w-8 text-sm font-medium">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <DatePicker
                          date={parseLocalDate(installment.dueDate)}
                          setDate={(date) =>
                            handleUpdateInstallment(
                              index,
                              "dueDate",
                              date ? format(date, "yyyy-MM-dd") : "",
                            )
                          }
                          className="w-full h-8 text-sm"
                        />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={installment.amount}
                        onChange={(e) =>
                          handleUpdateInstallment(
                            index,
                            "amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-24 px-2 py-1 border rounded text-sm text-right"
                      />
                      <button
                        type="button"
                        onClick={() => removeInstallment(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("notes")}
            </label>
            <textarea
              rows={3}
              value={invoiceData.notes}
              onChange={(e) =>
                setInvoiceData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={t("additionalNotes")}
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={
                !invoiceData.customerId ||
                invoiceItems.length === 0 ||
                updateInvoiceMutation.isPending
              }
              className="flex items-center mx-3 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {updateInvoiceMutation.isPending
                  ? t("updating")
                  : t("updateInvoice")}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isSupplier={!isSell}
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSuccess={() => setShowCustomerModal(false)}
      />

      {/* Item Modal */}
      <ItemModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSuccess={() => setShowItemModal(false)}
      />

      {/* Preview Modal */}
      <PartialPaymentPreviewModal
        isLoadigng={updateInvoiceMutation.isPending}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onConfirm={submitInvoice}
        invoiceData={{
          invoiceNumber: invoice.invoiceNumber || "",
          customerName: invoiceData.customerName,
          total: adjustedTotal,
          originalTotal: total,
          downPayment,
          benefits,
          installments,
        }}
      />
    </div>
  );
};

export default InvoiceUpdateModal;
