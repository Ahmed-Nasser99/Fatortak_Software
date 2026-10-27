import React, { useState, useEffect, useRef } from "react";
import { X, Save, Image, Trash2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateItem, useUpdateItem } from "../../hooks/useItems";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { ItemDto, ItemCreateDto, ItemUpdateDto } from "../../types/api";
import { toast } from "react-toastify";
import BranchSelector from "../ui/BranchSelector";
import { useMainBranch } from "../../hooks/useBranches";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: ItemDto | null;
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item = null,
}) => {
  const { isRTL, t } = useLanguage();
  const roleAccess = useRoleAccess();
  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem();

  const [formData, setFormData] = useState<ItemCreateDto>({
    code: "",
    name: "",
    type: "product" as "product" | "service",
    purchaseUnitPrice: 0,
    unitPrice: 0,
    vatRate: 0,
    description: "",
    quantity: 0,
    branchId: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: mainBranchResult } = useMainBranch();

  useEffect(() => {
    if (mainBranchResult?.data && !formData.branchId) {
      setFormData(prev => ({ ...prev, branchId: mainBranchResult.data.id }));
    }
  }, [mainBranchResult, isOpen]);

  useEffect(() => {
    if (item) {
      setFormData({
        code: item.code,
        name: item.name,
        type: item.type,
        purchaseUnitPrice: item.purchaseUnitPrice,
        unitPrice: item.unitPrice,
        vatRate: item.vatRate, // Convert to percentage
        description: item.description || "",
        quantity: item.quantity || 0,
        branchId: item.branchId || "",
      });
      if (item.imageUrl) {
        setImagePreview(item.imageUrl);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        code: "",
        name: "",
        type: "product",
        purchaseUnitPrice: 0,
        unitPrice: 0,
        vatRate: 0,
        description: "",
        quantity: 0,
        branchId: mainBranchResult?.data?.id || "",
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setRemoveImage(false);
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(t("pleaseEnterItemName"));
      return;
    }

    // Check permissions
    if (item && !roleAccess.canEdit()) {
      toast.error(
        t("noPermissionToEditItems")
      );
      return;
    }

    if (!item && !roleAccess.canCreate()) {
      toast.error(
        t("noPermissionToCreateItems")
      );
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all form data fields
      formDataToSend.append("code", formData.code);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("unitPrice", formData.unitPrice.toString());
      formDataToSend.append(
        "purchaseUnitPrice",
        formData.purchaseUnitPrice.toString()
      );
      formDataToSend.append("vatRate", formData.vatRate.toString()); // Convert to percentage
      formDataToSend.append("description", formData.description);
      formDataToSend.append("quantity", formData.quantity.toString());
      if (formData.branchId) {
        formDataToSend.append("branchId", formData.branchId);
      }

      // Handle image
      if (imageFile) {
        formDataToSend.append("imageFile", imageFile);
      }
      if (removeImage) {
        formDataToSend.append("removeImage", "true");
      }
      if (item) {
        // Update existing item
        const result = await updateItemMutation.mutateAsync({
          id: item.id,
          data: formDataToSend,
        });

        if (result.success) {
          toast.success(t("itemUpdatedSuccessfully"));
          onSuccess();
        }
      } else {
        // Create new item

        const result = await createItemMutation.mutateAsync(formDataToSend);

        if (result.success) {
          toast.success(t("itemCreatedSuccessfully"));
          onSuccess();
        }
      }
    } catch (error) {
      toast.error(
        error.message == "An item with this name already exists"
          ? t("itemWithThisNameExists")
          : error.message == "An item with this code already exists"
          ? t("itemWithThisCodeExists")
          : item
          ? t("itemUpdateFailed")
          : t("itemCreateFailed")
      );
    }
  };
  const handleInputChange = (
    field: keyof ItemCreateDto,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700`}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {item ? t("editItem") : t("newItem")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("itemImage")}
            </label>

            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Item preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg w-32 h-32 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="itemImage"
                />
                <label
                  htmlFor="itemImage"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <Image className="w-4 h-4 mr-2" />
                  {imagePreview
                    ? isRTL
                      ? "تغيير الصورة"
                      : "Change Image"
                    : isRTL
                    ? "اختر صورة"
                    : "Choose Image"}
                </label>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isRTL
                    ? "JPG, PNG أو GIF (الحد الأقصى 5 ميجابايت)"
                    : "JPG, PNG or GIF (Max 5MB)"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("itemCode")} *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder={t("enterItemCode")}
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("type")} *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  handleInputChange(
                    "type",
                    e.target.value as "product" | "service"
                  )
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <option value="product">{t("product")}</option>
                <option value="service">{t("service")}</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("itemName")} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("enterItemName")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("description")}
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={t("optionalItemDescription")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("purchasePrice")} *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={
                  formData?.purchaseUnitPrice === 0
                    ? ""
                    : formData?.purchaseUnitPrice?.toString()
                }
                onChange={(e) =>
                  handleInputChange(
                    "purchaseUnitPrice",
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  )
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder="0.00"
              />
            </div>
            {/* Sales Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("salesPrice")} *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={
                  formData.unitPrice === 0 ? "" : formData.unitPrice.toString()
                }
                onChange={(e) =>
                  handleInputChange(
                    "unitPrice",
                    e.target.value === "" ? 0 : parseFloat(e.target.value)
                  )
                }
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder="0.00"
              />
            </div>

            {/* Quantity */}
            {formData.type === "product" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("quantity")}
                </label>
                <input
                  type="number"
                  min="0"
                  value={
                    formData.quantity === 0 ? "" : formData.quantity.toString()
                  }
                  onChange={(e) =>
                    handleInputChange(
                      "quantity",
                      e.target.value === "" ? 0 : parseInt(e.target.value)
                    )
                  }
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  placeholder="0"
                />
              </div>
            )}

            {/* VAT Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "معدل ض.ق.م %" : "VAT Rate %"} *
              </label>
              <select
                value={formData.vatRate}
                onChange={(e) => handleInputChange("vatRate", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <option value={0}>0%</option>
                <option value={0.05}>5%</option>
                <option value={0.14}>14%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <BranchSelector
                value={formData.branchId || ""}
                onChange={(value) => handleInputChange("branchId", value)}
                label={t("branch")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div
            className={`flex space-x-3 pt-4 justify-between ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={
                createItemMutation.isPending || updateItemMutation.isPending
              }
              className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {createItemMutation.isPending || updateItemMutation.isPending
                  ? t("saving")
                  : item
                  ? t("update")
                  : t("add")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
