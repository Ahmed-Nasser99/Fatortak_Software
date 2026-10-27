import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itemService } from "../services/itemService";
import {
  ItemCreateDto,
  ItemUpdateDto,
  ItemFilterDto,
  PaginationDto,
} from "../types/api";

export const useItems = (
  pagination: PaginationDto,
  filters?: ItemFilterDto
) => {
  return useQuery({
    queryKey: ["items", pagination, filters],
    queryFn: () => itemService.getItems(pagination, filters),
  });
};

export const useItem = (id: string) => {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => itemService.getItem(id),
    enabled: !!id,
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return itemService.createItem(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      itemService.updateItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item", id] });
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useToggleItemActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => itemService.toggleActivation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};

export const useItemCategories = () => {
  return useQuery({
    queryKey: ["item-categories"],
    queryFn: () => itemService.getCategories(),
  });
};
