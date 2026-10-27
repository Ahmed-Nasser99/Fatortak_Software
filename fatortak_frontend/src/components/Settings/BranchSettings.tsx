import React, { useState } from "react";
import { Plus, MapPin, Phone, Star, Trash2, Edit2, CheckCircle2, XCircle, Building2, Store } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch, useToggleBranchActivation } from "../../hooks/useBranches";
import { toast } from "react-toastify";

const BranchSettings: React.FC = () => {
  const { data: branchesResult, isLoading } = useBranches();
  const { isRTL, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  
  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();
  const toggleActivationMutation = useToggleBranchActivation();

  const branches = branchesResult?.data || [];

  const handleOpenModal = (branch: any = null) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBranch(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      address: formData.get("address") as string,
      phone: formData.get("phone") as string,
      isMain: formData.get("isMain") === "on",
    };

    try {
      if (editingBranch) {
        await updateBranchMutation.mutateAsync({ id: editingBranch.id, data });
        toast.success(isRTL ? "تم تحديث الفرع بنجاح" : "Branch updated successfully");
      } else {
        await createBranchMutation.mutateAsync(data);
        toast.success(isRTL ? "تم إضافة الفرع بنجاح" : "Branch added successfully");
      }
      handleCloseModal();
    } catch (error) {
      toast.error(isRTL ? "فشل حفظ الفرع" : "Failed to save branch");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(isRTL ? "هل أنت متأكد من حذف هذا الفرع؟" : "Are you sure you want to delete this branch?")) {
      try {
        await deleteBranchMutation.mutateAsync(id);
        toast.success(isRTL ? "تم حذف الفرع بنجاح" : "Branch deleted successfully");
      } catch (error: any) {
        toast.error(error.response?.data || (isRTL ? "فشل حذف الفرع" : "Failed to delete branch"));
      }
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleActivationMutation.mutateAsync(id);
    } catch (error) {
      toast.error(isRTL ? "فشل تغيير حالة الفرع" : "Failed to toggle branch status");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse border border-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRTL ? "إدارة الفروع" : "Branch Management"}
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {isRTL ? "إضافة وتعديل فروع الشركة ومواقع عملك" : "Add and manage your company branches and work locations"}
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25"
        >
          <Plus className="w-5 h-5" />
          <span>{isRTL ? "إضافة فرع جديد" : "Add New Branch"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map((branch: any) => (
          <div
            key={branch.id}
            className={`relative group bg-gradient-to-br from-background to-muted/20 rounded-3xl p-7 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              branch.isMain ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border'
            }`}
          >
            {branch.isMain && (
              <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/30">
                {isRTL ? "الفرع الرئيسي" : "Main Branch"}
              </div>
            )}

            <div className="flex-1 min-w-0 pr-12">
              <h3 className="text-xl font-bold text-foreground truncate mb-2 group-hover:text-primary transition-colors">
                {branch.name}
              </h3>
              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground font-medium truncate">
                  {branch.address || (isRTL ? "لا يوجد عنوان" : "No address")}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {branch.phone || (isRTL ? "لا يوجد رقم هاتف" : "No phone")}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-5 border-t border-border/50">
              <button
                onClick={() => handleToggle(branch.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  branch.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {branch.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenModal(branch)}
                  className="p-2.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-all"
                  title={t("edit")}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!branch.isMain && (
                  <button
                    onClick={() => handleDelete(branch.id)}
                    className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                    title={t("delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-full py-20 px-6 bg-gradient-to-br from-muted/20 to-transparent rounded-[2.5rem] border-2 border-dashed border-muted flex flex-col items-center justify-center text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {isRTL ? "لا توجد فروع مضافة" : "No branches found"}
            </h3>
            <p className="text-muted-foreground mb-8 max-w-sm font-medium">
              {isRTL ? "ابدأ بإضافة فرعك الأول لتتمكن من تتبع أعمالك في مواقع مختلفة وتوسيع نطاق نشاطك." : "Start by adding your first branch to track your business in different locations and scale your operations."}
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all text-sm"
            >
              <Plus className="w-6 h-6" />
              <span>{isRTL ? "إضافة أول فرع للشركة" : "Add Your First Branch"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {editingBranch ? (isRTL ? "تعديل بيانات الفرع" : "Edit Branch Details") : (isRTL ? "إضافة فرع جديد" : "Add New Branch")}
                </h3>
                <p className="text-muted-foreground text-xs font-medium">
                  {isRTL ? "الرجاء تعبئة المعلومات المطلوبة أدناه" : "Please fill in the required information below"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1">
                    {isRTL ? "اسم الفرع" : "Branch Name"}
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    name="name"
                    defaultValue={editingBranch?.name}
                    required
                    className="w-full px-4 py-3 bg-muted/30 border border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all font-medium"
                    placeholder={isRTL ? "مثال: فرع القاهرة" : "e.g. Cairo Branch"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    {isRTL ? "العنوان" : "Address"}
                  </label>
                  <input
                    name="address"
                    defaultValue={editingBranch?.address}
                    className="w-full px-4 py-3 bg-muted/30 border border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all font-medium"
                    placeholder={isRTL ? "مثال: شارع النيل، المعادي" : "e.g. Nile St, Maadi"}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">
                    {isRTL ? "رقم الهاتف" : "Phone Number"}
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingBranch?.phone}
                    className="w-full px-4 py-3 bg-muted/30 border border-muted focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all font-medium"
                    placeholder="+20 123 456 789"
                  />
                </div>

                <label className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  editingBranch?.isMain ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/30 border-muted hover:border-primary/20'
                }`}>
                  <input
                    type="checkbox"
                    id="isMain"
                    name="isMain"
                    defaultChecked={editingBranch?.isMain}
                    disabled={editingBranch?.isMain}
                    className="w-5 h-5 rounded-lg border-muted text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold">
                      {isRTL ? "تعيين كفرع رئيسي" : "Set as Main Branch"}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {isRTL ? "سيتم عرض هذا الفرع كفرع أساسي للشركة في المعاملات" : "This branch will be displayed as the primary company location"}
                    </p>
                  </div>
                </label>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-4 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-2xl transition-all"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                    className="flex-1 px-6 py-4 bg-primary text-primary-foreground font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                  >
                    {createBranchMutation.isPending || updateBranchMutation.isPending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mx-auto" />
                    ) : (
                      editingBranch ? (isRTL ? "تحديث" : "Update") : (isRTL ? "إضافة" : "Add")
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchSettings;
