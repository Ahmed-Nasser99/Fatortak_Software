"use client";

import type React from "react";
import {
  Building,
  User,
  Bell,
  Shield,
  CreditCard,
  Users,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showBranches?: boolean;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange,
  showBranches = false,
}) => {
  const { isRTL, t } = useLanguage();

  const tabs = [
    { id: "company", nameKey: "companySettings" },
    ...(showBranches ? [{ id: "branches", nameKey: "branches" }] : []),
    { id: "user", nameKey: "userSettings" },
    //{ id: "hr", nameKey: "hrSettings" },
    //{ id: "quota", nameKey: "quotaUsage" },
    //{ id: "notifications", nameKey: "notifications" },
    //{ id: "security", nameKey: "security" },
  ];

  return (
    <nav className="space-y-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
              ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }
              ${isRTL ? "text-right" : "text-left"}
            `}
          >
            <span className="flex-1 truncate">{t(tab.nameKey)}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsTabs;
