import React from "react";
import { useUsers } from "../../hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface EmployeeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { t, isRTL } = useLanguage();
  // Fetch users (employees)
  const { data: usersResponse, isLoading } = useUsers({
    pageNumber: 1,
    pageSize: 100,
  });

  const users = usersResponse?.data?.data || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر الموظف" : "Select Employee")} />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            {user.firstName} {user.lastName}
          </SelectItem>
        ))}
        {users.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد موظفين" : "No employees found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default EmployeeSelector;
