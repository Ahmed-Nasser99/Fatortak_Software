import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export interface MonthlyFinancial {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RevenueBreakdown {
  paid: number;
  partialPaid: number;
  pending: number;
}

export interface ExpenseBreakdown {
  paid: number;
  partialPaid: number;
  pending: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingAmount: number;
  overdueInvoices: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalItems: number;
  activeItems: number;
  currentBalance: number;
  totalCashAvailable: number;
  totalBankAvailable: number;
  stockValue: number;
  totalReceivables: number;
  totalPayables: number;
  revenueBreakdown: RevenueBreakdown;
  expenseBreakdown: ExpenseBreakdown;
  startDate: string;
  endDate: string;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  status: string;
  total: number;
  issueDate: string;
  dueDate: string;
  createdAt: string;
  invoiceType: string;
}

export interface Transaction {
  id: string;
  transactionDate: string;
  transactionDateTime: string;
  date: string;
  type: string;
  reference: string;
  amount: number;
  paid: number;
  remaining: number;
  customerId?: string;
  status?: string;
  targetId?: string;
  description?: string;
  direction?: string;
  referenceId?: string;
  referenceType?: string;
  projectName?: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentInvoices: RecentInvoice[];
  recentTransactions: Transaction[];
  monthlyFinancials: MonthlyFinancial[];
}

export const useDashboardReport = (
  period: string = "month",
  branchId?: string,
  projectId?: string
) => {
  return useQuery({
    queryKey: ["dashboard-report", period, branchId, projectId],
    queryFn: async () => {
      const response = await apiClient.get<DashboardData>("/api/dashboard", {
        period,
        branchId,
        projectId,
      });
      return response;
    },
  });
};
