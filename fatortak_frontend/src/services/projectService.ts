import { apiClient } from "./api";
import {
  ProjectDto,
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
  PagedResponseDto,
  PaginationDto,
  CreateProjectWithContractCommand,
} from "../types/api";

export const projectService = {
  // Get all projects with pagination and filtering
  getProjects: async (
    pagination: PaginationDto,
    filters?: ProjectFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.name) params.name = filters.name;
      if (filters.status) params.status = filters.status;
      if (filters.clientName) params.clientName = filters.clientName;
      if (filters.customerId) params.customerId = filters.customerId;
    }

    return apiClient.get<PagedResponseDto<ProjectDto>>("/api/projects", params);
  },

  // Get project by ID
  getProject: async (id: string) => {
    return apiClient.get<ProjectDto>(`/api/projects/${id}`);
  },

  // Create new project
  createProject: async (data: CreateProjectDto) => {
    return apiClient.post<ProjectDto>("/api/projects", data);
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectDto) => {
    return apiClient.post<ProjectDto>(`/api/projects/${id}/update`, data);
  },

  // Delete project
  deleteProject: async (id: string) => {
    return apiClient.post<boolean>(`/api/projects/${id}/delete`, {});
  },

  // Update project status
  updateProjectStatus: async (id: string, status: any) => {
    return apiClient.post<ProjectDto>(`/api/projects/${id}/status`, { status });
  },
  
  // Create project with contract setup
  createProjectWithContract: async (data: CreateProjectWithContractCommand) => {
    return apiClient.post<ProjectDto>("/api/projects/with-contract", data);
  },

  // Update project with contract setup
  updateProjectWithContract: async (id: string, data: CreateProjectWithContractCommand) => {
    return apiClient.post<ProjectDto>(`/api/projects/${id}/update-with-contract`, data);
  },

  // Export project to PDF
  exportProjectPdf: async (id: string, projectName: string) => {
    const blob = await apiClient.getBlob(`/api/projects/${id}/export/pdf`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Quotation_${projectName.replace(/\s+/g, '_')}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Export project to Excel
  exportProjectExcel: async (id: string, projectName: string) => {
    const blob = await apiClient.getBlob(`/api/projects/${id}/export/excel`);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Project_${projectName.replace(/\s+/g, '_')}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
