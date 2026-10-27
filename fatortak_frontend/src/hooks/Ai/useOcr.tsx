import { ocrService } from "@/services/Ai/ocrService";
import { OcrInvoiceCreateDto } from "@/types/Ai/ocrTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetOcrInvoiceData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => ocrService.GetInvoiceDataFromOcr(file),
  });
};
export const useCreateOcrInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OcrInvoiceCreateDto) =>
      ocrService.createOcrInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};
