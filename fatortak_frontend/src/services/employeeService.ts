import { apiClient } from "./api";
import { PagedResponseDto, PaginationDto } from "../types/api";
import {
  CreateEmployeeDto,
  EmployeeDto,
  EmployeeFilterDto,
  UpdateEmployeeDto,
} from "@/types/employeeTypes";

export const employeeService = {
  // Get all employees with pagination and filtering
  getEmployees: async (
    pagination: PaginationDto,
    filters?: EmployeeFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.search && { search: filters.search }),
    };

    return apiClient.get<PagedResponseDto<EmployeeDto>>(
      "/api/employees",
      params
    );
  },

  // Get employee by ID
  getEmployee: async (id: string) => {
    return apiClient.get<EmployeeDto>(`/api/employees/${id}`);
  },

  // Create new employee
  createEmployee: async (data: CreateEmployeeDto) => {
    return apiClient.post<EmployeeDto>("/api/employees", data);
  },

  // Update employee
  updateEmployee: async (id: string, data: UpdateEmployeeDto) => {
    return apiClient.post<EmployeeDto>(`/api/employees/update/${id}`, data);
  },

  // Delete employee
  deleteEmployee: async (id: string) => {
    return apiClient.post<boolean>(`/api/employees/delete/${id}`);
  },
};
