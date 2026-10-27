import { apiClient } from "./api";
import {
  CustomerDto,
  CustomerCreateDto,
  CustomerUpdateDto,
  CustomerFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const customerService = {
  // Get all customers with pagination and filtering
  getCustomers: async (
    pagination: PaginationDto,
    filters?: CustomerFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.name && { name: filters.name }),
      ...(filters?.email && { email: filters.email }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.isSupplier !== undefined && {
        isSupplier: filters.isSupplier,
      }),
    };
    return apiClient.get<PagedResponseDto<CustomerDto>>(
      "/api/customers",
      params
    );
  },

  // Get customer by ID
  getCustomer: async (id: string) => {
    return apiClient.get<CustomerDto>(`/api/customers/${id}`);
  },

  // Create new customer
  createCustomer: async (
    data: CustomerCreateDto & { isSupplier?: boolean }
  ) => {
    return apiClient.post<CustomerDto>("/api/customers", data);
  },

  // Update customer
  updateCustomer: async (
    id: string,
    data: CustomerUpdateDto & { isSupplier?: boolean }
  ) => {
    return apiClient.post<CustomerDto>(`/api/customers/update/${id}`, data);
  },

  // Delete customer
  deleteCustomer: async (id: string) => {
    return apiClient.post<boolean>(`/api/customers/delete/${id}`);
  },

  // Toggle customer activation
  toggleActivation: async (customerId: string) => {
    return apiClient.post<boolean>(
      `/api/customers/ToggleActivationCustomer/${customerId}`
    );
  },

  // Search customers (fallback to regular get with filter)
  searchCustomers: async (query: string) => {
    const params = {
      pageNumber: 1,
      pageSize: 50,
      name: query,
    };
    const result = await apiClient.get<PagedResponseDto<CustomerDto>>(
      "/api/customers",
      params
    );
    if (result.success && result.data) {
      return {
        ...result,
        data: result.data.data || [],
      };
    }
    return result;
  },
};
