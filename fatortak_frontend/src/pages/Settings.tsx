import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import CompanySettingsForm from "../components/Settings/CompanySettingsForm";
import UserSettingsForm from "../components/Settings/UserSettingsForm";
import QuotaSettingsForm from "../components/Settings/QuotaSettingsForm";
import SettingsTabs from "../components/Settings/SettingsTabs";
import HRSettingsForm from "@/components/Settings/HRSettingsForm";
import { useCurrentCompany } from "../hooks/useCompanies";
import BranchSettings from "@/components/Settings/BranchSettings";
import PageHeader from "@/components/ui/PageHeader";
import { Bell, Shield, Settings2 } from "lucide-react";

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("company");
  const { isRTL, t } = useLanguage();
  const { data: currentCompany } = useCurrentCompany();
  const showBranches =
    currentCompany?.data?.enableMultipleBranches === true ||
    (currentCompany?.data as any)?.EnableMultipleBranches === true;

  const renderTabContent = () => {
    switch (activeTab) {
      case "company":
        return <CompanySettingsForm />;
      case "user":
        return <UserSettingsForm />;
      // case "branches":
      //   return <BranchSettings />;
      // case "hr":
      //   return <HRSettingsForm />;
      // case "quota":
      //   return <QuotaSettingsForm />;
      // case "notifications":
      // case "security":
      //   return (
      //     <div className="flex flex-col items-center justify-center py-20 px-4">
      //       <h3 className="text-2xl font-bold text-foreground mb-3 text-center uppercase tracking-wide">
      //         {activeTab === "notifications"
      //           ? isRTL
      //             ? "إعدادات الإشعارات"
      //             : "Notification Settings"
      //           : isRTL
      //             ? "إعدادات الأمان"
      //             : "Security Settings"}
      //       </h3>
      //       <p className="text-muted-foreground text-center max-w-sm font-bold">
      //         {isRTL
      //           ? "هذه الميزة قيد التطوير وستكون متاحة قريباً."
      //           : "This feature is under development and will be available soon."}
      //       </p>
      //     </div>
      //   );
      default:
        return <CompanySettingsForm />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow={isRTL ? "الإعدادات" : "Settings"}
          title={isRTL ? "إعدادات الحساب والشركة" : "Account & company settings"}
          description={
            isRTL
              ? "حافظ على بيانات شركتك وسياسات الفوترة ومعلومات المستخدم محدثة."
              : "Keep your company profile, billing preferences and user details up to date."
          }
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="shrink-0 lg:w-64">
            <div className="sticky top-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
                <SettingsTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  showBranches={showBranches}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0 flex-1 space-y-4">
            {renderTabContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
