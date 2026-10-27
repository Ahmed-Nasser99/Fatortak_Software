import { apiClient } from "./api";
import type {
  WorkSettingDto,
  UpdateWorkSettingDto,
  CreateGeneralVacationDto,
  UpdateGeneralVacationDto,
  GeneralVacationDto,
  ApiResponse,
} from "../types/hrSettingsTypes";

export const workSettingService = {
  // Get work settings
  getWorkSettings: async (): Promise<ApiResponse<WorkSettingDto>> => {
    return apiClient.get<WorkSettingDto>("/api/WorkSetting/get");
  },

  // Update work settings
  updateWorkSettings: async (
    id: string,
    data: UpdateWorkSettingDto
  ): Promise<ApiResponse<WorkSettingDto>> => {
    return apiClient.post<WorkSettingDto>(
      `/api/WorkSetting/update/${id}`,
      data
    );
  },

  // Create general vacation
  createVacation: async (
    data: CreateGeneralVacationDto
  ): Promise<ApiResponse<GeneralVacationDto>> => {
    return apiClient.post<GeneralVacationDto>(
      "/api/WorkSetting/vacation/create",
      data
    );
  },

  // Update general vacation
  updateVacation: async (
    id: string,
    data: UpdateGeneralVacationDto
  ): Promise<ApiResponse<GeneralVacationDto>> => {
    return apiClient.post<GeneralVacationDto>(
      `/api/WorkSetting/vacation/update/${id}`,
      data
    );
  },

  // Delete general vacation
  deleteVacation: async (id: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete(`/api/WorkSetting/vacation/delete/${id}`);
  },
};
