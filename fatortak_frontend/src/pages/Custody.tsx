import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Wallet,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useGiveCustodyByAccount,
  useReturnCustodyByAccount,
  useReplenishCustodyByAccount,
  useCreateCustodyAccount,
  useAccounts,
} from "../hooks/useAccounting";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "../components/ui/select";
import { formatCurrency } from "../Helpers/formatCurrency";
import { toast } from "react-toastify";
import { AccountDto } from "../types/api";

const Custody: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(null);
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReplenishModalOpen, setIsReplenishModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState<string>("");
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [destinationAccountId, setDestinationAccountId] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Create account form state
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountDescription, setNewAccountDescription] = useState("");

  // Fetch all accounts to filter custody accounts and for source/destination selection
  const { data: accountsResponse, isLoading: accountsLoading } = useAccounts(
    { pageNumber: 1, pageSize: 1000 },
    { isActive: true }
  );

  const allAccounts = accountsResponse?.data?.data || [];
  
  // Filter custody accounts: Postable accounts that are children of "Employee Custody" (1500)
  const custodyAccounts = useMemo(() => {
    // Find the Employee Custody parent account (code 1500)
    const parentAccount = allAccounts.find(a => a.accountCode === "1500");
    if (!parentAccount) return [];

    return allAccounts.filter(a => 
      a.parentAccountId === parentAccount.id && 
      (searchTerm === "" || a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.accountCode.includes(searchTerm))
    );
  }, [allAccounts, searchTerm]);

  // Accounts for source/destination (typically Cash or Bank - children of 1000 or 1100)
  const cashBankAccounts = useMemo(() => {
    return allAccounts.filter(a => a.isPostable && (a.accountCode.startsWith("10") || a.accountCode.startsWith("11")));
  }, [allAccounts]);

  // Get all other postable custody accounts (excluding selected custody account)
  const otherCustodyAccounts = useMemo(() => {
    const parentAccount = allAccounts.find(a => a.accountCode === "1500");
    if (!parentAccount) return [];

    return allAccounts.filter(a => 
      a.isPostable &&
      a.parentAccountId === parentAccount.id && 
      (!selectedAccount || a.id !== selectedAccount.id)
    );
  }, [allAccounts, selectedAccount]);

  const giveCustodyMutation = useGiveCustodyByAccount();
  const returnCustodyMutation = useReturnCustodyByAccount();
  const replenishCustodyMutation = useReplenishCustodyByAccount();
  const createAccountMutation = useCreateCustodyAccount();

  const resetForm = () => {
    setAmount("");
    setSourceAccountId("");
    setDestinationAccountId("");
    setDescription("");
  };

  const handleGive = async () => {
    if (!selectedAccount || !amount || !sourceAccountId) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    const sourceAcc = allAccounts.find(a => a.id === sourceAccountId);
    
    if (sourceAcc && (sourceAcc.balance || 0) < amountNum) {
      toast.error(isRTL 
        ? `رصيد غير كافٍ في ${sourceAcc.name}. الرصيد المتاح: ${formatCurrency(sourceAcc.balance || 0)}`
        : `Insufficient funds in ${sourceAcc.name}. Available balance: ${formatCurrency(sourceAcc.balance || 0)}`
      );
      return;
    }

    try {
      await giveCustodyMutation.mutateAsync({
        accountId: selectedAccount.id,
        amount: amountNum,
        sourceAccountId,
        description: description || (isRTL ? `صرف عهدة - ${selectedAccount.name}` : `Give custody - ${selectedAccount.name}`),
      });
      setIsGiveModalOpen(false);
      resetForm();
    } catch (error) {}
  };

  const handleReturn = async () => {
    if (!selectedAccount || !amount || !destinationAccountId) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    try {
      await returnCustodyMutation.mutateAsync({
        accountId: selectedAccount.id,
        amount: parseFloat(amount),
        destinationAccountId,
        description: description || (isRTL ? `رد عهدة - ${selectedAccount.name}` : `Return custody - ${selectedAccount.name}`),
      });
      setIsReturnModalOpen(false);
      resetForm();
    } catch (error) {}
  };

  const handleReplenish = async () => {
    if (!selectedAccount || !amount || !sourceAccountId) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    const amountNum = parseFloat(amount);
    const sourceAcc = allAccounts.find(a => a.id === sourceAccountId);

    if (sourceAcc && (sourceAcc.balance || 0) < amountNum) {
      toast.error(isRTL 
        ? `رصيد غير كافٍ في ${sourceAcc.name}. الرصيد المتاح: ${formatCurrency(sourceAcc.balance || 0)}`
        : `Insufficient funds in ${sourceAcc.name}. Available balance: ${formatCurrency(sourceAcc.balance || 0)}`
      );
      return;
    }

    try {
      await replenishCustodyMutation.mutateAsync({
        accountId: selectedAccount.id,
        amount: amountNum,
        sourceAccountId,
        description: description || (isRTL ? `تعزيز عهدة - ${selectedAccount.name}` : `Replenish custody - ${selectedAccount.name}`),
      });
      setIsReplenishModalOpen(false);
      resetForm();
    } catch (error) {}
  };

  const handleCreateAccount = async () => {
    if (!newAccountName) {
      toast.error(isRTL ? "يرجى إدخال اسم الموظف" : "Please enter employee name");
      return;
    }

    try {
      await createAccountMutation.mutateAsync({
        name: newAccountName,
        description: newAccountDescription,
      });
      setIsCreateModalOpen(false);
      setNewAccountName("");
      setNewAccountDescription("");
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "إدارة العهد والحسابات" : "Custody & Accounts Management"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL
                    ? "إدارة عهد الموظفين والعمليات المالية من خلال حساباتهم"
                    : "Manage employee custodies and financial operations via accounts"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-8 rounded-2xl backdrop-blur-sm transition-all duration-300"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2 ml-2" />
                {isRTL ? "إضافة موظف جديد" : "Add New Employee"}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-600" />
                  {isRTL ? "حسابات العهد" : "Custody Accounts"}
                </CardTitle>
                <div className="relative w-64">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} w-4 h-4 text-muted-foreground`} />
                  <Input
                    placeholder={isRTL ? "بحث عن حساب..." : "Search accounts..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? "pr-10" : "pl-10"}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-start">{isRTL ? "كود الحساب" : "Account Code"}</th>
                      <th className="px-4 py-3 text-start">{isRTL ? "اسم الحساب" : "Account Name"}</th>
                      <th className="px-4 py-3 text-start">{isRTL ? "الرصيد الحالي" : "Current Balance"}</th>
                      <th className="px-4 py-3 text-end">{isRTL ? "إجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/20">
                    {accountsLoading ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center">
                          <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-600" />
                        </td>
                      </tr>
                    ) : custodyAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          {isRTL ? "لا توجد حسابات عهد متطابقة" : "No matching custody accounts found"}
                        </td>
                      </tr>
                    ) : (
                      custodyAccounts.map((account) => (
                        <tr key={account.id} className={`hover:bg-muted/10 transition-colors ${selectedAccount?.id === account.id ? "bg-orange-50/50 dark:bg-orange-950/10" : ""}`}>
                          <td className="px-4 py-4 font-mono text-xs">{account.accountCode}</td>
                          <td className="px-4 py-4 font-medium">{account.name}</td>
                          <td className="px-4 py-4">
                            <span className={`font-bold ${(account.balance || 0) > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                              {formatCurrency(account.balance || 0)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-end">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-orange-200 hover:bg-orange-50 text-orange-700 dark:border-orange-900 dark:hover:bg-orange-950"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsGiveModalOpen(true);
                                }}
                              >
                                <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                                {isRTL ? "إيداع" : "Give"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-emerald-200 hover:bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:hover:bg-emerald-950"
                                onClick={() => {
                                  setSelectedAccount(account);
                                  setIsReturnModalOpen(true);
                                }}
                              >
                                <ArrowDownLeft className="w-3.5 h-3.5 mr-1" />
                                {isRTL ? "رد" : "Return"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-blue-600"
                                onClick={() => setSelectedAccount(account)}
                              >
                                <History className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Account Detail / History Sidebar */}
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                {isRTL ? "سجل الحساب" : "Account Record"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedAccount ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{selectedAccount.name}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground">{selectedAccount.accountCode}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900">
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">{isRTL ? "الرصيد الحالي" : "Current Balance"}</p>
                      <span className={`font-bold ${(selectedAccount.balance || 0) > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {formatCurrency(selectedAccount.balance || 0)}
                      </span>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{isRTL ? "الحالة" : "Status"}</p>
                      <Badge variant={selectedAccount.isActive ? "default" : "destructive"}>
                        {selectedAccount.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "مجمد" : "Inactive")}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    onClick={() => {
                        setIsReplenishModalOpen(true);
                    }}
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    {isRTL ? "تعزيز الرصيد" : "Replenish Balance"}
                  </Button>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-center text-muted-foreground italic mb-4">
                      {isRTL ? "سيتم عرض سجل العمليات هنا قريباً" : "Transaction history will appear here soon"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                  <Wallet className="w-12 h-12 text-muted/30" />
                  <p className="text-muted-foreground text-sm max-w-[200px]">
                    {isRTL 
                      ? "اختر حساباً لعرض تفاصيله وسجل عملياته" 
                      : "Select an account to view details and transaction history"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Give Custody Modal */}
        <Dialog open={isGiveModalOpen} onOpenChange={(open) => { setIsGiveModalOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-orange-600" />
                {isRTL ? "صرف مبلغ عهدة" : "Give Custody Amount"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? "حساب العهدة" : "Custody Account"}</Label>
                <Input value={selectedAccount?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "المبلغ" : "Amount"}</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "مصدر الأموال" : "Source Account"}</Label>
                <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر الحساب المصدر" : "Select source account"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{isRTL ? "الخزائن والبنوك" : "Cash & Banks"}</SelectLabel>
                      {cashBankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <div className="flex justify-between items-center w-full gap-8">
                            <span>{acc.accountCode} - {acc.name}</span>
                            <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              ({formatCurrency(acc.balance || 0)})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {otherCustodyAccounts.length > 0 && (
                      <>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>{isRTL ? "عهد الموظفين الأخرى" : "Other Employee Custodies"}</SelectLabel>
                          {otherCustodyAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              <div className="flex justify-between items-center w-full gap-8">
                                <span>{acc.accountCode} - {acc.name}</span>
                                <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                  ({formatCurrency(acc.balance || 0)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "البيان" : "Description"}</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={isRTL ? "أدخل بياناً للعملية" : "Enter description"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGiveModalOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button 
                onClick={handleGive} 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={giveCustodyMutation.isPending}
              >
                {giveCustodyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isRTL ? "إتمام العملية" : "Complete Operation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Custody Modal */}
        <Dialog open={isReturnModalOpen} onOpenChange={(open) => { setIsReturnModalOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                {isRTL ? "رد مبلغ من العهدة" : "Return Custody Amount"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? "حساب العهدة" : "Custody Account"}</Label>
                <Input value={selectedAccount?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "المبلغ المردود" : "Returned Amount"}</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "جهة الإيداع" : "Destination Account"}</Label>
                <Select value={destinationAccountId} onValueChange={setDestinationAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر حساب الإيداع" : "Select destination account"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{isRTL ? "الخزائن والبنوك" : "Cash & Banks"}</SelectLabel>
                      {cashBankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <div className="flex justify-between items-center w-full gap-8">
                            <span>{acc.accountCode} - {acc.name}</span>
                            <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              ({formatCurrency(acc.balance || 0)})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {otherCustodyAccounts.length > 0 && (
                      <>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>{isRTL ? "عهد الموظفين الأخرى" : "Other Employee Custodies"}</SelectLabel>
                          {otherCustodyAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              <div className="flex justify-between items-center w-full gap-8">
                                <span>{acc.accountCode} - {acc.name}</span>
                                <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                  ({formatCurrency(acc.balance || 0)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "البيان" : "Description"}</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={isRTL ? "أدخل بياناً للعملية" : "Enter description"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button 
                onClick={handleReturn} 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={returnCustodyMutation.isPending}
              >
                {returnCustodyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isRTL ? "إتمام العملية" : "Complete Operation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Replenish Custody Modal */}
        <Dialog open={isReplenishModalOpen} onOpenChange={(open) => { setIsReplenishModalOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-600" />
                {isRTL ? "تعزيز حساب العهدة" : "Replenish Custody Account"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? "حساب العهدة" : "Custody Account"}</Label>
                <Input value={selectedAccount?.name || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "المبلغ الإضافي" : "Additional Amount"}</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "مصدر الأموال" : "Source Account"}</Label>
                <Select value={sourceAccountId} onValueChange={setSourceAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? "اختر الحساب المصدر" : "Select source account"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{isRTL ? "الخزائن والبنوك" : "Cash & Banks"}</SelectLabel>
                      {cashBankAccounts.map((acc) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <div className="flex justify-between items-center w-full gap-8">
                            <span>{acc.accountCode} - {acc.name}</span>
                            <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              ({formatCurrency(acc.balance || 0)})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    {otherCustodyAccounts.length > 0 && (
                      <>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>{isRTL ? "عهد الموظفين الأخرى" : "Other Employee Custodies"}</SelectLabel>
                          {otherCustodyAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              <div className="flex justify-between items-center w-full gap-8">
                                <span>{acc.accountCode} - {acc.name}</span>
                                <span className={`text-xs font-bold ${(acc.balance || 0) > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                  ({formatCurrency(acc.balance || 0)})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? "البيان" : "Description"}</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder={isRTL ? "أدخل بياناً للعملية" : "Enter description"}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReplenishModalOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button 
                onClick={handleReplenish} 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={replenishCustodyMutation.isPending}
              >
                {replenishCustodyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isRTL ? "إتمام العملية" : "Complete Operation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Create Account Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                {isRTL ? "إضافة موظف جديد" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-account-name" className="items-center flex gap-1">
                  {isRTL ? "اسم الموظف" : "Employee Name"}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-account-name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder={isRTL ? "مثال: أحمد محمد" : "e.g. John Doe"}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-account-description">{isRTL ? "ملاحظات" : "Description"}</Label>
                <Input
                  id="create-account-description"
                  value={newAccountDescription}
                  onChange={(e) => setNewAccountDescription(e.target.value)}
                  placeholder={isRTL ? "أي تفاصيل إضافية..." : "Any additional details..."}
                  className="rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button
                onClick={handleCreateAccount}
                disabled={createAccountMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                {createAccountMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isRTL ? "إضافة" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Custody;
