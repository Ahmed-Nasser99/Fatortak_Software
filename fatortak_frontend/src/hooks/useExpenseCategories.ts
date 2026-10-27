import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseCategoryService } from "../services/expenseCategoryService";
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from "../types/api";
import { toast } from "sonner";

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ["expenseCategories"],
    queryFn: () => expenseCategoryService.getAll(),
  });
};

export const useExpenseCategory = (id: string) => {
  return useQuery({
    queryKey: ["expenseCategory", id],
    queryFn: () => expenseCategoryService.getById(id),
    enabled: !!id,
  });
};

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseCategoryDto) =>
      expenseCategoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Expense category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create category");
    },
  });
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseCategoryDto }) =>
      expenseCategoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Expense category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category");
    },
  });
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseCategoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenseCategories"] });
      toast.success("Expense category deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete category");
    },
  });
};
