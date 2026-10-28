import { apiClient, ServiceResult } from './api';
import { PagedResponseDto } from '../types/api';

export interface ChequeDto {
  id: string;
  chequeNumber: string;
  bankName: string;
  dueDate: string;
  amount: number;
  status: string;
  invoiceId: string;
  invoiceNumber: string;
  projectName?: string;
  paymentAccountId?: string;
  paymentAccountName?: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface ChequeFilterDto {
  status?: string;
  pageNumber: number;
  pageSize: number;
}

export interface UpdateChequeStatusDto {
  status: string;
}

export const chequeService = {
  getCheques: async (filter: ChequeFilterDto): Promise<ServiceResult<PagedResponseDto<ChequeDto>>> => {
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    params.append('pageNumber', filter.pageNumber.toString());
    params.append('pageSize', filter.pageSize.toString());
    
    const response = await apiClient.get<PagedResponseDto<ChequeDto>>(`/api/Cheques?${params.toString()}`);
    return response as any;
  },

  updateStatus: async (id: string, dto: UpdateChequeStatusDto): Promise<ServiceResult<ChequeDto>> => {
    const response = await apiClient.post<ChequeDto>(`/api/Cheques/${id}/status`, dto);
    return response as any;
  }
};
