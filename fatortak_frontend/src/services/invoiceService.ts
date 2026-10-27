import { apiClient } from "./api";
import {
  InvoiceDto,
  InvoiceCreateDto,
  InvoiceUpdateDto,
  InvoiceFilterDto,
  SendInvoiceDto,
  MarkPaidDto,
  UpdateInvoiceStatusDto,
  RecordPaymentDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";
import { QuotaService } from "./quotaService";

export const invoiceService = {
  // Get all invoices with pagination and filtering
  getInvoices: async (
    pagination: PaginationDto,
    filters?: InvoiceFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    // Add filter parameters to query string
    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minimumPrice) params.minimumPrice = filters.minimumPrice;
      if (filters.maximumPrice) params.maximumPrice = filters.maximumPrice;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
      if (filters.projectId) params.projectId = filters.projectId;
    }

    return apiClient.get<PagedResponseDto<InvoiceDto>>("/api/invoices", params);
  },

  // Get invoice by ID
  getInvoice: async (id: string) => {
    return apiClient.get<InvoiceDto>(`/api/invoices/${id}`);
  },

  // Create new invoice with quota check
  createInvoice: async (data: any) => {
    // Check quota before creating invoice
    const canCreate = await QuotaService.canCreateInvoice();
    if (!canCreate.allowed) {
      throw new Error("Invoice quota limit reached. Please upgrade your plan.");
    }

    // Check if this invoice has installment data
    const hasInstallments =
      data.numberOfInstallments > 0 ||
      (data.installments && data.installments.length > 0);

    // Transform the data to match API expectations
    const invoiceData = {
      customerName: data.customerName,
      customerId: data.customerId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paymentAccountId: data.paymentAccountId,
      notes: data.notes || "",
      total: data.total || 0,
      vatAmount: data.vatTotal || 0,
      currency: data.currency || "EGP",
      status: data.status || "Draft",
      invoiceType: data.invoiceType || "Sell",
      projectId: data.projectId,
      items: data.items || [],

      // Add installment-related fields
      ...(hasInstallments && {
        downPayment: data.downPayment || 0,
        numberOfInstallments: data.numberOfInstallments || 0,
        benefits: data.benefits || 0,
        installments: data.installments || [],
      }),
    };

    // Build FormData for consistent multipart/form-data submission
    const formData = new FormData();
    Object.keys(invoiceData).forEach((key) => {
      const val = (invoiceData as any)[key];
      if (val === undefined || val === null) return;

      if (key === "items" || key === "installments") {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val.toString());
      }
    });

    if (data.attachment) {
      formData.append("file", data.attachment);
    }

    return apiClient.post<InvoiceDto>("/api/invoices", formData, {
      "X-User-Id": localStorage.getItem("user_id") || "",
    });
  },

  updateInvoice: async (id: string, data: any) => {
    // Transform the data to match API expectations
    const updateData = {
      customerId: data.customerId,
      customerName: data.customerName,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paymentAccountId: data.paymentAccountId,
      notes: data.notes || "",
      terms: data.terms || "",
      status: data.status || "Draft",
      invoiceType: data.invoiceType || "Sell",
      projectId: data.projectId,
      items: data.items || [],

      // Add missing installment-related fields
      downPayment: data.downPayment || 0,
      numberOfInstallments: data.numberOfInstallments || 0,
      benefits: data.benefits || 0,
      installments: data.installments || [],
    };

    // Build FormData for consistent multipart/form-data submission
    const formData = new FormData();
    Object.keys(updateData).forEach((key) => {
      const val = (updateData as any)[key];
      if (val === undefined || val === null) return;

      if (key === "items" || key === "installments") {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val.toString());
      }
    });

    if (data.attachment) {
      formData.append("file", data.attachment);
    }

    return apiClient.post<InvoiceDto>(`/api/invoices/update/${id}`, formData);
  },

  // Delete invoice
  deleteInvoice: async (id: string) => {
    return apiClient.post<boolean>(`/api/invoices/delete/${id}`);
  },

  // Send invoice via email
  sendInvoice: async (id: string, data: SendInvoiceDto) => {
    return apiClient.post<boolean>(`/api/invoices/${id}/send`, data);
  },

  // Update invoice status
  updateInvoiceStatus: async (id: string, status: string) => {
    const result = await apiClient.post<boolean>(`/api/invoices/${id}/status`, {
      status,
    });
    if (result.success) {
      return result;
    }
    throw new Error(result.errorMessage || "Failed to create item");
  },

  // Mark invoice as paid
  markPaid: async (id: string, data: MarkPaidDto) => {
    return apiClient.post<InvoiceDto>(`/api/invoices/${id}/mark-paid`, data);
  },

  // Download invoice PDF
  downloadPdf: async (id: string) => {
    // This would need special handling for file downloads
    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "https://localhost:44338"
      }/api/invoices/${id}/pdf`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  },

  // Duplicate invoice with quota check
  duplicateInvoice: async (id: string) => {
    // Check quota before duplicating (which creates a new invoice)
    const canCreate = await QuotaService.canCreateInvoice();
    if (!canCreate.allowed) {
      throw new Error("Invoice quota limit reached. Please upgrade your plan.");
    }

    return apiClient.post<InvoiceDto>(`/api/invoices/${id}/duplicate`);
  },
  getInstallmentsByInvoiceId: async (invoiceId: string) => {
    return apiClient.get<any[]>(`/api/invoices/${invoiceId}/installments`);
  },

  // Get installment by ID
  getInstallmentById: async (id: string) => {
    return apiClient.get<any>(`/api/invoices/installment/${id}`);
  },

  // Pay installment
  payInstallment: async (installmentId: string) => {
    return apiClient.post<any>(
      `/api/invoices/installment/pay/${installmentId}`
    );
  },
  unPayInstallment: async (installmentId: string) => {
    return apiClient.post<any>(
      `/api/invoices/installment/unPay/${installmentId}`
    );
  },

  recordPayment: async (id: string, data: RecordPaymentDto) => {
    const formData = new FormData();
    formData.append("amount", data.amount.toString());
    if (data.paymentMethod) {
      formData.append("paymentMethod", data.paymentMethod);
    }
    if (data.attachment) {
      formData.append("file", data.attachment);
    }
    if (data.paymentAccountId) {
      formData.append("paymentAccountId", data.paymentAccountId);
    }
    if (data.chequeNumber) {
      formData.append("chequeNumber", data.chequeNumber);
    }
    if (data.chequeBankName) {
      formData.append("chequeBankName", data.chequeBankName);
    }
    if (data.chequeDueDate) {
      formData.append("chequeDueDate", data.chequeDueDate);
    }
    if (data.paymentDate) {
      formData.append("paymentDate", data.paymentDate);
    }
    return apiClient.post<boolean>(`/api/invoices/${id}/payments`, formData);
  },
};
