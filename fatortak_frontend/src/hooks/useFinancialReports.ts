import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export const useTrialBalance = (asOfDate?: string) => {
  return useQuery({
    queryKey: ["trial-balance", asOfDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/trial-balance`, { asOfDate });
      return response.data as any;
    },
  });
};

export const useIncomeStatement = (fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ["income-statement", fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/income-statement`, { fromDate, toDate });
      return response.data as any;
    },
  });
};

export const useBalanceSheet = (asOfDate: string) => {
  return useQuery({
    queryKey: ["balance-sheet", asOfDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/balance-sheet`, { asOfDate });
      return response.data as any;
    },
  });
};

export const useCashFlow = (fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ["cash-flow", fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/cash-flow`, { fromDate, toDate });
      return response.data as any;
    },
  });
};

export const useARAging = (asOfDate: string) => {
  return useQuery({
    queryKey: ["ar-aging", asOfDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/ar-aging`, { asOfDate });
      return response.data as any;
    },
  });
};

export const useAPAging = (asOfDate: string) => {
  return useQuery({
    queryKey: ["ap-aging", asOfDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/ap-aging`, { asOfDate });
      return response.data as any;
    },
  });
};

export const useSalesReport = (fromDate: string, toDate: string, customerId?: string, projectId?: string) => {
  return useQuery({
    queryKey: ["sales-report", fromDate, toDate, customerId, projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/sales`, { fromDate, toDate, customerId, projectId });
      return response.data as any;
    },
  });
};

export const useProjectProfitability = (fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ["project-profitability", fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/project-profitability`, { fromDate, toDate });
      return response.data as any;
    },
  });
};

export const useProjectCostBreakdown = (projectId: string) => {
  return useQuery({
    queryKey: ["project-cost-breakdown", projectId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/project-cost-breakdown/${projectId}`);
      return response.data as any;
    },
  });
};

export const useAccountLedger = (accountId: string, fromDate?: string, toDate?: string) => {
  return useQuery({
    queryKey: ["account-ledger", accountId, fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/ledger/${accountId}`, { fromDate, toDate });
      return response.data as any;
    },
    enabled: !!accountId,
  });
};

export const useCustomerStatement = (customerId: string, fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ["customer-statement", customerId, fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/customer-statement/${customerId}`, { fromDate, toDate });
      return response.data as any;
    },
    enabled: !!customerId,
  });
};

export const useVendorStatement = (vendorId: string, fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ["vendor-statement", vendorId, fromDate, toDate],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/vendor-statement/${vendorId}`, { fromDate, toDate });
      return response.data as any;
    },
    enabled: !!vendorId,
  });
};

export const useMovementReport = (
  fromDate: string,
  toDate: string,
  accountId?: string,
  projectId?: string,
  branchId?: string
) => {
  return useQuery({
    queryKey: ["movement-report", fromDate, toDate, accountId, projectId, branchId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/financialreport/movements`, {
        fromDate,
        toDate,
        accountId,
        projectId,
        branchId,
      });
      return response.data as any;
    },
  });
};
