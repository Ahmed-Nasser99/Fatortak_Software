import React, { useState, useEffect } from "react";
import { Building, Save, Mail, Phone, DollarSign, MapPin, ChevronDown, Upload, Sparkles } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  useUpdateCompany,
  useCurrentCompany,
  useUploadCompanyLogo,
  useRemoveCompanyLogo,
} from "../../hooks/useCompanies";
import { toast } from "react-toastify";
import { CompanyUpdateDto } from "../../types/api";
import ImageUpload from "../ui/image-upload";

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  vatNumber: string;
  currency: string;
  defaultVatRate: number;
  invoicePrefix: string;
  logoUrl?: string;
  enableMultipleBranches: boolean;
}

const CompanySettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    vatNumber: "",
    currency: "USD",
    defaultVatRate: 0,
    invoicePrefix: "INV",
    logoUrl: "",
    enableMultipleBranches: false,
  });

  const { isRTL, t } = useLanguage();
  const { tenant } = useAuth();
  const { data: currentCompany } = useCurrentCompany();
  const updateCompanyMutation = useUpdateCompany();
  const uploadLogoMutation = useUploadCompanyLogo();
  const removeCompanyLogo = useRemoveCompanyLogo();

  useEffect(() => {
    if (currentCompany?.success && currentCompany.data) {
      const company = currentCompany.data;
      setCompanySettings({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        taxNumber: company.taxNumber || "",
        vatNumber: company.vatNumber || "",
        currency: company.currency || "USD",
        defaultVatRate: company.defaultVatRate || 0,
        invoicePrefix: company.invoicePrefix || "INV",
        logoUrl: company.logoUrl || "",
        enableMultipleBranches: company.enableMultipleBranches || false,
      });
    }
  }, [currentCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany?.data?.id) return;

    setLoading(true);

    try {
      const companyData: CompanyUpdateDto = {
        name: companySettings.name,
        email: companySettings.email,
        phone: companySettings.phone,
        address: companySettings.address,
        taxNumber: companySettings.taxNumber,
        vatNumber: companySettings.vatNumber,
        currency: companySettings.currency,
        defaultVatRate: companySettings.defaultVatRate,
        invoicePrefix: companySettings.invoicePrefix,
        enableMultipleBranches: companySettings.enableMultipleBranches,
      };

      await updateCompanyMutation.mutateAsync({
        id: currentCompany?.data?.id,
        data: companyData,
      });

      toast.success(t("companySettingsUpdated"));
    } catch (error) {
      toast.error(t("failedToSaveSettings"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoSelect = async (file: File) => {
    if (!currentCompany?.data?.id) return;

    try {
      const result = await uploadLogoMutation.mutateAsync({
        companyId: currentCompany.data.id,
        file: file,
      });

      if (result.success) {
        setCompanySettings((prev) => ({
          ...prev,
          logoUrl: result.data.logoUrl || URL.createObjectURL(file),
        }));
        toast.success(t("logoUploadedSuccessfully"));
      }
    } catch (error) {
      toast.error(t("logoUploadFailed"));
    }
  };

  const handleLogoRemove = async () => {
    if (!currentCompany?.data?.id) return;

    try {
      const result = await removeCompanyLogo.mutateAsync(
        currentCompany.data.id
      );

      if (result.success) {
        setCompanySettings((prev) => ({
          ...prev,
          logoUrl: "",
        }));
        toast.success(t("logoRemovedSuccessfully"));
      }
    } catch (error) {
      toast.error(t("logoRemoveFailed"));
    }
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
      {/* Company Logo Section */}
      <SectionCard>
        <SectionHeader title={t("companyLogo")} color="from-blue-500 to-blue-600" />
        <ImageUpload
          onImageSelect={handleLogoSelect}
          onImageRemove={handleLogoRemove}
          preview={companySettings.logoUrl}
          disabled={uploadLogoMutation.isPending}
        />
        {uploadLogoMutation.isPending && (
          <div className="flex items-center gap-2 mt-4 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span className="text-sm font-medium">{t("uploadingLogo")}</span>
          </div>
        )}
      </SectionCard>

      {/* Company Information */}
      <SectionCard>
        <SectionHeader title={t("companyInformation")} color="from-violet-500 to-violet-600" />
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label={t("companyName")} required>
              <input
                type="text"
                value={companySettings.name}
                onChange={(e) => setCompanySettings((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="Enter company name"
                required
                dir={isRTL ? "rtl" : "ltr"}
              />
            </InputField>

            <InputField label={t("email")}>
              <input
                type="email"
                value={companySettings.email}
                onChange={(e) => setCompanySettings((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="company@example.com"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </InputField>

            <InputField label={t("phoneNumber")}>
              <input
                type="tel"
                value={companySettings.phone}
                onChange={(e) => setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="+1 (555) 000-0000"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </InputField>

            <InputField label={t("currency")}>
              <div className="relative">
                <select
                  value={companySettings.currency}
                  onChange={(e) => setCompanySettings((prev) => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none font-medium"
                >
                  <option value="USD">USD - {t("usDollar")}</option>
                  <option value="EUR">EUR - {t("euro")}</option>
                  <option value="SAR">SAR - {t("saudiRiyal")}</option>
                  <option value="AED">AED - {t("uaeDirham")}</option>
                  <option value="EGP">EGP - {t("egyptianPound")}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </InputField>
          </div>

          <div className="mt-5">
            <InputField label={t("address")}>
              <textarea
                value={companySettings.address}
                onChange={(e) => setCompanySettings((prev) => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none font-medium"
                placeholder="Enter complete address"
                dir={isRTL ? "rtl" : "ltr"}
              />
            </InputField>
          </div>
        </form>
      </SectionCard>

      {/* Tax & Business Information */}
      <SectionCard>
        <SectionHeader title={t("taxBusinessInfo")} color="from-emerald-500 to-emerald-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField label={t("taxNumber")}>
            <input
              type="text"
              value={companySettings.taxNumber}
              onChange={(e) => setCompanySettings((prev) => ({ ...prev, taxNumber: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </InputField>

          <InputField label={t("vatNumber")}>
            <input
              type="text"
              value={companySettings.vatNumber}
              onChange={(e) => setCompanySettings((prev) => ({ ...prev, vatNumber: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </InputField>

          <InputField label={`${t("defaultVatRate")} (%)`}>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={companySettings.defaultVatRate}
              onChange={(e) => setCompanySettings((prev) => ({ ...prev, defaultVatRate: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            />
          </InputField>

          <InputField label={t("invoicePrefix")}>
            <input
              type="text"
              value={companySettings.invoicePrefix}
              onChange={(e) => setCompanySettings((prev) => ({ ...prev, invoicePrefix: e.target.value }))}
              className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </InputField>
        </div>
      </SectionCard>

      {/* Feature Switches */}
      <SectionCard>
        <SectionHeader title={isRTL ? "المميزات الإضافية" : "Additional Features"} color="from-orange-500 to-orange-600" />
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
          <div className="space-y-0.5">
            <h4 className="font-bold text-foreground">
              {isRTL ? "دعم الفروع المتعددة" : "Multi-Branch Support"}
            </h4>
            <p className="text-sm text-muted-foreground font-medium">
              {isRTL 
                ? "تمكين إدارة مواقع عمل متعددة وفروع لشركتك" 
                : "Enable managing multiple business locations and branches for your company"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={companySettings.enableMultipleBranches}
              onChange={(e) => setCompanySettings((prev) => ({ ...prev, enableMultipleBranches: e.target.checked }))}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
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

export default CompanySettingsForm;
