import { apiClient } from "./api";
import { BranchDto, CreateBranchDto, UpdateBranchDto } from "../types/api";

export const branchService = {
  // Get all branches
  getBranches: async () => {
    return apiClient.get<BranchDto[]>("/api/Branches");
  },

  // Get single branch
  getBranch: async (id: string) => {
    return apiClient.get<BranchDto>(`/api/Branches/${id}`);
  },

  // Create new branch
  createBranch: async (data: CreateBranchDto) => {
    return apiClient.post<BranchDto>("/api/Branches", data);
  },

  // Update branch
  updateBranch: async (id: string, data: UpdateBranchDto) => {
    return apiClient.put<BranchDto>(`/api/Branches/${id}`, data);
  },

  // Delete branch
  deleteBranch: async (id: string) => {
    return apiClient.delete<boolean>(`/api/Branches/${id}`);
  },

  // Toggle branch activation
  toggleActivation: async (id: string) => {
    return apiClient.patch<boolean>(`/api/Branches/${id}/toggle`, {});
  },

  // Get main branch
  getMainBranch: async () => {
    return apiClient.get<BranchDto>("/api/Branches/main");
  },
};
