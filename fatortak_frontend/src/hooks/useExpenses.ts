import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "../services/expenseService";
import {
  ExpenseDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  ExpenseFilterDto,
  PaginationDto,
} from "../types/api";

export const useExpenses = (
  pagination: PaginationDto,
  filters?: ExpenseFilterDto
) => {
  return useQuery({
    queryKey: ["expenses", pagination, filters],
    queryFn: () => expenseService.getExpenses(pagination, filters),
  });
};

export const useExpense = (id: number) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => expenseService.getExpense(id),
    enabled: !!id,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseDto) => expenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpenseDto }) =>
      expenseService.updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense", id] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
