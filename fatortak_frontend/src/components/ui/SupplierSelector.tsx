import React from "react";
import { useCustomers } from "../../hooks/useCustomers"; // Assuming this hook exists and handles isSupplier filter
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface SupplierSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { t, isRTL } = useLanguage();
  // Fetch suppliers
  const { data: suppliersResponse, isLoading } = useCustomers(
    { pageNumber: 1, pageSize: 100 },
    { isSupplier: true }
  );

  const suppliers = suppliersResponse?.data?.data || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر المورد" : "Select Supplier")} />
      </SelectTrigger>
      <SelectContent>
        {suppliers.map((supplier) => (
          <SelectItem key={supplier.id} value={supplier.id}>
            {supplier.name}
          </SelectItem>
        ))}
        {suppliers.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد موردين" : "No suppliers found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default SupplierSelector;
