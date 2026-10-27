import { apiClient } from "./api";

export interface QuotaUsage {
  plan: string;
  startDate: string;
  endDate: string;
  isYearly: boolean;
  aiUsed: number;
  aiLimit: number;
  remainingAi: number;
  invoicesThisMonth: number;
  invoiceLimit: number;
  remainingInvoices: number;
  users: number;
  userLimit: number;
  remainingUsers: number;
}

export interface QuotaLimits {
  allowed: boolean;
}

export class QuotaService {
  private static readonly ENDPOINTS = {
    CAN_CREATE_INVOICE: "/api/quota/can-create-invoice",
    CAN_USE_AI: "/api/quota/can-use-ai",
    CAN_ADD_USER: "/api/quota/can-add-user",
    USAGE: "/api/quota/usage",
  };

  static async canCreateInvoice(): Promise<QuotaLimits> {
    try {
      const response = await apiClient.get<QuotaLimits>(
        this.ENDPOINTS.CAN_CREATE_INVOICE
      );
      return response.data || { allowed: false };
    } catch (error) {
      return { allowed: false };
    }
  }

  static async canUseAi(): Promise<QuotaLimits> {
    try {
      const response = await apiClient.get<QuotaLimits>(
        this.ENDPOINTS.CAN_USE_AI
      );
      return response.data || { allowed: false };
    } catch (error) {
      return { allowed: false };
    }
  }

  static async canAddUser(): Promise<QuotaLimits> {
    try {
      const response = await apiClient.get<QuotaLimits>(
        this.ENDPOINTS.CAN_ADD_USER
      );
      return response.data || { allowed: false };
    } catch (error) {
      return { allowed: false };
    }
  }

  static async getQuotaUsage(): Promise<QuotaUsage> {
    try {
      const response = await apiClient.get<QuotaUsage>(this.ENDPOINTS.USAGE);
      return (
        response.data || {
          plan: "Trial",
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isYearly: false,
          aiUsed: 0,
          aiLimit: 10,
          remainingAi: 10,
          invoicesThisMonth: 0,
          invoiceLimit: 5,
          remainingInvoices: 5,
          users: 1,
          userLimit: 1,
          remainingUsers: 0,
        }
      );
    } catch (error) {
      return {
        plan: "Trial",
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isYearly: false,
        aiUsed: 0,
        aiLimit: 10,
        remainingAi: 10,
        invoicesThisMonth: 0,
        invoiceLimit: 5,
        remainingInvoices: 5,
        users: 1,
        userLimit: 1,
        remainingUsers: 0,
      };
    }
  }
}
