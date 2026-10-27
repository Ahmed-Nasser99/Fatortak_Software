
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileService } from '../services/userProfileService';
import { UserProfileUpdateDto, ChangePasswordDto } from '../types/api';

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile', 'current'],
    queryFn: () => userProfileService.getCurrentUserProfile(),
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userProfileService.getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserProfileUpdateDto) => userProfileService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => userProfileService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useRemoveProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => userProfileService.removeProfilePicture(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => userProfileService.changePassword(data),
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => 
      userProfileService.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
