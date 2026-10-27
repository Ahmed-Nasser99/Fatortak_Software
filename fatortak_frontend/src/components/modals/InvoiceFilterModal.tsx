import React, { useState } from "react";
import { X, Filter, Calendar, DollarSign, User } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCustomers } from "@/hooks/useCustomers";
import SearchableDropdown from "../ui/SearchableDropdown";
import BranchSelector from "../ui/BranchSelector";
import ProjectSelector from "../ui/ProjectSelector";

interface InvoiceFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentFilters: any;
  isSell?: boolean;
}

const InvoiceFilterModal: React.FC<InvoiceFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
  isSell = true,
}) => {
  const { t, isRTL } = useLanguage();
  const [filters, setFilters] = useState({
    status: currentFilters.status || "",
    customerId: currentFilters.customerId || "",
    fromDate: currentFilters.fromDate || "",
    toDate: currentFilters.toDate || "",
    minimumPrice: currentFilters.minimumPrice || "",
    maximumPrice: currentFilters.maximumPrice || "",
    invoiceType: currentFilters.invoiceType || "",
    branchId: currentFilters.branchId || "",
    projectId: currentFilters.projectId || "",
  });
  const { data: customersResponse, isLoading: loadingCustomers } = useCustomers(
    {
      pageNumber: 1,
      pageSize: 100,
    },
    {
      isSupplier: !isSell,
      isActive: true,
    }
  );

  const customers = customersResponse?.success
    ? customersResponse.data?.data || []
    : [];

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      status: "",
      customerId: "",
      fromDate: "",
      toDate: "",
      minimumPrice: "",
      maximumPrice: "",
      invoiceType: "",
      branchId: "",
      projectId: "",
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center space-x-3 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <Filter className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("filterInvoices")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("status")}
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <option value="">{t("allStatus")}</option>
                <option value="paid">{t("status.paid")}</option>
                <option value="pending">{t("status.pending")}</option>
                <option value="overdue">{t("status.overdue")}</option>
                <option value="cancelled">{t("status.cancelled")}</option>
                <option value="draft">{t("status.draft")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isSell ? t("client") : t("supplier")}
              </label>
              <SearchableDropdown
                options={customers.map((customer) => ({
                  value: customer.id,
                  label: customer.name,
                }))}
                value={filters.customerId}
                onChange={(value) => {
                  const customer = customers.find((c) => c.id === value);
                  setFilters((prev) => ({
                    ...prev,
                    customerId: customer?.id || "",
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BranchSelector
              value={filters.branchId}
              onChange={(value) => setFilters(prev => ({ ...prev, branchId: value }))}
              label={isRTL ? "الفرع" : "Branch"}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? "المشروع" : "Project"}
              </label>
              <ProjectSelector
                value={filters.projectId || "all"}
                onChange={(value) => setFilters(prev => ({ ...prev, projectId: value === "all" ? "" : value }))}
                placeholder={isRTL ? "كل المشاريع" : "All Projects"}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {t("dateRange")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("from")}
                </label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      fromDate: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("to")}
                </label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, toDate: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              {t("amountRange")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("minimum")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.minimumPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minimumPrice: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {t("maximum")}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.maximumPrice}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maximumPrice: e.target.value,
                    }))
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          <button
            onClick={handleReset}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            {t("reset")}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {t("applyFilters")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilterModal;
