import { apiClient } from "./api";
import { PagedResponseDto, PaginationDto } from "../types/api";
import {
  AttendanceDto,
  AttendanceFilterDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@/types/attendanceTypes";

export const attendanceService = {
  // Get all attendances with pagination and filtering
  getAttendances: async (
    pagination: PaginationDto,
    filters?: AttendanceFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.employeeName && { employeeName: filters.employeeName }),
      ...(filters?.date && { date: filters.date }),
    };

    return apiClient.get<PagedResponseDto<AttendanceDto>>(
      "/api/attendances",
      params
    );
  },

  // Get attendance by ID
  getAttendance: async (id: string) => {
    return apiClient.get<AttendanceDto>(`/api/attendances/${id}`);
  },

  // Create new attendance
  createAttendance: async (data: CreateAttendanceDto) => {
    return apiClient.post<AttendanceDto>("/api/attendances", data);
  },

  // Update attendance
  updateAttendance: async (id: string, data: UpdateAttendanceDto) => {
    return apiClient.post<AttendanceDto>(`/api/attendances/update/${id}`, data);
  },

  // Delete attendance
  deleteAttendance: async (id: string) => {
    return apiClient.post<boolean>(`/api/attendances/delete/${id}`);
  },
  getDailyReport: async (date: string) => {
    return apiClient.get(`/api/attendances/daily-report/${date}`);
  },

  getMonthlyReport: async (year: number, month: number) => {
    return apiClient.get(`/api/attendances/monthly-report/${year}/${month}`);
  },
  exportDailyReportToExcel: async (date: string) => {
    const result = await apiClient.get<Blob>(
      `/api/attendances/daily-report/${date}/export/excel`,
      {},
      { responseType: "blob" }
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.errorMessage || "Failed to export daily report");
  },

  exportDailyReportToPdf: async (date: string) => {
    const result = await apiClient.get<Blob>(
      `/api/attendances/daily-report/${date}/export/pdf`,
      {},
      { responseType: "blob" }
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.errorMessage || "Failed to export daily report");
  },

  exportMonthlyReportToExcel: async (year: number, month: number) => {
    const result = await apiClient.get<Blob>(
      `/api/attendances/monthly-report/${year}/${month}/export/excel`,
      {},
      { responseType: "blob" }
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.errorMessage || "Failed to export monthly report");
  },

  exportMonthlyReportToPdf: async (year: number, month: number) => {
    const result = await apiClient.get<Blob>(
      `/api/attendances/monthly-report/${year}/${month}/export/pdf`,
      {},
      { responseType: "blob" }
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.errorMessage || "Failed to export monthly report");
  },
};
