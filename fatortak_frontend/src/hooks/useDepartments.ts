import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PaginationDto } from "@/types/api";
import {
  CreateDepartmentDto,
  DepartmentFilterDto,
  UpdateDepartmentDto,
} from "@/types/departmentTypes";
import { departmentService } from "@/services/departmentService";

export const useDepartments = (
  pagination: PaginationDto,
  filters?: DepartmentFilterDto
) => {
  return useQuery({
    queryKey: ["departments", pagination, filters],
    queryFn: () => departmentService.getDepartments(pagination, filters),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => departmentService.getDepartment(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDepartmentDto) =>
      departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentService.updateDepartment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", id] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};
