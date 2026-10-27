import { apiClient } from "./api";
import {
  ItemDto,
  ItemCreateDto,
  ItemUpdateDto,
  ItemFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const itemService = {
  // Get all items with pagination and filtering
  getItems: async (pagination: PaginationDto, filters?: ItemFilterDto) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.nameOrCode && { nameOrCode: filters.nameOrCode }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    return apiClient.get<PagedResponseDto<ItemDto>>("/api/items", params);
  },

  // Get item by ID
  getItem: async (id: string) => {
    return apiClient.get<ItemDto>(`/api/items/${id}`);
  },

  // Create new item
  createItem: async (data: FormData) => {
    const result = await apiClient.post<ItemDto>("/api/items", data);
    if (result.success) {
      return result;
    }
    throw new Error(result.errorMessage || "Failed to create item");
  },

  // Update item
  updateItem: async (id: string, data: FormData) => {
    const result = await apiClient.post<ItemDto>(
      `/api/items/update/${id}`,
      data
    );
    if (result.success) {
      return result;
    }
    throw new Error(result.errorMessage || "Failed to create item");
  },

  // Delete item
  deleteItem: async (id: string) => {
    return apiClient.post<boolean>(`/api/items/delete/${id}`);
  },

  // Toggle item activation
  toggleActivation: async (id: string) => {
    return apiClient.post<boolean>(`/api/items/ToggleActivationItem/${id}`);
  },

  // Get all categories
  getCategories: async () => {
    return apiClient.get<string[]>("/api/items/categories");
  },
};
