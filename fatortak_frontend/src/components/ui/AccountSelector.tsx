import React from "react";
import { useAccounts } from "../../hooks/useAccounting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { AccountType } from "../../types/api";

interface AccountSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  accountType?: AccountType;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
  accountType = AccountType.Expense,
}) => {
  const { t, isRTL } = useLanguage();
  
  const { data: accountsResponse, isLoading } = useAccounts({
    pageNumber: 1,
    pageSize: 1000, // Get all leaf accounts
  }, {
    accountType: accountType,
    isPostable: true,
    isActive: true
  });

  const accounts = accountsResponse?.success
    ? accountsResponse.data?.data || []
    : [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر الحساب" : "Select Account")} />
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.accountCode} - {account.name}
          </SelectItem>
        ))}
        {accounts.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد حسابات" : "No accounts found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default AccountSelector;
