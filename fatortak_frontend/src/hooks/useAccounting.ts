import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountingService } from "../services/accountingService";
import {
  AccountCreateDto,
  AccountUpdateDto,
  AccountFilterDto,
  JournalEntryCreateDto,
  JournalEntryFilterDto,
  PaginationDto,
  PostPaymentDto,
  GiveCustodyByAccountDto,
  ReturnCustodyByAccountDto,
  ReplenishCustodyByAccountDto,
  CreateCustodyAccountDto,
  SetInitialBalanceDto,
} from "../types/api";
import { toast } from "sonner";

// Account Hooks
export const useAccounts = (
  pagination: PaginationDto,
  filters?: AccountFilterDto
) => {
  return useQuery({
    queryKey: ["accounts", pagination, filters],
    queryFn: () => accountingService.getAccounts(pagination, filters),
  });
};

export const useAccount = (id: string) => {
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => accountingService.getAccount(id),
    enabled: !!id,
  });
};

export const useAccountHierarchy = () => {
  return useQuery({
    queryKey: ["accountHierarchy"],
    queryFn: () => accountingService.getAccountHierarchy(),
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AccountCreateDto) =>
      accountingService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accountHierarchy"] });
      toast.success("Account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create account");
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AccountUpdateDto }) =>
      accountingService.updateAccount(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account", id] });
      queryClient.invalidateQueries({ queryKey: ["accountHierarchy"] });
      toast.success("Account updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update account");
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountingService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accountHierarchy"] });
      toast.success("Account deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete account");
    },
  });
};

// Journal Entry Hooks
export const useJournalEntries = (
  pagination: PaginationDto,
  filters?: JournalEntryFilterDto
) => {
  return useQuery({
    queryKey: ["journalEntries", pagination, filters],
    queryFn: () => accountingService.getJournalEntries(pagination, filters),
  });
};

export const useJournalEntry = (id: string) => {
  return useQuery({
    queryKey: ["journalEntry", id],
    queryFn: () => accountingService.getJournalEntry(id),
    enabled: !!id,
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JournalEntryCreateDto) =>
      accountingService.createJournalEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Journal entry created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create journal entry");
    },
  });
};

export const usePostJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountingService.postJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Journal entry posted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post journal entry");
    },
  });
};

export const useReverseJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountingService.reverseJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Journal entry reversed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reverse journal entry");
    },
  });
};

// General Ledger Hooks
export const useAccountBalance = (accountId: string, asOfDate?: string) => {
  return useQuery({
    queryKey: ["accountBalance", accountId, asOfDate],
    queryFn: () => accountingService.getAccountBalance(accountId, asOfDate),
    enabled: !!accountId,
  });
};

export const useTrialBalance = (asOfDate?: string) => {
  return useQuery({
    queryKey: ["trialBalance", asOfDate],
    queryFn: () => accountingService.getTrialBalance(asOfDate),
  });
};

export const useAccountLedger = (
  accountId: string,
  fromDate?: string,
  toDate?: string
) => {
  return useQuery({
    queryKey: ["accountLedger", accountId, fromDate, toDate],
    queryFn: () =>
      accountingService.getAccountLedger(accountId, fromDate, toDate),
    enabled: !!accountId,
  });
};

export const useProfitAndLoss = (fromDate: string, toDate: string) => {
  return useQuery({
    queryKey: ["profitAndLoss", fromDate, toDate],
    queryFn: () => accountingService.getProfitAndLoss(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });
};

export const useBalanceSheet = (asOfDate: string) => {
  return useQuery({
    queryKey: ["balanceSheet", asOfDate],
    queryFn: () => accountingService.getBalanceSheet(asOfDate),
    enabled: !!asOfDate,
  });
};

// Posting Hooks
export const usePostInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) => accountingService.postInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice posted to accounting successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post invoice");
    },
  });
};

export const usePostExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: number) =>
      accountingService.postExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense posted to accounting successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post expense");
    },
  });
};

export const usePostPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostPaymentDto) => accountingService.postPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Payment posted to accounting successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post payment");
    },
  });
};

export const useInvoicePostingStatus = (invoiceId: string) => {
  return useQuery({
    queryKey: ["invoicePostingStatus", invoiceId],
    queryFn: () => accountingService.getInvoicePostingStatus(invoiceId),
    enabled: !!invoiceId,
  });
};

export const useExpensePostingStatus = (expenseId: number) => {
  return useQuery({
    queryKey: ["expensePostingStatus", expenseId],
    queryFn: () => accountingService.getExpensePostingStatus(expenseId),
    enabled: !!expenseId,
  });
};


export const useGiveCustodyByAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GiveCustodyByAccountDto) => {
      const result = await accountingService.giveCustodyByAccount(data);
      if (!result.success) {
        throw new Error(result.errorMessage || "Failed to give custody");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Custody given successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to give custody");
    },
  });
};

export const useReturnCustodyByAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReturnCustodyByAccountDto) => {
      const result = await accountingService.returnCustodyByAccount(data);
      if (!result.success) {
        throw new Error(result.errorMessage || "Failed to return custody");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Custody returned successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to return custody");
    },
  });
};

export const useReplenishCustodyByAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReplenishCustodyByAccountDto) => {
      const result = await accountingService.replenishCustodyByAccount(data);
      if (!result.success) {
        throw new Error(result.errorMessage || "Failed to replenish custody");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Custody replenished successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to replenish custody");
    },
  });
};

export const useCreateCustodyAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustodyAccountDto) =>
      accountingService.createCustodyAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Custody account created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create custody account");
    },
  });
};

export const useSetInitialBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetInitialBalanceDto) =>
      accountingService.setInitialBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accountHierarchy"] });
      queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      toast.success("Initial balance set successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to set initial balance");
    },
  });
};
