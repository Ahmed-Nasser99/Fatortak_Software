import React, { useState } from "react";
import { X, User, Mail, Phone, MapPin, Camera } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useUpdateUser } from "../hooks/useUsers";
import { UserDto, UserUpdateDto } from "../types/api";
import { toast } from "react-toastify";

interface UserEditModalProps {
  user: UserDto;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, isRTL } = useLanguage();
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState<UserUpdateDto>({
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phoneNumber: user.phoneNumber || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await updateUserMutation.mutateAsync({
        id: user.id,
        data: formData,
      });

      if (result.success) {
        toast.success(t("userUpdatedSuccessfully"));
        onSuccess();
        onClose();
      } else {
        toast.error(result.errorMessage || t("failedToUpdateUser"));
      }
    } catch (error) {
      toast.error(t("failedToUpdateUser"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-border ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-foreground">{t("editUser")}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture Placeholder */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium text-foreground mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("firstName")} *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className={`w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder={t("enterFirstName")}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium text-foreground mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("lastName")} *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className={`w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
                  isRTL ? "text-right" : "text-left"
                }`}
                placeholder={t("enterLastName")}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label
              className={`block text-sm font-medium text-foreground mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("phoneNumber")}
            </label>
            <div className="relative">
              <Phone
                className={`absolute top-1/2 transform -translate-y-1/2 ${
                  isRTL ? "right-4" : "left-4"
                } w-5 h-5 text-muted-foreground`}
              />
              <input
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className={`w-full py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
                  isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4 text-left"
                }`}
                placeholder={t("enterPhoneNumber")}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label
              className={`block text-sm font-medium text-foreground mb-2 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {t("role")} *
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
              className={`w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <option value="Admin">{t("admin")}</option>
              <option value="Editor">{isRTL ? "محرر" : "Editor"}</option>
              <option value="Watcher">{isRTL ? "مراقب" : "Watcher"}</option>
            </select>
          </div>

          {/* Buttons */}
          <div
            className={`flex justify-end space-x-4 pt-6 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-input text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={updateUserMutation.isPending}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateUserMutation.isPending ? t("saving") : t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
