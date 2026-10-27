import React from "react";
import { MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useBranches } from "../../hooks/useBranches";
import SearchableDropdown from "./SearchableDropdown";
import { useCurrentCompany } from "../../hooks/useCompanies";

interface BranchSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

const BranchSelector: React.FC<BranchSelectorProps> = ({
  value,
  onChange,
  label,
  required = false,
  className = "",
}) => {
  const { isRTL, t } = useLanguage();
  const { data: companyResult } = useCurrentCompany();
  const { data: branchesResult, isLoading } = useBranches();

  const showBranches = companyResult?.data?.enableMultipleBranches || false;
  const branches = branchesResult?.data || [];

  if (!showBranches) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {isLoading ? (
          <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-gray-600 dark:text-gray-400">
              {t("loading") || "Loading"}...
            </span>
          </div>
        ) : (
          <SearchableDropdown
            options={branches.map((branch: any) => ({
              value: branch.id,
              label: branch.name + (branch.isMain ? ` (${isRTL ? "الرئيسي" : "Main"})` : ""),
            }))}
            value={value}
            onChange={onChange}
            placeholder={isRTL ? "اختر الفرع" : "Select Branch"}
            isLoading={isLoading}
            isRTL={isRTL}
          />
        )}
      </div>
    </div>
  );
};

export default BranchSelector;
