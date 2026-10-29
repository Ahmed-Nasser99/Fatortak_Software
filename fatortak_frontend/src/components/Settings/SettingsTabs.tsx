"use client";

import type React from "react";
import { Building, User } from "lucide-react";
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
    { id: "company", nameKey: "companySettings", icon: Building },
    ...(showBranches
      ? [{ id: "branches", nameKey: "branches", icon: Building }]
      : []),
    { id: "user", nameKey: "userSettings", icon: User },
  ];

  return (
    <nav className="space-y-0.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
              ${
                isActive
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
              }
              ${isRTL ? "text-end" : "text-start"}
            `}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "" : "text-slate-400"}`} />
            <span className="flex-1 truncate">{t(tab.nameKey)}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsTabs;
