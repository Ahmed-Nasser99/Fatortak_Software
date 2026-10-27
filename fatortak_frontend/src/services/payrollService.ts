import { apiClient, ServiceResult } from "./api";

export interface PayrollDto {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  status: string;
  expenseId?: number;
  transactionId?: string;
  payrollItems: PayrollItemDto[];
}

export interface PayrollItemDto {
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  calculatedSalary: number;
  daysAttended: number;
  calculationMethod: string;
}

export interface GeneratePayrollDto {
  month: number;
  year: number;
  calculationMethod: string; // "MainSalary" | "AttendanceBased"
  isGlobal: boolean;
  specificEmployeeIds?: string[];
}

export const payrollService = {
  generate: async (
    dto: GeneratePayrollDto
  ): Promise<ServiceResult<PayrollDto>> => {
    const response = await apiClient.post<PayrollDto>(
      "/api/payroll/generate",
      dto
    );
    return response;
  },

  getAll: async (): Promise<ServiceResult<PayrollDto[]>> => {
    const response = await apiClient.get<PayrollDto[]>("/api/payroll");
    return response;
  },

  getById: async (id: string): Promise<ServiceResult<PayrollDto>> => {
    const response = await apiClient.get<PayrollDto>(`/api/payroll/${id}`);
    return response;
  },

  submit: async (id: string): Promise<ServiceResult<PayrollDto>> => {
    const response = await apiClient.post<PayrollDto>(
      `/api/payroll/${id}/submit`,
      {}
    );
    return response;
  },

  delete: async (id: string): Promise<ServiceResult<boolean>> => {
    const response = await apiClient.delete<boolean>(`/api/payroll/${id}`);
    return response;
  },
};
