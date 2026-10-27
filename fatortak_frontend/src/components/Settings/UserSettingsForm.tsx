import React, { useState, useEffect } from "react";
import { User, Save, Mail, Phone, UserCircle, Upload } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  useCurrentUserProfile,
  useRemoveProfilePicture,
} from "../../hooks/useUserProfile";
import {
  useUpdateUserSettings,
  useUploadUserProfilePicture,
} from "../../hooks/useUserSettings";
import { UserProfileUpdateDto } from "../../types/api";
import ImageUpload from "../ui/image-upload";
import { toast } from "react-toastify";

interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl?: string;
}

const UserSettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    profilePictureUrl: "",
  });

  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const { data: userProfile } = useCurrentUserProfile();
  const updateUserMutation = useUpdateUserSettings();
  const uploadPictureMutation = useUploadUserProfilePicture();
  const removePictureMutation = useRemoveProfilePicture();

  useEffect(() => {
    if (user) {
      setUserSettings((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }

    if (userProfile?.success && userProfile.data) {
      const profile = userProfile.data;
      setUserSettings((prev) => ({
        ...prev,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        profilePictureUrl: profile.profilePictureUrl || "",
      }));
    }
  }, [user, userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData: UserProfileUpdateDto = {
        firstName: userSettings.firstName,
        lastName: userSettings.lastName,
        email: userSettings.email,
        phoneNumber: userSettings.phoneNumber,
      };

      await updateUserMutation.mutateAsync(userData);
      toast.success(t("userSettingsUpdated"));
    } catch (error) {
      toast.error(t("userSettingsSaveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    try {
      await uploadPictureMutation.mutateAsync(file);
      setUserSettings((prev) => ({
        ...prev,
        profilePictureUrl: URL.createObjectURL(file),
      }));
      toast.success(t("profilePictureUploadSuccess"));
    } catch (error) {
      toast.error(t("profilePictureUploadFailed"));
    }
  };
  
  const handleRemoveProfilePicture = async () => {
    try {
      const result = await removePictureMutation.mutateAsync();
      if (result.success) {
        toast.success(t("profilePictureRemovedSuccess"));
        setUserSettings((prev) => ({
          ...prev,
          profilePictureUrl: "",
        }));
      } else {
        toast.error(t("failedToRemovePicture"));
      }
    } catch (error) {
      toast.error(t("failedToRemovePicture"));
    }
  };

  const handleImageRemove = async () => {
    await handleRemoveProfilePicture();
  };

  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-gradient-to-br from-background to-muted/30 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300 p-6 ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, color }: { title: string; color: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${color} shadow-sm`} />
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
  );

  const InputField = ({ 
    label, 
    required, 
    children 
  }: { 
    label: string; 
    required?: boolean; 
    children: React.ReactNode 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <SectionCard>
        <SectionHeader title={t("profilePicture")} color="from-violet-500 to-violet-600" />
        <ImageUpload
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          preview={userSettings.profilePictureUrl}
          disabled={uploadPictureMutation.isPending}
        />
        {uploadPictureMutation.isPending && (
          <div className="flex items-center gap-2 mt-4 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm font-medium">{t("uploadingLogo")}</span>
          </div>
        )}
      </SectionCard>

      {/* Personal Information */}
      <SectionCard>
        <SectionHeader title={t("personalInformation")} color="from-blue-500 to-blue-600" />
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label={t("firstName")} required>
              <input
                type="text"
                value={userSettings.firstName}
                onChange={(e) =>
                  setUserSettings((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                dir={isRTL ? "rtl" : "ltr"}
                required
              />
            </InputField>

            <InputField label={t("lastName")} required>
              <input
                type="text"
                value={userSettings.lastName}
                onChange={(e) =>
                  setUserSettings((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                dir={isRTL ? "rtl" : "ltr"}
                required
              />
            </InputField>
          </div>
        </form>
      </SectionCard>

      {/* Contact Information */}
      <SectionCard>
        <SectionHeader title={t("contactInformation")} color="from-emerald-500 to-emerald-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label={t("email")} required>
            <input
              type="email"
              value={userSettings.email}
              onChange={(e) =>
                setUserSettings((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              dir={isRTL ? "rtl" : "ltr"}
              required
            />
          </InputField>

          <InputField label={t("phoneNumber")}>
            <input
              type="tel"
              value={userSettings.phoneNumber}
              onChange={(e) =>
                setUserSettings((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </InputField>
        </div>
      </SectionCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-50 text-primary-foreground font-bold rounded-2xl transition-all shadow-xl shadow-primary/25"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{t("saveChanges")}</span>
        </button>
      </div>
    </div>
  );
};

export default UserSettingsForm;
