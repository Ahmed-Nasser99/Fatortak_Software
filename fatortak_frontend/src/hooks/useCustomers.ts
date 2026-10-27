
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { CustomerCreateDto, CustomerUpdateDto, CustomerFilterDto, PaginationDto } from '../types/api';

export const useCustomers = (pagination: PaginationDto, filters?: CustomerFilterDto) => {
  return useQuery({
    queryKey: ['customers', pagination, filters],
    queryFn: () => customerService.getCustomers(pagination, filters),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getCustomer(id),
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CustomerCreateDto) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerUpdateDto }) => 
      customerService.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useToggleCustomerActivation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerId: string) => customerService.toggleActivation(customerId),
    onSuccess: (data, customerId) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
    },
  });
};

export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: ['customers', 'search', query],
    queryFn: () => customerService.searchCustomers(query),
    enabled: query.length > 0,
  });
};
