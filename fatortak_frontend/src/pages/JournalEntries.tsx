import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Filter,
  Paperclip,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useJournalEntries,
  useCreateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
  useAccounts,
} from "../hooks/useAccounting";
import {
  JournalEntryDto,
  JournalEntryCreateDto,
  JournalEntryLineCreateDto,
  JournalEntryReferenceType,
  AccountDto,
  PaginationDto,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { formatCurrency } from "../Helpers/formatCurrency";
import { formatDate } from "../Helpers/localization";
import { toast } from "sonner";

const JournalEntries: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryDto | null>(
    null
  );
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 20,
  });
  const [filters, setFilters] = useState<{
    fromDate?: string;
    toDate?: string;
    referenceType?: JournalEntryReferenceType;
    isPosted?: boolean;
  }>({});
  
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageNumber: 1 }));
  }, [searchTerm, filters]);

  const { data: entriesResponse, isLoading, refetch } = useJournalEntries(
    pagination,
    {
      entryNumber: searchTerm || undefined,
      ...filters,
    }
  );

  const { data: accountsResponse } = useAccounts(
    { pageNumber: 1, pageSize: 1000 },
    { isActive: true, isPostable: true }
  );

  const postEntryMutation = usePostJournalEntry();
  const reverseEntryMutation = useReverseJournalEntry();

  const entries = entriesResponse?.data?.data || [];
  const totalCount = entriesResponse?.data?.totalCount || 0;
  const totalPages = entriesResponse?.data?.totalPages || 0;
  const accounts = accountsResponse?.data?.data || [];

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const referenceTypeColors: Record<JournalEntryReferenceType, string> = {
    [JournalEntryReferenceType.Manual]: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    [JournalEntryReferenceType.Invoice]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    [JournalEntryReferenceType.Expense]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    [JournalEntryReferenceType.Payment]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    [JournalEntryReferenceType.PurchaseInvoice]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    [JournalEntryReferenceType.Reversing]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    [JournalEntryReferenceType.Inventory]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    [JournalEntryReferenceType.Payroll]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  };

  const handleViewDetails = (entry: JournalEntryDto) => {
    setSelectedEntry(entry);
    setIsDetailModalOpen(true);
  };

  const handlePost = async (entryId: string) => {
    if (
      window.confirm(
        isRTL
          ? "هل أنت متأكد من ترحيل هذا القيد؟"
          : "Are you sure you want to post this entry?"
      )
    ) {
      try {
        const result = await postEntryMutation.mutateAsync(entryId);
        if (result.success) {
          refetch();
        }
      } catch (error: any) {
        // Error handled by mutation
      }
    }
  };

  const handleReverse = async (entryId: string) => {
    if (
      window.confirm(
        isRTL
          ? "هل أنت متأكد من عكس هذا القيد؟"
          : "Are you sure you want to reverse this entry?"
      )
    ) {
      try {
        const result = await reverseEntryMutation.mutateAsync(entryId);
        if (result.success) {
          refetch();
        }
      } catch (error: any) {
        // Error handled by mutation
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isRTL ? "قيود اليومية" : "Journal Entries"}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isRTL
                      ? "إدارة القيود المحاسبية"
                      : "Manage accounting journal entries"}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة قيد" : "Add Entry"}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={
                    isRTL ? "بحث برقم القيد..." : "Search by entry number..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.referenceType?.toString() || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    referenceType:
                      value === "all"
                        ? undefined
                        : (parseInt(value) as JournalEntryReferenceType),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "نوع المرجع" : "Reference Type"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "جميع الأنواع" : "All Types"}
                  </SelectItem>
                  <SelectItem value={JournalEntryReferenceType.Manual.toString()}>
                    Manual
                  </SelectItem>
                  <SelectItem value={JournalEntryReferenceType.Invoice.toString()}>
                    Invoice
                  </SelectItem>
                  <SelectItem value={JournalEntryReferenceType.Expense.toString()}>
                    Expense
                  </SelectItem>
                  <SelectItem value={JournalEntryReferenceType.Payment.toString()}>
                    Payment
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={
                  filters.isPosted === undefined
                    ? "all"
                    : filters.isPosted
                    ? "posted"
                    : "unposted"
                }
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    isPosted:
                      value === "all"
                        ? undefined
                        : value === "posted",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isRTL ? "الكل" : "All"}
                  </SelectItem>
                  <SelectItem value="posted">
                    {isRTL ? "مرحل" : "Posted"}
                  </SelectItem>
                  <SelectItem value="unposted">
                    {isRTL ? "غير مرحل" : "Unposted"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setFilters({})}
              >
                <Filter className="w-4 h-4 mr-2" />
                {isRTL ? "إعادة تعيين" : "Reset"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isRTL ? "قائمة القيود" : "Entries List"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isRTL ? "رقم القيد" : "Entry #"}</TableHead>
                        <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                        <TableHead>{isRTL ? "النوع" : "Type"}</TableHead>
                        <TableHead>{isRTL ? "الوصف" : "Description"}</TableHead>
                        <TableHead className="text-right">
                          {isRTL ? "مدين" : "Debit"}
                        </TableHead>
                        <TableHead className="text-right">
                          {isRTL ? "دائن" : "Credit"}
                        </TableHead>
                        <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                        <TableHead>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.length > 0 ? (
                        entries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono">
                              {entry.entryNumber}
                            </TableCell>
                            <TableCell>
                              {formatDate(new Date(entry.date))}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  referenceTypeColors[entry.referenceType]
                                }
                              >
                                {entry.referenceTypeName}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {entry.description || "-"}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(entry.totalDebit)}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              {formatCurrency(entry.totalCredit)}
                            </TableCell>
                            <TableCell>
                              {entry.isPosted ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {isRTL ? "مرحل" : "Posted"}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  {isRTL ? "غير مرحل" : "Unposted"}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDetails(entry)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {!entry.isPosted && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePost(entry.id)}
                                    disabled={postEntryMutation.isPending}
                                  >
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                                {entry.isPosted && !entry.reversingEntryId && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleReverse(entry.id)}
                                    disabled={reverseEntryMutation.isPending}
                                  >
                                    <RotateCcw className="w-4 h-4 text-orange-600" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-12 text-gray-500"
                          >
                            {isRTL ? "لا توجد قيود" : "No entries found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 border-t pt-4">
                    <div className="text-sm text-gray-500">
                      {isRTL
                        ? `عرض ${entries.length} من ${totalCount} قيد`
                        : `Showing ${entries.length} of ${totalCount} entries`}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.pageNumber - 1)}
                        disabled={pagination.pageNumber === 1}
                      >
                        {isRTL ? "السابق" : "Previous"}
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Simple pagination logic to show around current page
                          let pageToShow = pagination.pageNumber;
                          if (totalPages <= 5) {
                            pageToShow = i + 1;
                          } else {
                            if (pagination.pageNumber <= 3) {
                              pageToShow = i + 1;
                            } else if (pagination.pageNumber >= totalPages - 2) {
                              pageToShow = totalPages - 4 + i;
                            } else {
                              pageToShow = pagination.pageNumber - 2 + i;
                            }
                          }

                          return (
                            <Button
                              key={pageToShow}
                              variant={pagination.pageNumber === pageToShow ? "default" : "outline"}
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handlePageChange(pageToShow)}
                            >
                              {pageToShow}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.pageNumber + 1)}
                        disabled={pagination.pageNumber === totalPages}
                      >
                        {isRTL ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Entry Modal */}
        <CreateJournalEntryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
          accounts={accounts}
        />

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <JournalEntryDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedEntry(null);
            }}
            entry={selectedEntry}
          />
        )}
      </div>
    </div>
  );
};

// Create Journal Entry Modal
interface CreateJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: AccountDto[];
}

const CreateJournalEntryModal: React.FC<CreateJournalEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
}) => {
  const { isRTL } = useLanguage();
  const createEntryMutation = useCreateJournalEntry();
  const [formData, setFormData] = useState<JournalEntryCreateDto>({
    date: new Date().toISOString().split("T")[0],
    description: "",
    lines: [
      { accountId: "", debit: 0, credit: 0 },
      { accountId: "", debit: 0, credit: 0 },
    ],
  });
  const [attachment, setAttachment] = useState<File | null>(null);

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        { accountId: "", debit: 0, credit: 0 },
      ],
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 2) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index),
      });
    }
  };

  const updateLine = (
    index: number,
    field: keyof JournalEntryLineCreateDto,
    value: any
  ) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // Ensure only one of debit or credit is set
    if (field === "debit" && value > 0) {
      newLines[index].credit = 0;
    } else if (field === "credit" && value > 0) {
      newLines[index].debit = 0;
    }
    
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce(
      (sum, line) => sum + (line.debit || 0),
      0
    );
    const totalCredit = formData.lines.reduce(
      (sum, line) => sum + (line.credit || 0),
      0
    );
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBalanced) {
      toast.error(
        isRTL
          ? "القيد غير متوازن. يجب أن يكون إجمالي المدين يساوي إجمالي الدائن"
          : "Entry is not balanced. Total debit must equal total credit"
      );
      return;
    }

    // Validate all lines have accounts and amounts
    const invalidLines = formData.lines.some(
      (line) =>
        !line.accountId ||
        (line.debit === 0 && line.credit === 0) ||
        (line.debit > 0 && line.credit > 0)
    );

    if (invalidLines) {
      toast.error(
        isRTL
          ? "يرجى التحقق من جميع البنود"
          : "Please check all line items"
      );
      return;
    }

    try {
      const result = await createEntryMutation.mutateAsync({
        ...formData,
        attachment: attachment || undefined
      });
      if (result.success) {
        onSuccess();
        setFormData({
          date: new Date().toISOString().split("T")[0],
          description: "",
          lines: [
            { accountId: "", debit: 0, credit: 0 },
            { accountId: "", debit: 0, credit: 0 },
          ],
        });
        setAttachment(null);
      }
    } catch (error: any) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "إضافة قيد يومية" : "Create Journal Entry"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {isRTL ? "التاريخ" : "Date"} *
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>
                {isRTL ? "الوصف" : "Description"}
              </Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>
                {isRTL ? "بنود القيد" : "Entry Lines"} *
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLine}
              >
                <Plus className="w-4 h-4 mr-1" />
                {isRTL ? "إضافة بند" : "Add Line"}
              </Button>
            </div>
            <div className="space-y-2 border rounded-lg p-4">
              {formData.lines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-4">
                    <Label className="text-xs">
                      {isRTL ? "الحساب" : "Account"}
                    </Label>
                    <Select
                      value={line.accountId}
                      onValueChange={(value) =>
                        updateLine(index, "accountId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountCode} - {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">
                      {isRTL ? "مدين" : "Debit"}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.debit || 0}
                      onChange={(e) =>
                        updateLine(
                          index,
                          "debit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="col-span-3">
                    <Label className="text-xs">
                      {isRTL ? "دائن" : "Credit"}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={line.credit || 0}
                      onChange={(e) =>
                        updateLine(
                          index,
                          "credit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    {formData.lines.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLine(index)}
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
             <Label>{isRTL ? "المرفقات" : "Attachment"}</Label>
             <div className="flex items-center gap-2 mt-1">
               <Input
                 type="file"
                 onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                 className="flex-1"
               />
               {attachment && (
                 <Button 
                   type="button" 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => setAttachment(null)}
                   className="text-red-500"
                 >
                   <RotateCcw className="w-4 h-4" />
                 </Button>
               )}
             </div>
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <span className="text-sm font-semibold">
                {isRTL ? "إجمالي المدين:" : "Total Debit:"}{" "}
                {formatCurrency(totalDebit)}
              </span>
              <span className="mx-4">|</span>
              <span className="text-sm font-semibold">
                {isRTL ? "إجمالي الدائن:" : "Total Credit:"}{" "}
                {formatCurrency(totalCredit)}
              </span>
            </div>
            <Badge
              className={
                isBalanced
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }
            >
              {isBalanced
                ? isRTL
                  ? "متوازن"
                  : "Balanced"
                : isRTL
                ? "غير متوازن"
                : "Not Balanced"}
            </Badge>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={createEntryMutation.isPending || !isBalanced}
            >
              {createEntryMutation.isPending ? (
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

// Journal Entry Detail Modal
interface JournalEntryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: JournalEntryDto;
}

const JournalEntryDetailModal: React.FC<JournalEntryDetailModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  const { isRTL } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isRTL ? "تفاصيل القيد" : "Journal Entry Details"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-500">
                {isRTL ? "رقم القيد" : "Entry Number"}
              </Label>
              <p className="font-mono font-semibold">{entry.entryNumber}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">
                {isRTL ? "التاريخ" : "Date"}
              </Label>
              <p>{formatDate(new Date(entry.date))}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">
                {isRTL ? "النوع" : "Type"}
              </Label>
              <p>{entry.referenceTypeName}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">
                {isRTL ? "الحالة" : "Status"}
              </Label>
              <Badge
                className={
                  entry.isPosted
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {entry.isPosted
                  ? isRTL
                    ? "مرحل"
                    : "Posted"
                  : isRTL
                  ? "غير مرحل"
                  : "Unposted"}
              </Badge>
            </div>
            {entry.attachmentUrl && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {isRTL ? "المرفق" : "Attachment"}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${entry.attachmentUrl}`, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isRTL ? "عرض" : "View"}
                  </Button>
                </div>
              </div>
            )}
            {entry.description && (
              <div className="col-span-2">
                <Label className="text-sm text-gray-500">
                  {isRTL ? "الوصف" : "Description"}
                </Label>
                <p>{entry.description}</p>
              </div>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">
              {isRTL ? "بنود القيد" : "Entry Lines"}
            </Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "الحساب" : "Account"}</TableHead>
                  <TableHead className="text-right">
                    {isRTL ? "مدين" : "Debit"}
                  </TableHead>
                  <TableHead className="text-right">
                    {isRTL ? "دائن" : "Credit"}
                  </TableHead>
                  <TableHead>{isRTL ? "الوصف" : "Description"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entry.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>
                      <div>
                        <div className="font-mono text-sm">
                          {line.accountCode}
                        </div>
                        <div className="text-sm text-gray-500">
                          {line.accountName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.debit > 0 ? formatCurrency(line.debit) : "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.credit > 0 ? formatCurrency(line.credit) : "-"}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {line.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold">
                  <TableCell>
                    {isRTL ? "الإجمالي" : "Total"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(entry.totalDebit)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(entry.totalCredit)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isRTL ? "إغلاق" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JournalEntries;

