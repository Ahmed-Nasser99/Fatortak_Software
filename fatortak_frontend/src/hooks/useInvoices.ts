import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoiceService } from "../services/invoiceService";
import {
  InvoiceCreateDto,
  InvoiceUpdateDto,
  InvoiceFilterDto,
  SendInvoiceDto,
  MarkPaidDto,
  PaginationDto,
} from "../types/api";

export const useInvoices = (
  pagination: PaginationDto,
  filters?: InvoiceFilterDto
) => {
  return useQuery({
    queryKey: ["invoices", pagination, filters],
    queryFn: () => invoiceService.getInvoices(pagination, filters),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InvoiceCreateDto) => invoiceService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdateDto }) =>
      invoiceService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["installments", id] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useSendInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendInvoiceDto }) =>
      invoiceService.sendInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      invoiceService.updateInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MarkPaidDto }) =>
      invoiceService.markPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useDuplicateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.duplicateInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
export const useInstallmentsByInvoiceId = (invoiceId: string) => {
  return useQuery({
    queryKey: ["installments", invoiceId],
    queryFn: () => invoiceService.getInstallmentsByInvoiceId(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useInstallment = (id: string) => {
  return useQuery({
    queryKey: ["installment", id],
    queryFn: () => invoiceService.getInstallmentById(id),
    enabled: !!id,
  });
};

export const usePayInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installmentId: string) =>
      invoiceService.payInstallment(installmentId),
    onSuccess: (_, installmentId) => {
      // Invalidate installments queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      queryClient.invalidateQueries({
        queryKey: ["installment", installmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
export const useUnPayInstallment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (installmentId: string) =>
      invoiceService.unPayInstallment(installmentId),
    onSuccess: (_, installmentId) => {
      // Invalidate installments queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["installments"] });
      queryClient.invalidateQueries({
        queryKey: ["installment", installmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};
