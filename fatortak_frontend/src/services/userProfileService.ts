import { apiClient } from "./api";
import {
  UserProfileDto,
  UserProfileUpdateDto,
  ChangePasswordDto,
  UpdateUserProfileImageDto,
} from "../types/api";

export const userProfileService = {
  // Get current user profile
  getCurrentUserProfile: async () => {
    return apiClient.get<UserProfileDto>("/api/UserProfile");
  },

  // Get user profile by ID (Admin only)
  getUserProfile: async (userId: string) => {
    return apiClient.get<UserProfileDto>(`/api/UserProfile/${userId}`);
  },

  // Update user profile
  updateUserProfile: async (data: UserProfileUpdateDto) => {
    return apiClient.post<UserProfileDto>("/api/UserProfile/update", data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    return apiClient.uploadFile<string>(
      "/api/UserProfile/profile-picture",
      file
    );
  },

  // Remove profile picture
  removeProfilePicture: async () => {
    return apiClient.post<boolean>("/api/UserProfile/delete-profile-picture");
  },

  // Change password
  changePassword: async (data: ChangePasswordDto) => {
    return apiClient.post<boolean>("/api/UserProfile/change-password", data);
  },

  // Update user status (Admin only)
  updateUserStatus: async (userId: string, isActive: boolean) => {
    return apiClient.post<boolean>(`/api/UserProfile/${userId}/status`, {
      isActive,
    });
  },
};
