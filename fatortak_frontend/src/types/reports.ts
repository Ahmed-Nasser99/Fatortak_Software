export interface ReportStatsDto {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  activeCustomers: number;
  activeSuppliers: number;
  totalSalaries: number;
  revenueChange?: string;
  expensesChange?: string;
}

export interface RevenueDataPointDto {
  period: string;
  revenue: number;
  orders: number;
}

export interface TopCustomerDto {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  invoiceCount: number;
  orders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: string;
}

export interface TopSupplierDto {
  id: string;
  name: string;
  orders: number;
  totalAmount: number;
  lastOrderDate: string;
}

export interface CashFlowDto {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  totalExpenses: number;
  totalPurchaseInvoices: number;
  totalSalaries: number;
  outstandingReceivables: number;
}

export interface ProfitAnalysisDto {
  revenue: number;
  netProfit: number;
  grossMargin: number;
}
export interface AccountStatementDto {
  customerInfo: CustomerStatementInfoDto;
  transactions: AccountStatementTransactionDto[];
  openingBalance: number;
  closingBalance: number;
}

export interface CustomerStatementInfoDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  accountType: string; // "Customer" or "Supplier"
  currency: string;
}

export interface AccountStatementTransactionDto {
  transactionDate: string;
  date: string; // Formatted date
  transactionType: string;
  transactionDetails: string;
  invoiceAmount?: number;
  paymentAmount?: number;
  creditAmount?: number;
  balance: number;
  orderPriority: number;
  projectId?: string;
  projectName?: string;
}

export interface AccountStatementFilterDto {
  customerId: string;
  startDate: string;
  endDate: string;
  invoiceType: string; // "Sell" or "Buy"
}
export interface CurrentStockReportDto {
  itemId: string;
  itemCode: string;
  itemName: string;
  soldQty: number;
  inStock: number;
  purchasePrice?: number;
  sellPrice?: number;
}

export interface ItemMovementReportDto {
  date: string;
  invoiceNumber: string;
  type: string; // "Buy" or "Sell"
  qtyIn: number;
  qtyOut: number;
  balance: number;
  unitPrice: number;
  currentBalance: number;
}

export interface ItemProfitabilityReportDto {
  itemId: string;
  itemCode: string;
  itemName: string;
  totalSales: number;
  totalCost: number;
  profit: number;
  profitPercentage: number;
}

export interface StockReportFilterDto {
  search?: string;
  itemId?: string;
  categoryId?: string;
  lowStock?: boolean;
}

export interface ItemMovementFilterDto {
  itemId: string;
  fromDate?: string;
  toDate?: string;
}

export interface ItemProfitabilityFilterDto {
  fromDate?: string;
  toDate?: string;
  search?: string;
  topCount?: number;
}

// New Report DTOs
export interface ProjectSheetDto {
  projectId: string;
  projectName: string;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  totalReceivables: number;
  transactions: TransactionDto[];
}

export interface TreasuryReportDto {
  totalBalance: number;
  accounts: any[];
  transactions: TransactionDto[];
}


export interface TransactionDto {
  id: string;
  transactionDate: string;
  date?: string;
  type: string;
  amount: number;
  direction: string;
  referenceId?: string;
  reference?: string;
  referenceType: string;
  description: string;
  paymentMethod: string;
  createdBy?: string;
  createdAt?: string;

  // New fields
  projectId?: string;
  projectName?: string;
  attachmentUrl?: string;
  category?: string;
}

export interface EmployeeCustodyReportDto {
  employeeId: string;
  employeeName: string;
  currentBalance: number;
  totalReceived: number;
  totalSpent: number;
  transactions: TransactionDto[];
}
