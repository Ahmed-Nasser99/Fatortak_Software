import React, { useState, useEffect } from "react";
import { X, Save, Upload, FileText, Trash2 } from "lucide-react";
import { formatNumber, formatDate, parseLocalDate } from "@/Helpers/localization";
import { format } from "date-fns";
import { DatePicker } from "../ui/date-picker";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateExpense, useUpdateExpense } from "../../hooks/useExpenses";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import {
  ExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
} from "../../types/api";
import { toast } from "react-toastify";
import BranchSelector from "../ui/BranchSelector";
import { useMainBranch } from "../../hooks/useBranches";
import ProjectSelector from "../ui/ProjectSelector";
import CategorySelector from "../ui/CategorySelector";
import DataSourceSelector from "../ui/DataSourceSelector";
import { useAccounts } from "../../hooks/useAccounting";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expense?: ExpenseDto | null;
  initialProjectId?: string;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expense = null,
  initialProjectId,
}) => {
  const { isRTL, t } = useLanguage();
  const roleAccess = useRoleAccess();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const { data: accountsResponse } = useAccounts({ pageNumber: 1, pageSize: 1000 }, { isActive: true });
  const accounts = accountsResponse?.data?.data || [];

  const [formData, setFormData] = useState<CreateExpenseDto>({
    date: new Date().toISOString().split("T")[0],
    total: 0,
    notes: "",
    branchId: "",
    projectId: "",
    categoryId: "",
    paymentAccountId: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removeFile, setRemoveFile] = useState(false);
  const [existingFile, setExistingFile] = useState<{ url: string; name: string } | null>(null);
  const { data: mainBranchResult } = useMainBranch();

  useEffect(() => {
    if (mainBranchResult?.data && !formData.branchId) {
      setFormData(prev => ({ ...prev, branchId: mainBranchResult.data.id }));
    }
  }, [mainBranchResult, isOpen]);

  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        total: expense.total,
        notes: expense.notes || "",
        branchId: expense.branchId || "",
        projectId: expense.projectId || "",
        categoryId: expense.categoryId || "",
        paymentAccountId: expense.paymentAccountId || "",
      });
      setExistingFile(
        expense.fileUrl && expense.fileName
          ? { url: expense.fileUrl, name: expense.fileName }
          : null
      );
      setSelectedFile(null);
      setRemoveFile(false);
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        total: 0,
        notes: "",
        branchId: mainBranchResult?.data?.id || "",
        projectId: initialProjectId || "",
        categoryId: "",
        paymentAccountId: "",
      });
      setExistingFile(null);
      setSelectedFile(null);
      setRemoveFile(false);
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date) {
      toast.error(t("selectDate"));
      return;
    }

    if (formData.total <= 0) {
      toast.error(t("amountGreaterThanZero"));
      return;
    }

    // Check account balance
    if (formData.paymentAccountId) {
      const selectedAccount = accounts.find(a => a.id === formData.paymentAccountId);
      if (selectedAccount && selectedAccount.balance !== undefined && selectedAccount.balance < formData.total) {
        toast.error(
          isRTL 
            ? `رصيد غير كافٍ في ${selectedAccount.name}. المتاح: ${formatNumber(selectedAccount.balance)} EGP`
            : `Insufficient funds in ${selectedAccount.name}. Available: ${formatNumber(selectedAccount.balance)} EGP`
        );
        return;
      }
    }

    // Check permissions
    if (expense && !roleAccess.canEdit()) {
      toast.error(t("noEditPermission"));
      return;
    }

    if (!expense && !roleAccess.canCreate()) {
      toast.error(t("noCreatePermission"));
      return;
    }

    try {
      if (expense) {
        // Update existing expense
        const updateData: UpdateExpenseDto = {
          date: formData.date,
          total: formData.total,
          notes: formData.notes,
          file: selectedFile || undefined,
          removeFile: removeFile,
          categoryId: formData.categoryId,
          paymentAccountId: formData.paymentAccountId,
          branchId: formData.branchId,
          projectId: formData.projectId,
        };
        const result = await updateExpenseMutation.mutateAsync({
          id: expense.id,
          data: updateData,
        });

        if (result.success) {
          toast.success(t("expenseUpdatedSuccessfully"));
          onSuccess();
        } else {
          toast.error(result.errorMessage || t("failedToUpdateExpense"));
        }
      } else {
        // Create new expense
        const createData: CreateExpenseDto = {
          ...formData,
          file: selectedFile || undefined,
        };
        const result = await createExpenseMutation.mutateAsync(createData);

        if (result.success) {
          toast.success(t("expenseCreatedSuccessfully"));
          onSuccess();
        } else {
          toast.error(result.errorMessage || t("failedToCreateExpense"));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : (expense ? t("failedToUpdateExpense") : t("failedToCreateExpense"))
      );
    }
  };

  const handleInputChange = (
    field: keyof CreateExpenseDto,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الملف يجب أن يكون أقل من 10 ميجابايت" : "File size must be less than 10MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error(
          isRTL
            ? "نوع الملف غير مسموح. الأنواع المسموحة: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX"
            : "File type not allowed. Allowed types: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX"
        );
        return;
      }

      setSelectedFile(file);
      setRemoveFile(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (existingFile) {
      setRemoveFile(true);
      setExistingFile(null);
    }
  };

  // Helper function to get date value as string
  const getDateValue = (date: string | Date): string => {
    if (typeof date === "string") {
      return date;
    }
    return date.toISOString().split("T")[0];
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {expense ? t("editExpense") : t("newExpense")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("date")} *
              </label>
              <DatePicker
                date={parseLocalDate(formData.date)}
                setDate={(date) =>
                  handleInputChange(
                    "date",
                    date ? format(date, "yyyy-MM-dd") : ""
                  )
                }
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("amount")} *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.total === 0 ? "" : formData.total.toString()}
                onChange={(e) =>
                  handleInputChange(
                    "total",
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                  )
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BranchSelector
              value={formData.branchId || ""}
              onChange={(value) => handleInputChange("branchId", value)}
              label={isRTL ? "الفرع" : "Branch"}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "المشروع" : "Project"}
              </label>
              <ProjectSelector
                value={formData.projectId || ""}
                onChange={(value) => handleInputChange("projectId", value)}
              />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? "التصنيف" : "Category"} *
                </label>
                <CategorySelector
                  value={formData.categoryId || ""}
                  onChange={(value) => handleInputChange("categoryId", value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isRTL ? "مصدر الدفع" : "Payment Source"} *
                </label>
                <DataSourceSelector
                  value={formData.paymentAccountId || ""}
                  onChange={(value) => handleInputChange("paymentAccountId", value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("notes")}
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("expenseNotesPlaceholder")}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "مرفق" : "Attachment"}
            </label>

            {/* File Input */}
            {!selectedFile && !existingFile && (
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-400 transition-colors ${
                    isRTL ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isRTL
                      ? "انقر لتحميل ملف (PDF, صور, مستندات)"
                      : "Click to upload file (PDF, Images, Documents)"}
                  </span>
                </label>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isRTL
                    ? "الحد الأقصى لحجم الملف: 10 ميجابايت"
                    : "Maximum file size: 10MB"}
                </p>
              </div>
            )}

            {/* Selected File Preview */}
            {selectedFile && (
              <div className={`flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
                <div className={`flex items-center space-x-3 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}

            {/* Existing File Display */}
            {existingFile && !selectedFile && (
              <div className={`flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg ${
                isRTL ? "flex-row-reverse" : ""
              }`}>
                <div className={`flex items-center space-x-3 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}>
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <a
                      href={existingFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {existingFile.name}
                    </a>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isRTL ? "ملف موجود" : "Existing file"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div
            className={`flex justify-end space-x-4 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={
                createExpenseMutation.isPending ||
                updateExpenseMutation.isPending
              }
              className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {createExpenseMutation.isPending ||
                updateExpenseMutation.isPending
                  ? t("saving")
                  : expense
                  ? t("update")
                  : t("add")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
