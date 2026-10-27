import { apiClient } from "./api";
import {
  UserDto,
  UserCreateDto,
  UserUpdateDto,
  UserFilterDto,
  ChangePasswordDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";
import { QuotaService } from "./quotaService";

export const userService = {
  // Get all users with pagination and filtering
  getUsers: async (pagination: PaginationDto, filters?: UserFilterDto) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.email && { email: filters.email }),
      ...(filters?.role && { role: filters.role }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    return apiClient.get<PagedResponseDto<UserDto>>("/api/users", params);
  },

  // Get user by ID
  getUser: async (id: string) => {
    return apiClient.get<UserDto>(`/api/users/${id}`);
  },

  // Create new user with quota check
  createUser: async (data: UserCreateDto) => {
    // Check quota before creating user
    const canAdd = await QuotaService.canAddUser();
    if (!canAdd.allowed) {
      throw new Error("User quota limit reached. Please upgrade your plan.");
    }

    return apiClient.post<UserDto>("/api/users", data);
  },

  // Update user
  updateUser: async (id: string, data: UserUpdateDto) => {
    return apiClient.post<UserDto>(`/api/users/update/${id}`, data);
  },

  // Delete/Deactivate user
  deleteUser: async (id: string) => {
    return apiClient.post<boolean>(`/api/users/delete/${id}`);
  },

  // Change password
  changePassword: async (id: string, data: ChangePasswordDto) => {
    return apiClient.post<boolean>(`/api/users/${id}/change-password`, data);
  },
};
