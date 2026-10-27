import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Loader2,
  ChevronRight,
  ChevronDown,
  FileText,
  Banknote,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useAccountHierarchy,
  useSetInitialBalance,
} from "../hooks/useAccounting";
import {
  AccountDto,
  AccountCreateDto,
  AccountUpdateDto,
  AccountType,
} from "../types/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { formatCurrency } from "../Helpers/formatCurrency";
import { toast } from "sonner";

const ChartOfAccounts: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState<
    AccountType | "all"
  >("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(
    null
  );
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(
    new Set()
  );
  const [isInitialBalanceModalOpen, setIsInitialBalanceModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 100,
  });

  const { data: accountsResponse, isLoading, refetch } = useAccounts(
    pagination,
    {
      name: searchTerm || undefined,
      accountType:
        selectedAccountType !== "all"
          ? selectedAccountType
          : undefined,
    }
  );

  const { data: hierarchyResponse } = useAccountHierarchy();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const accounts = accountsResponse?.data?.data || [];
  const hierarchy = hierarchyResponse?.data || [];

  const accountTypeColors: Record<AccountType, string> = {
    [AccountType.Asset]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [AccountType.Liability]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    [AccountType.Equity]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    [AccountType.Revenue]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    [AccountType.Expense]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  };

  const toggleExpand = (accountId: string) => {
    setExpandedAccounts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleCreateAccount = () => {
    setSelectedAccount(null);
    setFormDataForNewAccount(null);
    setIsCreateModalOpen(true);
  };

  const handleEditAccount = (account: AccountDto) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (
      window.confirm(
        isRTL
          ? "هل أنت متأكد من حذف هذا الحساب؟"
          : "Are you sure you want to delete this account?"
      )
    ) {
      try {
        const result = await deleteAccountMutation.mutateAsync(accountId);
        if (result.success) {
          refetch();
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to delete account");
      }
    }
  };

  const handleAddChild = (parentAccount: AccountDto) => {
    setSelectedAccount(null); // Reset for new account
    // Pre-populate parent ID for the modal
    // We might need to update CreateAccountModal to accept a defaultParentId
    setFormDataForNewAccount({
        parentAccountId: parentAccount.id,
        accountType: parentAccount.accountType,
        accountCode: "", // Let it be generated or entered
        name: "",
        isActive: true,
        isPostable: true,
        description: ""
    });
    setIsCreateModalOpen(true);
  };

  // State to pass to the modal
  const [formDataForNewAccount, setFormDataForNewAccount] = useState<AccountCreateDto | null>(null);

  const renderAccountTree = (accountList: AccountDto[], level: number = 0) => {
    return accountList.map((account) => {
      const hasChildren = account.childAccounts && account.childAccounts.length > 0;
      const isExpanded = expandedAccounts.has(account.id);

      return (
        <div key={account.id} className="group">
          <div
            className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200 hover:bg-white hover:shadow-sm dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 ${
              level > 0 ? "" : "font-semibold bg-gray-50/50 dark:bg-gray-900/30"
            }`}
            style={{ marginLeft: `${level * 1.5}rem` }}
          >
            <div className="flex items-center gap-1 min-w-[32px]">
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(account.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                </div>
              )}
            </div>

            <div className="flex-1 flex items-center gap-3">
              <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                {account.accountCode}
              </span>
              <span className="flex-1 truncate text-sm lg:text-base">
                {account.name}
              </span>
              
              <div className="hidden sm:flex items-center gap-2">
                {account.isPostable && (
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {isRTL ? "قابل للترحيل" : "Postable"}
                  </Badge>
                )}
                {account.balance !== undefined && (
                  <span className={`text-sm font-medium ${account.balance < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {formatCurrency(account.balance)}
                  </span>
                )}
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                  onClick={() => handleAddChild(account)}
                  title={isRTL ? "إضافة حساب فرعي" : "Add Sub-account"}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEditAccount(account)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {!account.isSystem && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteAccount(account.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {account.isPostable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => {
                        setSelectedAccount(account);
                        setIsInitialBalanceModalOpen(true);
                    }}
                    title={isRTL ? "ضبط الرصيد الافتتاحي" : "Set Initial Balance"}
                  >
                    <Banknote className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {hasChildren && isExpanded && account.childAccounts && (
            <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 ml-[-0px]" style={{ marginLeft: `${level * 1.5}rem` }} />
                <div className="">
                {renderAccountTree(account.childAccounts, level + 1)}
                </div>
            </div>
          )}
        </div>
      );
    });
  };

  const groupedHierarchy = hierarchy.reduce((acc, account) => {
    // Handle both numeric and string values for accountType
    let typeValue = account.accountType as any;
    if (typeof typeValue === "string") {
      typeValue = (AccountType as any)[typeValue];
    }
    
    if (!acc[typeValue]) acc[typeValue] = [];
    acc[typeValue].push(account);
    return acc;
  }, {} as Record<number, AccountDto[]>);

  const accountTypeNames: Record<number, string> = {
    [AccountType.Asset]: isRTL ? "الأصول" : "Assets",
    [AccountType.Liability]: isRTL ? "الخصوم" : "Liabilities",
    [AccountType.Equity]: isRTL ? "حقوق الملكية" : "Equity",
    [AccountType.Revenue]: isRTL ? "الإيرادات" : "Revenue",
    [AccountType.Expense]: isRTL ? "المصروفات" : "Expenses",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {isRTL ? "دليل الحسابات" : "Chart of Accounts"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
                {isRTL
                    ? "هنا يمكنك إدارة شجرة الحسابات المحاسبية الخاصة بك"
                    : "Manage your complex accounting structures with ease."}
            </p>
          </div>
          <Button 
            onClick={handleCreateAccount}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? "إضافة حساب رئيسي" : "Add Root Account"}
          </Button>
        </div>

        {/* Global Search and Filter */}
        <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  placeholder={isRTL ? "بحث في شجرة الحسابات..." : "Search accounts tree..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={selectedAccountType}
                onValueChange={(val) => setSelectedAccountType(val as any)}
              >
                <SelectTrigger className="w-full md:w-56 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? "كل الأنواع" : "All Types"}</SelectItem>
                  {Object.entries(accountTypeNames).map(([val, name]) => (
                    <SelectItem key={val} value={val}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Tree List */}
        <div className="grid gap-8">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-slate-500">
                        {isRTL ? "جاري تحميل البيانات..." : "Loading accounting data..."}
                    </p>
                </div>
            ) : (
              groupedHierarchy &&
                Object.entries(groupedHierarchy)
                  .filter(
                    ([type]) =>
                      selectedAccountType === "all" ||
                      selectedAccountType === Number(type)
                  )
                  .map(([type, accounts]) => (
                    <div key={type} className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                            <div className={`w-1 h-6 rounded-full ${
                                type === AccountType.Asset.toString() ? 'bg-blue-500' :
                                type === AccountType.Liability.toString() ? 'bg-red-500' :
                                type === AccountType.Equity.toString() ? 'bg-emerald-500' :
                                type === AccountType.Revenue.toString() ? 'bg-purple-500' : 'bg-orange-500'
                            }`} />
                            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                {accountTypeNames[parseInt(type)]}
                            </h2>
                            <Badge variant="secondary" className="ml-auto rounded-full px-2.5">
                                {accounts.length}
                            </Badge>
                        </div>
                        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                            <CardContent className="p-2 md:p-4 space-y-1">
                                {renderAccountTree(accounts)}
                            </CardContent>
                        </Card>
                    </div>
                ))
            )}
        </div>

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setFormDataForNewAccount(null);
          }}
          initialData={formDataForNewAccount}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            setFormDataForNewAccount(null);
            refetch();
          }}
        />

        {/* Edit Account Modal */}
        {selectedAccount && (
          <EditAccountModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedAccount(null);
              refetch();
            }}
          />
        )}

        {/* Initial Balance Modal */}
        {selectedAccount && (
          <InitialBalanceModal
            isOpen={isInitialBalanceModalOpen}
            onClose={() => {
              setIsInitialBalanceModalOpen(false);
              setSelectedAccount(null);
            }}
            account={selectedAccount}
            accounts={accounts}
            onSuccess={() => {
              setIsInitialBalanceModalOpen(false);
              setSelectedAccount(null);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Create Account Modal Component
interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: AccountCreateDto | null;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const { isRTL } = useLanguage();
  const createAccountMutation = useCreateAccount();
  const [formData, setFormData] = useState<AccountCreateDto>({
    accountCode: "",
    name: "",
    accountType: AccountType.Asset,
    description: "",
    isActive: true,
    isPostable: false,
  });

  React.useEffect(() => {
    if (initialData) {
        setFormData(initialData);
    } else {
        setFormData({
            accountCode: "",
            name: "",
            accountType: AccountType.Asset,
            description: "",
            isActive: true,
            isPostable: false,
        });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAccountMutation.mutateAsync(formData);
      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "إضافة حساب جديد" : "Create New Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {isRTL ? "رمز الحساب" : "Account Code"} *
              </Label>
              <Input
                value={formData.accountCode}
                onChange={(e) =>
                  setFormData({ ...formData, accountCode: e.target.value })
                }
                required
                placeholder="e.g., 1000"
              />
            </div>
            <div>
              <Label>
                {isRTL ? "اسم الحساب" : "Account Name"} *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div>
            <Label>
              {isRTL ? "نوع الحساب" : "Account Type"} *
            </Label>
            <Select
              value={formData.accountType.toString()}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  accountType: parseInt(value) as AccountType,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.Asset.toString()}>
                  Asset
                </SelectItem>
                <SelectItem value={AccountType.Liability.toString()}>
                  Liability
                </SelectItem>
                <SelectItem value={AccountType.Equity.toString()}>
                  Equity
                </SelectItem>
                <SelectItem value={AccountType.Revenue.toString()}>
                  Revenue
                </SelectItem>
                <SelectItem value={AccountType.Expense.toString()}>
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>
              {isRTL ? "الوصف" : "Description"}
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isActive">
                {isRTL ? "نشط" : "Active"}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPostable"
                checked={formData.isPostable}
                onChange={(e) =>
                  setFormData({ ...formData, isPostable: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label htmlFor="isPostable">
                {isRTL ? "قابل للترحيل" : "Postable"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                isRTL ? "حفظ" : "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Account Modal Component
interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDto;
  onSuccess: () => void;
}

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSuccess,
}) => {
  const { isRTL } = useLanguage();
  const updateAccountMutation = useUpdateAccount();
  const [formData, setFormData] = useState<AccountUpdateDto>({
    name: account.name,
    description: account.description,
    isActive: account.isActive,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await updateAccountMutation.mutateAsync({
        id: account.id,
        data: formData,
      });
      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "تعديل الحساب" : "Edit Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>
              {isRTL ? "رمز الحساب" : "Account Code"}
            </Label>
            <Input value={account.accountCode} disabled />
          </div>
          <div>
            <Label>
              {isRTL ? "اسم الحساب" : "Account Name"} *
            </Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <Label>
              {isRTL ? "الوصف" : "Description"}
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="w-4 h-4"
            />
            <Label htmlFor="isActive">
              {isRTL ? "نشط" : "Active"}
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={updateAccountMutation.isPending}
            >
              {updateAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                isRTL ? "حفظ" : "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Initial Balance Modal Component
interface InitialBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDto;
  accounts: AccountDto[];
  onSuccess: () => void;
}

const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({
  isOpen,
  onClose,
  account,
  accounts,
  onSuccess,
}) => {
  const { isRTL } = useLanguage();
  const setInitialBalanceMutation = useSetInitialBalance();
  const [formData, setFormData] = useState({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    sourceAccountId: "",
  });

  const cashBankAccounts = accounts.filter(
    (a) =>
      a.isPostable &&
      (a.accountType === AccountType.Cash || a.accountType === AccountType.Bank) &&
      a.id !== account.id
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await setInitialBalanceMutation.mutateAsync({
        accountId: account.id,
        amount: formData.amount,
        date: formData.date,
        description: formData.description || undefined,
        sourceAccountId: formData.sourceAccountId || undefined,
      });
      if (result.success) {
        onSuccess();
      }
    } catch (error: any) {}
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "ضبط الرصيد الافتتاحي" : "Set Initial Balance"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              {isRTL ? "الحساب المستهدف" : "Target Account"}
            </p>
            <p className="font-bold">{account.name}</p>
            <p className="text-xs text-muted-foreground">{account.accountCode}</p>
          </div>

          <div>
            <Label>{isRTL ? "المبلغ" : "Amount"} *</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label>{isRTL ? "التاريخ" : "Date"} *</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label>{isRTL ? "المصدر (اختياري)" : "Source (Optional)"}</Label>
            <Select
              value={formData.sourceAccountId}
              onValueChange={(val) =>
                setFormData({ ...formData, sourceAccountId: val })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isRTL ? "رأس المال / رصيد افتتاحي" : "Equity / Opening Balance"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equity">
                  {isRTL ? "رأس المال / رصيد افتتاحي" : "Equity / Opening Balance"}
                </SelectItem>
                {cashBankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.accountCode} - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground mt-1">
              {isRTL
                ? "اتركه فارغاً ليتم اعتباره رصيداً افتتاحياً من حقوق الملكية"
                : "Leave empty to use Opening Balance Equity"}
            </p>
          </div>

          <div>
            <Label>{isRTL ? "الوصف" : "Description"}</Label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder={isRTL ? "وصف للرصيد الافتتاحي" : "Opening balance description"}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={setInitialBalanceMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {setInitialBalanceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                isRTL ? "حفظ" : "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChartOfAccounts;

