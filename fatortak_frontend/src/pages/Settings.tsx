import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import CompanySettingsForm from "../components/Settings/CompanySettingsForm";
import UserSettingsForm from "../components/Settings/UserSettingsForm";
import QuotaSettingsForm from "../components/Settings/QuotaSettingsForm";
import SettingsTabs from "../components/Settings/SettingsTabs";
import HRSettingsForm from "@/components/Settings/HRSettingsForm";
import { useCurrentCompany } from "../hooks/useCompanies";
import BranchSettings from "@/components/Settings/BranchSettings";
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
      //       <h3 className="text-2xl font-black text-foreground mb-3 text-center uppercase tracking-widest">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Simplified Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 rounded-full bg-gradient-to-b from-primary to-primary/50" />
            <div>
              <h1 className="text-4xl font-black text-foreground uppercase tracking-tight">
                {isRTL ? "الإعدادات" : "Settings"}
              </h1>
              <p className="text-muted-foreground font-bold italic">
                {isRTL
                  ? "إدارة إعدادات حسابك والشركة"
                  : "Manage your account and company settings"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-8">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border shadow-xl shadow-black/5 p-4">
                <SettingsTabs
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  showBranches={showBranches}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border shadow-xl shadow-black/5 p-6 lg:p-8">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
