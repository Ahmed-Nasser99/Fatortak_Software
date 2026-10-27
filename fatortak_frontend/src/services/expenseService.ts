import { apiClient } from "./api";
import {
  ExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const expenseService = {
  // Get all expenses with pagination and filtering
  getExpenses: async (
    pagination: PaginationDto,
    filters?: ExpenseFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.notes && { notes: filters.notes }),
      ...(filters?.projectId && { projectId: filters.projectId }),
    };

    return apiClient.get<PagedResponseDto<ExpenseDto>>("/api/expenses", params);
  },

  // Get expense by ID
  getExpense: async (id: number) => {
    return apiClient.get<ExpenseDto>(`/api/expenses/${id}`);
  },

  // Create new expense
  createExpense: async (data: CreateExpenseDto) => {
    // Always use FormData since controller expects [FromForm]
    const formData = new FormData();
    formData.append("date", data.date);
    formData.append("total", data.total.toString());
    if (data.notes) formData.append("notes", data.notes);
    if (data.file) formData.append("file", data.file);
    if (data.projectId) formData.append("projectId", data.projectId);
    if (data.branchId) formData.append("branchId", data.branchId);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.paymentAccountId) formData.append("paymentAccountId", data.paymentAccountId);

    return apiClient.post<ExpenseDto>("/api/expenses", formData);
  },

  // Update expense
  updateExpense: async (id: number, data: UpdateExpenseDto) => {
    // Always use FormData since controller expects [FromForm]
    const formData = new FormData();
    if (data.date) formData.append("date", data.date);
    if (data.total !== undefined) formData.append("total", data.total.toString());
    if (data.notes !== undefined) formData.append("notes", data.notes);
    if (data.file) formData.append("file", data.file);
    if (data.projectId !== undefined) formData.append("projectId", data.projectId);
    if (data.branchId !== undefined) formData.append("branchId", data.branchId);
    if (data.categoryId !== undefined) formData.append("categoryId", data.categoryId);
    if (data.paymentAccountId !== undefined) formData.append("paymentAccountId", data.paymentAccountId);
    if (data.removeFile) formData.append("removeFile", "true");

    return apiClient.post<ExpenseDto>(`/api/expenses/update/${id}`, formData);
  },

  // Delete expense
  deleteExpense: async (id: number) => {
    return apiClient.post<boolean>(`/api/expenses/delete/${id}`);
  },
};
