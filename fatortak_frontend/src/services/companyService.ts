import { apiClient } from "./api";
import {
  CompanyDto,
  CompanyCreateDto,
  CompanyUpdateDto,
  UploadCompanyLogoDto,
  PaginationDto,
  CompanyUpdateInvoiceTemplateDto,
} from "../types/api";

export const companyService = {
  // Get all companies with pagination
  getCompanies: async (pagination: PaginationDto) => {
    const params = new URLSearchParams({
      page: pagination.pageNumber.toString(),
      limit: pagination.pageSize.toString(),
    });
    return apiClient.get<{ data: CompanyDto[]; total: number }>(
      `/api/Companies?${params}`
    );
  },

  // Get single company
  getCompany: async (id: string) => {
    return apiClient.get<CompanyDto>(`/api/Companies/${id}`);
  },

  // Create new company
  createCompany: async (data: CompanyCreateDto) => {
    return apiClient.post<CompanyDto>("/api/Companies", data);
  },

  // Update company with all required fields
  updateCompany: async (id: string, data: CompanyUpdateDto) => {
    const updatePayload = {
      name: data.name,
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      taxNumber: data.taxNumber || "",
      vatNumber: data.vatNumber || "",
      currency: data.currency || "USD",
      defaultVatRate: data.defaultVatRate || 0,
      invoicePrefix: data.invoicePrefix || "INV",
      enableMultipleBranches: data.enableMultipleBranches,
    };

    return apiClient.post<CompanyDto>(
      `/api/Companies/update/${id}`,
      updatePayload
    );
  },
  updateCompanyInvoiceTemplate: async (
    data: CompanyUpdateInvoiceTemplateDto
  ) => {
    return apiClient.post<CompanyDto>(
      `/api/Companies/UpdateCompanyInvoiceTemplateAsync`,
      data
    );
  },

  // Delete company
  deleteCompany: async (id: string) => {
    return apiClient.post(`/api/Companies/delete/${id}`);
  },

  // Upload company logo
  uploadCompanyLogo: async (data: UploadCompanyLogoDto) => {
    return apiClient.uploadFile<CompanyDto>(
      "/api/Companies/upload-logo",
      data.file,
      {
        companyId: data.companyId,
      }
    );
  },

  // Remove company logo
  removeCompanyLogo: async (companyId: string) => {
    return apiClient.post(`/api/Companies/${companyId}/RemoveCompanyLogo`);
  },

  // Get current user's company
  getCurrentCompany: async () => {
    return apiClient.get<CompanyDto>("/api/Companies/current");
  },

  // Update company with logo in one request
  updateCompanyWithLogo: async (
    id: string,
    data: CompanyUpdateDto,
    logoFile?: File
  ) => {
    // First update company data
    const companyResult = await companyService.updateCompany(id, data);

    // Then upload logo if provided
    if (logoFile && companyResult.success) {
      try {
        const logoResult = await companyService.uploadCompanyLogo({
          companyId: id,
          file: logoFile,
        });

        // Return updated company data with logo
        if (logoResult.success) {
          return logoResult;
        }
      } catch (error) {
        // console.error("Logo upload failed:", error);
        // Return company update result even if logo upload fails
      }
    }

    return companyResult;
  },
};
