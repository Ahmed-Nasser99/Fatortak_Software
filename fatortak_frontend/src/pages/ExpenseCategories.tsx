import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tag,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from "../hooks/useExpenseCategories";
import { useAccounts } from "../hooks/useAccounting";
import {
  ExpenseCategoryDto,
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  AccountType,
} from "../types/api";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import AccountSelector from "../components/ui/AccountSelector";

const ExpenseCategories: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryDto | null>(
    null
  );

  const { data: categoriesResponse, isLoading, refetch } = useExpenseCategories();
  const deleteCategoryMutation = useDeleteExpenseCategory();

  const categories = categoriesResponse?.data || [];

  const filteredCategories = categories.filter((c: ExpenseCategoryDto) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: ExpenseCategoryDto) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(isRTL ? "هل أنت متأكد من حذف هذا التصنيف؟" : "Are you sure you want to delete this category?")) {
      await deleteCategoryMutation.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isRTL ? "تصنيفات المصاريف" : "Expense Categories"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {isRTL ? "إدارة تصنيفات المصاريف وربطها بالحسابات المالية" : "Manage expense categories and link them to financial accounts."}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? "إضافة تصنيف" : "Add Category"}
          </Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                placeholder={isRTL ? "بحث في التصنيفات..." : "Search categories..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">{category.accountCode}</span>
                        <span>{category.accountName}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredCategories.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                {isRTL ? "لا توجد تصنيفات حالياً" : "No categories found."}
              </div>
            )}
          </div>
        )}

        <CategoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />

        {selectedCategory && (
          <CategoryModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
            }}
            category={selectedCategory}
            onSuccess={() => {
              setIsEditModalOpen(false);
              setSelectedCategory(null);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: ExpenseCategoryDto;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  category,
}) => {
  const { t, isRTL } = useLanguage();
  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();

  const [formData, setFormData] = useState({
    name: category?.name || "",
    accountId: category?.accountId || "",
  });

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        accountId: category.accountId,
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      toast.error(isRTL ? "يرجى اختيار الحساب المرتبط" : "Please select the associated account");
      return;
    }

    if (category) {
      await updateMutation.mutateAsync({ id: category.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData as CreateExpenseCategoryDto);
    }
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? (isRTL ? "تعديل تصنيف" : "Edit Category") : (isRTL ? "إضافة تصنيف جديد" : "Add New Category")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{isRTL ? "اسم التصنيف" : "Category Name"}</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{isRTL ? "الحساب المرتبط (مصاريف)" : "Linked Account (Expense)"}</Label>
            <AccountSelector
              value={formData.accountId}
              onChange={(val) => setFormData({ ...formData, accountId: val })}
              accountType={AccountType.Expense}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isRTL ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseCategories;
