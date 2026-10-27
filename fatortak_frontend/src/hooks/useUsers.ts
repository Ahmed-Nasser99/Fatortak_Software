
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { UserCreateDto, UserUpdateDto, UserFilterDto, ChangePasswordDto, PaginationDto } from '../types/api';

export const useUsers = (pagination: PaginationDto, filters?: UserFilterDto) => {
  return useQuery({
    queryKey: ['users', pagination, filters],
    queryFn: () => userService.getUsers(pagination, filters),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UserCreateDto) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateDto }) => 
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePasswordDto }) => 
      userService.changePassword(id, data),
  });
};
