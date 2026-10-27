
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userProfileService } from '../services/userProfileService';
import { UserProfileUpdateDto } from '../types/api';

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserProfileUpdateDto) => userProfileService.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useUploadUserProfilePicture = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (file: File) => userProfileService.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
};
