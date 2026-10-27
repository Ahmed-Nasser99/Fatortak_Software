
import { useQuery } from "@tanstack/react-query";
import { QuotaService } from "../services/quotaService";

export const useQuotaUsage = () => {
  return useQuery({
    queryKey: ["quota", "usage"],
    queryFn: () => QuotaService.getQuotaUsage(),
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useCanCreateInvoice = () => {
  return useQuery({
    queryKey: ["quota", "can-create-invoice"],
    queryFn: () => QuotaService.canCreateInvoice(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useCanUseAi = () => {
  return useQuery({
    queryKey: ["quota", "can-use-ai"],
    queryFn: () => QuotaService.canUseAi(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useCanAddUser = () => {
  return useQuery({
    queryKey: ["quota", "can-add-user"],
    queryFn: () => QuotaService.canAddUser(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
