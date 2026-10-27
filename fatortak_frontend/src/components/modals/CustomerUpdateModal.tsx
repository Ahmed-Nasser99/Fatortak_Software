import React, { useState, useEffect } from "react";
import { X, User, Phone, Mail, MapPin, Building, Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { toast } from "react-toastify";
import { useUpdateCustomer } from "@/hooks/useCustomers";

export interface CustomerUpdateModalProps {
  customer: any;
  onSave: () => void;
  onClose: () => void;
  isSupplier?: boolean;
}

const CustomerUpdateModal: React.FC<CustomerUpdateModalProps> = ({
  customer,
  onSave,
  onClose,
  isSupplier = false,
}) => {
  const { isRTL, t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });
  const updateCustomerMutation = useUpdateCustomer();

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        company: customer.company || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(
        isRTL ? "يرجى إدخال اسم العميل" : "Please enter customer name"
      );
      return;
    }

    try {
      const result = await updateCustomerMutation.mutateAsync({
        id: customer.id,
        data: formData,
      });

      if (result.success) {
        toast.success(
          isRTL
            ? "تم تحديث العميل بنجاح"
            : "Customer updated successfully"
        );
        onSave();
      }
    } catch (error) {
      toast.error(
        isRTL ? "فشل في تحديث العميل" : "Failed to update customer"
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const modalTitle = isSupplier
    ? isRTL
      ? "تحديث المورد"
      : "Update Supplier"
    : isRTL
    ? "تحديث العميل"
    : "Update Customer";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            className={`absolute top-4 ${
              isRTL ? "left-4" : "right-4"
            } text-white/80 hover:text-white transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className={isRTL ? "text-right" : ""}>
              <h2 className="text-2xl font-bold text-white">{modalTitle}</h2>
              <p className="text-white/80">
                {isRTL ? "تحديث معلومات العميل" : "Update customer information"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {isRTL ? "الاسم" : "Name"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white ${
                  isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                }`}
                placeholder={isRTL ? "أدخل الاسم" : "Enter name"}
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {isRTL ? "البريد الإلكتروني" : "Email"}
            </label>
            <div className="relative">
              <Mail
                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white ${
                  isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                }`}
                placeholder={
                  isRTL ? "أدخل البريد الإلكتروني" : "Enter email address"
                }
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {isRTL ? "رقم الهاتف" : "Phone Number"}
            </label>
            <div className="relative">
              <Phone
                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white ${
                  isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                }`}
                placeholder={isRTL ? "أدخل رقم الهاتف" : "Enter phone number"}
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <label
              className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {isRTL ? "العنوان" : "Address"}
            </label>
            <div className="relative">
              <MapPin
                className={`absolute top-3 w-5 h-5 text-slate-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              />
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                rows={3}
                className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white resize-none ${
                  isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                } pt-3`}
                placeholder={
                  isRTL ? "أدخل العنوان الكامل" : "Enter full address"
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isRTL ? "حفظ التغييرات" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerUpdateModal;
