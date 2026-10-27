import React, { useEffect, useState } from "react";
import { useAccounts, useAccountHierarchy } from "../../hooks/useAccounting";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { AccountDto, AccountType } from "../../types/api";
import { formatNumber } from "../../Helpers/localization";
import { ChevronRight, User } from "lucide-react";

interface DataSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  paymentMethod?: string;
}

const DataSourceSelector: React.FC<DataSourceSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
  paymentMethod,
}) => {
  const { t, isRTL } = useLanguage();
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const { data: accountsResponse, isLoading } = useAccounts(
    {
      pageNumber: 1,
      pageSize: 1000,
    },
    {
      isActive: true,
    },
  );

  const accounts = accountsResponse?.data?.data || [];

  // Filter for Cash (1000), Bank (1100), and Employee Custody (1500)
  const cashAccounts = accounts.filter(
    (a) => a.accountCode.startsWith("1000") && a.isPostable,
  );
  const bankAccounts = accounts.filter(
    (a) => a.accountCode.startsWith("1100") && a.isPostable,
  );
  const chequeAccounts = accounts.filter(
    (a) => (a.accountCode === "1600" || a.accountCode.startsWith("1600")) && a.isPostable,
  );
  const employeeCustodyParent = accounts.find((a) => a.accountCode === "1500");
  const employeeAccounts = accounts.filter(
    (a) => a.parentAccountId === employeeCustodyParent?.id,
  );

  const getDisplayLabel = (val: string) => {
    if (isEmployeeAccountSelected)
      return isRTL ? "عقـد عهدة موظف" : "Employee Advance";
    const account = accounts.find((a) => a.id === val);
    if (!account) return null;
    if (cashAccounts.includes(account))
      return `${isRTL ? "نقدي" : "Cash"} - ${account.name}`;
    if (bankAccounts.includes(account))
      return `${isRTL ? "بنك" : "Bank"} - ${account.name}`;
    if (chequeAccounts.includes(account))
      return `${isRTL ? "شيكات تحت التحصيل" : "Cheques"} - ${account.name}`;
    return account.name;
  };

  const handleParentSelect = (val: string) => {
    if (val === "employee_adv") {
      setSelectedParentId("employee_adv");
    } else {
      setSelectedParentId(null);
      onChange(val);
    }
  };
  // Reset selected parent if value is cleared externally
  useEffect(() => {
    if (!value) setSelectedParentId(null);
  }, [value]);
  const selectedAccount = accounts.find((a) => a.id === value);
  const isEmployeeAccountSelected =
    selectedAccount?.parentAccountId === employeeCustodyParent?.id;

  return (
    <div className="space-y-2">
      <Select
        value={isEmployeeAccountSelected ? "employee_adv" : value}
        onValueChange={handleParentSelect}
      >
        <SelectTrigger
          className={`${className} ${isRTL ? "text-right" : "text-left"}`}
        >
          {value ? (
            <span>{getDisplayLabel(value)}</span>
          ) : (
            <span className="text-muted-foreground">
              {placeholder ||
                (isRTL ? "اختر مصدر الدفع" : "Select Payment Source")}
            </span>
          )}
        </SelectTrigger>
        <SelectContent>
          {(!paymentMethod || paymentMethod === "Cash") && cashAccounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              <div className="flex justify-between items-center w-full min-w-[200px]">
                <span>
                  {isRTL ? "نقدي" : "Cash"} - {a.name}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 ml-2">
                  {formatNumber(a.balance)} EGP
                </span>
              </div>
            </SelectItem>
          ))}
          {(!paymentMethod || paymentMethod === "Bank") && bankAccounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              <div className="flex justify-between items-center w-full min-w-[200px]">
                <span>
                  {isRTL ? "بنك" : "Bank"} - {a.name}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 ml-2">
                  {formatNumber(a.balance)} EGP
                </span>
              </div>
            </SelectItem>
          ))}
          {paymentMethod === "Cheque" && chequeAccounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              <div className="flex justify-between items-center w-full min-w-[200px]">
                <span>
                  {isRTL ? "شيكات تحت التحصيل" : "Cheques"} - {a.name}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 ml-2">
                  {formatNumber(a.balance)} EGP
                </span>
              </div>
            </SelectItem>
          ))}
          {(!paymentMethod || paymentMethod === "EmployeeAdvance") && employeeCustodyParent && (
            <SelectItem value="employee_adv">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{isRTL ? "عقـد عهدة موظف" : "Employee Advance"}</span>
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {(selectedParentId === "employee_adv" || isEmployeeAccountSelected) && (
        <div
          className={`pl-4 ${isRTL ? "pr-4 pl-0" : "pl-4"} animate-in slide-in-from-top-1 duration-200`}
        >
          <div className="flex items-center gap-2 mb-1">
            <ChevronRight
              className={`w-3 h-3 text-slate-400 ${isRTL ? "rotate-180" : ""}`}
            />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {isRTL ? "اختر الموظف" : "Select Employee Account"}
            </span>
          </div>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue
                placeholder={isRTL ? "اختر موظف" : "Select employee"}
              />
            </SelectTrigger>
            <SelectContent>
              {employeeAccounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{a.name}</span>
                    <span className="text-xs font-mono font-bold text-emerald-600 ml-2">
                      {formatNumber(a.balance)} EGP
                    </span>
                  </div>
                </SelectItem>
              ))}
              {employeeAccounts.length === 0 && (
                <div className="p-2 text-xs text-slate-500 text-center">
                  {isRTL
                    ? "لا يوجد حسابات موظفين"
                    : "No employee accounts found"}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default DataSourceSelector;
