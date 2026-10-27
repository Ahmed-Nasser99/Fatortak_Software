import { OcrInvoiceCreateDto } from "@/types/Ai/ocrTypes";
import { apiClient } from "../api";
import { InvoiceDto } from "@/types/api";

export const ocrService = {
  GetInvoiceDataFromOcr: async (data: File) => {
    return apiClient.uploadFile<OcrInvoiceCreateDto>(
      "/api/AiQuery/InvoiceOcr",
      data
    );
  },
  createOcrInvoice: async (data: OcrInvoiceCreateDto) => {
    return apiClient.post<InvoiceDto>(
      "/api/invoices/CreateInvoiceFromOcr",
      data
    );
  },
};
