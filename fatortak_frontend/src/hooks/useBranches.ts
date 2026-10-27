import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { branchService } from "../services/branchService";
import { CreateBranchDto, UpdateBranchDto } from "../types/api";

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: () => branchService.getBranches(),
  });
};

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => branchService.getBranch(id),
    enabled: !!id,
  });
};

export const useCreateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBranchDto) => branchService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useUpdateBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchDto }) =>
      branchService.updateBranch(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", id] });
    },
  });
};

export const useDeleteBranch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useToggleBranchActivation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => branchService.toggleActivation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useMainBranch = () => {
  return useQuery({
    queryKey: ["branch", "main"],
    queryFn: () => branchService.getMainBranch(),
  });
};
