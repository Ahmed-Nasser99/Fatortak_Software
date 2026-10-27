import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "../services/companyService";
import {
  CompanyCreateDto,
  CompanyUpdateDto,
  CompanyUpdateInvoiceTemplateDto,
  PaginationDto,
  UploadCompanyLogoDto,
} from "../types/api";

export const useCurrentCompany = () => {
  return useQuery({
    queryKey: ["company", "current"],
    queryFn: () => companyService.getCurrentCompany(),
  });
};

export const useCompanies = (pagination: PaginationDto) => {
  return useQuery({
    queryKey: ["companies", pagination],
    queryFn: () => companyService.getCompanies(pagination),
  });
};

export const useCompany = (id: string) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => companyService.getCompany(id),
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CompanyCreateDto) => companyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompanyUpdateDto }) =>
      companyService.updateCompany(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", id] });
      queryClient.invalidateQueries({ queryKey: ["company", "current"] });
    },
  });
};
export const useUpdateCompanyInvoiceTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: CompanyUpdateInvoiceTemplateDto }) =>
      companyService.updateCompanyInvoiceTemplate(data),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", "current"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => companyService.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUploadCompanyLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadCompanyLogoDto) =>
      companyService.uploadCompanyLogo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

export const useRemoveCompanyLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (companyId: string) =>
      companyService.removeCompanyLogo(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};
