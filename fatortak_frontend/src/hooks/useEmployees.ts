import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService } from "../services/employeeService";
import { PaginationDto } from "../types/api";
import {
  CreateEmployeeDto,
  EmployeeFilterDto,
  UpdateEmployeeDto,
} from "@/types/employeeTypes";

export const useEmployees = (
  pagination: PaginationDto,
  filters?: EmployeeFilterDto
) => {
  return useQuery({
    queryKey: ["employees", pagination, filters],
    queryFn: () => employeeService.getEmployees(pagination, filters),
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeeService.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      employeeService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};
