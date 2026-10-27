import React, { useState } from "react";
import { X, User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateUser } from "../../hooks/useUsers";
import { UserCreateDto } from "../../types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t, isRTL } = useLanguage();
  const createUserMutation = useCreateUser();

  const [formData, setFormData] = useState<UserCreateDto>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "Watcher",
    phoneNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("invalidEmail");
    }

    if (!formData.firstName) {
      newErrors.firstName = t("firstNameRequired");
    }

    if (!formData.lastName) {
      newErrors.lastName = t("lastNameRequired");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("passwordLength");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const result = await createUserMutation.mutateAsync(formData);

      if (result.success) {
        toast.success(t("userCreatedSuccessfully"));
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.errorMessage || t("failedToCreateUser"));
      }
    } catch (error) {
      toast.error(t("errorCreatingUser"));
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "Watcher",
      phoneNumber: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md ${isRTL ? "rtl" : ""}`}>
        <DialogHeader>
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("addNewTeamMember")}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              {t("firstName")} *
            </Label>
            <div className="relative">
              <User
                className={`absolute top-3 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-slate-400`}
              />
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className={`${isRTL ? "pr-10 text-right" : "pl-10"} ${
                  errors.firstName ? "border-red-500" : ""
                }`}
                placeholder={t("enterFirstName")}
                disabled={createUserMutation.isPending}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              {t("lastName")} *
            </Label>
            <div className="relative">
              <User
                className={`absolute top-3 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-slate-400`}
              />
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`${isRTL ? "pr-10 text-right" : "pl-10"} ${
                  errors.lastName ? "border-red-500" : ""
                }`}
                placeholder={t("enterLastName")}
                disabled={createUserMutation.isPending}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t("email")} *
            </Label>
            <div className="relative">
              <Mail
                className={`absolute top-3 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-slate-400`}
              />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`${isRTL ? "pr-10 text-right" : "pl-10"} ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder={t("enterEmail")}
                disabled={createUserMutation.isPending}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t("password")} *
            </Label>
            <div className="relative">
              <Lock
                className={`absolute top-3 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-slate-400`}
              />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`${isRTL ? "pr-10 text-right" : "pl-10"} ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder={t("enterPassword")}
                disabled={createUserMutation.isPending}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              {t("phoneNumber")}
            </Label>
            <div className="relative">
              <Phone
                className={`absolute top-3 ${
                  isRTL ? "right-3" : "left-3"
                } w-4 h-4 text-slate-400`}
              />
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className={`${isRTL ? "pr-10 text-right" : "pl-10"}`}
                placeholder={t("enterPhoneNumber")}
                disabled={createUserMutation.isPending}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              {t("role")} *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={createUserMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">{t("role.admin")}</SelectItem>
                <SelectItem value="Editor">{t("role.editor")}</SelectItem>
                <SelectItem value="Watcher">{t("role.watcher")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className={`flex gap-3 pt-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createUserMutation.isPending}
              className="flex-1"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className={`flex-1 flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {createUserMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {createUserMutation.isPending ? t("creating") : t("createUser")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberModal;
