import { apiClient } from "./api";
import { PagedResponseDto, PaginationDto } from "../types/api";
import {
  CreateDepartmentDto,
  DepartmentDto,
  DepartmentFilterDto,
  UpdateDepartmentDto,
} from "@/types/departmentTypes";

export const departmentService = {
  // Get all departments with pagination and filtering
  getDepartments: async (
    pagination: PaginationDto,
    filters?: DepartmentFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.search && { Search: filters.search }),
    };
    return apiClient.get<PagedResponseDto<DepartmentDto>>(
      "/api/departments",
      params
    );
  },

  // Get department by ID
  getDepartment: async (id: string) => {
    return apiClient.get<DepartmentDto>(`/api/departments/${id}`);
  },

  // Create new department
  createDepartment: async (data: CreateDepartmentDto) => {
    return apiClient.post<DepartmentDto>("/api/departments", data);
  },

  // Update department
  updateDepartment: async (id: string, data: UpdateDepartmentDto) => {
    return apiClient.post<DepartmentDto>(`/api/departments/update/${id}`, data);
  },

  // Delete department
  deleteDepartment: async (id: string) => {
    return apiClient.post<boolean>(`/api/departments/delete/${id}`);
  },
};
