import { apiClient } from "./api";
import {
  ExpenseCategoryDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from "../types/api";

export const expenseCategoryService = {
  getAll: async () => {
    return apiClient.get<ExpenseCategoryDto[]>("/api/expensecategory");
  },

  getById: async (id: string) => {
    return apiClient.get<ExpenseCategoryDto>(`/api/expensecategory/${id}`);
  },

  create: async (data: CreateExpenseCategoryDto) => {
    return apiClient.post<ExpenseCategoryDto>("/api/expensecategory", data);
  },

  update: async (id: string, data: UpdateExpenseCategoryDto) => {
    return apiClient.post<void>(`/api/expensecategory/update/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.post<void>(`/api/expensecategory/delete/${id}`);
  },
};
