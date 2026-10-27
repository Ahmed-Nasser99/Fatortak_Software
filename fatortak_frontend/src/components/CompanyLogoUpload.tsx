import React, { useRef, useState } from "react";
import { Upload, X, Camera } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useUploadCompanyLogo,
  useRemoveCompanyLogo,
} from "../hooks/useCompanies";
import { toast } from "react-toastify";

interface CompanyLogoUploadProps {
  companyId: string;
  currentLogo?: string;
  onLogoUpdate?: (logoUrl: string) => void;
  className?: string;
}

const CompanyLogoUpload: React.FC<CompanyLogoUploadProps> = ({
  companyId,
  currentLogo,
  onLogoUpdate,
  className = "",
}) => {
  const { isRTL, t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogo || null
  );

  const uploadLogoMutation = useUploadCompanyLogo();
  const removeLogoMutation = useRemoveCompanyLogo();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(
        isRTL ? "يرجى اختيار ملف صورة" : "Please select an image file"
      );
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        isRTL
          ? "حجم الملف كبير جداً (الحد الأقصى 5 ميجابايت)"
          : "File size too large (max 5MB)"
      );
      return;
    }

    uploadLogoMutation.mutate(
      {
        companyId,
        file,
      },
      {
        onSuccess: (result) => {
          if (result.success && result.data?.logoUrl) {
            setPreviewUrl(result.data.logoUrl);
            onLogoUpdate?.(result.data.logoUrl);
            toast.success(
              isRTL ? "تم رفع الشعار بنجاح" : "Logo uploaded successfully"
            );
          }
        },
        onError: (error) => {
          toast.error(isRTL ? "فشل في رفع الشعار" : "Failed to upload logo");
        },
      }
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = async () => {
    removeLogoMutation.mutate(companyId, {
      onSuccess: () => {
        setPreviewUrl(null);
        onLogoUpdate?.("");
        toast.success(
          isRTL ? "تم حذف الشعار بنجاح" : "Logo removed successfully"
        );
      },
      onError: (error) => {
        toast.error(isRTL ? "فشل في حذف الشعار" : "Failed to remove logo");
      },
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`} dir={isRTL ? "rtl" : "ltr"}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("companyLogo") || (isRTL ? "شعار الشركة" : "Company Logo")}
      </label>

      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Logo Preview */}
        <div className="relative">
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Company Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Remove Button */}
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              disabled={removeLogoMutation.isPending}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <button
            type="button"
            onClick={handleUploadClick}
            disabled={uploadLogoMutation.isPending}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            <Upload className="w-4 h-4" />
            <span>
              {uploadLogoMutation.isPending
                ? isRTL
                  ? "جاري الرفع..."
                  : "Uploading..."
                : isRTL
                ? "رفع شعار"
                : "Upload Logo"}
            </span>
          </button>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {isRTL ? "PNG, JPG, GIF حتى 5 ميجابايت" : "PNG, JPG, GIF up to 5MB"}
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default CompanyLogoUpload;
