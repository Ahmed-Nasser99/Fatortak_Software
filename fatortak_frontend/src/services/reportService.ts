import { apiClient } from "./api";
import {
  ReportStatsDto,
  RevenueDataPointDto,
  TopCustomerDto,
  TopSupplierDto,
  CashFlowDto,
  ProfitAnalysisDto,
  AccountStatementFilterDto,
  AccountStatementDto,
  ItemProfitabilityReportDto,
  CurrentStockReportDto,
  ItemProfitabilityFilterDto,
  ItemMovementReportDto,
  ItemMovementFilterDto,
  StockReportFilterDto,
  TransactionDto,
  ProjectSheetDto,
  TreasuryReportDto,
  EmployeeCustodyReportDto,
} from "../types/reports";
import {
  InvoiceDto,
  InvoiceFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "@/types/api";
import { Transaction } from "@/hooks/useDashboardReport";

export const reportService = {
  getSalesInvoicesReport: async (
    pagination: PaginationDto,
    filters?: InvoiceFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minimumPrice) params.minimumPrice = filters.minimumPrice;
      if (filters.maximumPrice) params.maximumPrice = filters.maximumPrice;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
    }

    return apiClient.get<PagedResponseDto<InvoiceDto>>(
      "/api/reports/SalesInvoices",
      params
    );
  },
  getExpensesReport: async (
    pagination: PaginationDto,
    filters?: InvoiceFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minimumPrice) params.minimumPrice = filters.minimumPrice;
      if (filters.maximumPrice) params.maximumPrice = filters.maximumPrice;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
      if (filters?.expensesStatus)
        params.expensesStatus = filters?.expensesStatus;
    }

    return apiClient.get<PagedResponseDto<Transaction>>(
      "/api/reports/Expenses",
      params
    );
  },
  getTransactionReport: async (
    pagination: PaginationDto,
    filters?: InvoiceFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minimumPrice) params.minimumPrice = filters.minimumPrice;
      if (filters.maximumPrice) params.maximumPrice = filters.maximumPrice;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
      if (filters.type) params.type = filters.type;
    }

    return apiClient.get<PagedResponseDto<TransactionDto>>(
      "/api/transactions",
      params
    );
  },
  getStats: async (period: string = "month", branchId?: string, projectId?: string) => {
    return apiClient.get<ReportStatsDto>(`/api/reports/stats?period=${period}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`);
  },

  getRevenue: async (period: string = "month", branchId?: string, projectId?: string) => {
    return apiClient.get<RevenueDataPointDto[]>(
      `/api/reports/revenue?period=${period}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`
    );
  },

  getTopCustomers: async (period: string = "month", branchId?: string, top: number = 5, projectId?: string) => {
    return apiClient.get<TopCustomerDto[]>(
      `/api/reports/top-customers?period=${period}&top=${top}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`
    );
  },

  getTopSuppliers: async (period: string = "month", branchId?: string, top: number = 5, projectId?: string) => {
    return apiClient.get<TopSupplierDto[]>(
      `/api/reports/top-suppliers?period=${period}&top=${top}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`
    );
  },

  getCashFlow: async (period: string = "month", branchId?: string, projectId?: string) => {
    return apiClient.get<CashFlowDto>(`/api/reports/cashflow?period=${period}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`);
  },

  getProfitAnalysis: async (period: string = "month", branchId?: string, projectId?: string) => {
    return apiClient.get<ProfitAnalysisDto>(
      `/api/reports/profit?period=${period}${branchId ? `&branchId=${branchId}` : ""}${projectId ? `&projectId=${projectId}` : ""}`
    );
  },
  getAccountStatement: async (filter: AccountStatementFilterDto) => {
    const params = {
      customerId: filter.customerId,
      startDate: filter.startDate,
      endDate: filter.endDate,
      invoiceType: filter.invoiceType,
    };

    return apiClient.get<AccountStatementDto>(
      "/api/reports/account-statement",
      params
    );
  },
  getCurrentStockReport: async (
    pagination: PaginationDto,
    filters?: StockReportFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.itemId) params.itemId = filters.itemId;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.lowStock !== undefined) params.lowStock = filters.lowStock;
    }

    return apiClient.get<PagedResponseDto<CurrentStockReportDto>>(
      "/api/reports/current-stock",
      params
    );
  },

  getItemMovementReport: async (filter: ItemMovementFilterDto) => {
    const params: any = {
      itemId: filter.itemId,
    };

    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;

    return apiClient.get<ItemMovementReportDto[]>(
      "/api/reports/item-movement",
      params
    );
  },

  getItemProfitabilityReport: async (
    pagination: PaginationDto,
    filters?: ItemProfitabilityFilterDto
  ) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.topCount) params.topCount = filters.topCount;
    }

    return apiClient.get<PagedResponseDto<ItemProfitabilityReportDto>>(
      "/api/reports/item-profitability",
      params
    );
  },

  getLowStockReport: async (pagination: PaginationDto) => {
    const params: any = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
    };

    return apiClient.get<PagedResponseDto<CurrentStockReportDto>>(
      "/api/reports/low-stock",
      params
    );
  },
  exportTransactions: async (
    filters: InvoiceFilterDto,
    format: "pdf" | "excel" = "excel",
    lang: string = "en"
  ) => {
    const params: any = {
      format,
      lang,
    };

    if (filters) {
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;
      if (filters.minimumPrice) params.minimumPrice = filters.minimumPrice;
      if (filters.maximumPrice) params.maximumPrice = filters.maximumPrice;
      if (filters.customerId) params.customerId = filters.customerId;
      if (filters.invoiceType) params.invoiceType = filters.invoiceType;
      if (filters.type) params.type = filters.type;
    }

    return apiClient.getBlob("/api/reports/transactions/export", params);
  },

  getProjectSheet: async (
    projectId: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const params: any = { projectId };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get<ProjectSheetDto>("/api/reports/project-sheet", params);
  },

  getTreasuryReport: async (
    fromDate?: string,
    toDate?: string
  ) => {
    const params: any = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get<TreasuryReportDto>("/api/reports/treasury", params);
  },

  getSupplierLedger: async (
    supplierId: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const params: any = { supplierId };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get<AccountStatementDto>(
      "/api/reports/supplier-ledger",
      params
    );
  },
  getEmployeeCustodyReport: async () => {
    return apiClient.get<EmployeeCustodyReportDto[]>("/api/reports/employee-custody");
  },
};

