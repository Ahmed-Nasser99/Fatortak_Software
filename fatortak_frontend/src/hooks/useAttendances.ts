import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaginationDto } from "../types/api";
import {
  AttendanceFilterDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
} from "@/types/attendanceTypes";
import { attendanceService } from "@/services/attendanceService";

export const useAttendances = (
  pagination: PaginationDto,
  filters?: AttendanceFilterDto,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["attendances", pagination, filters],
    queryFn: () => attendanceService.getAttendances(pagination, filters),
    ...options,
  });
};

export const useAttendance = (id: string) => {
  return useQuery({
    queryKey: ["attendance", id],
    queryFn: () => attendanceService.getAttendance(id),
    enabled: !!id,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceDto) =>
      attendanceService.createAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttendanceDto }) =>
      attendanceService.updateAttendance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", id] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceService.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};
export const useDailyReport = (date: string) => {
  return useQuery({
    queryKey: ["daily-report", date],
    queryFn: () => attendanceService.getDailyReport(date),
    enabled: !!date,
  });
};

export const useMonthlyReport = (year: number, month: number) => {
  return useQuery({
    queryKey: ["monthly-report", year, month],
    queryFn: () => attendanceService.getMonthlyReport(year, month),
    enabled: !!year && !!month,
  });
};
export const useExportDailyReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      format,
    }: {
      date: string;
      format: "excel" | "pdf";
    }) => {
      if (format === "excel") {
        return attendanceService.exportDailyReportToExcel(date);
      }
      return attendanceService.exportDailyReportToPdf(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
    },
  });
};

export const useExportMonthlyReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      year,
      month,
      format,
    }: {
      year: number;
      month: number;
      format: "excel" | "pdf";
    }) => {
      if (format === "excel") {
        return attendanceService.exportMonthlyReportToExcel(year, month);
      }
      return attendanceService.exportMonthlyReportToPdf(year, month);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};
