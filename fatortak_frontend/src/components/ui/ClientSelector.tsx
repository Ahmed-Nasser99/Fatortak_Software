import React from "react";
import { useCustomers } from "../../hooks/useCustomers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface ClientSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { t, isRTL } = useLanguage();
  // Fetch clients (customers who are not suppliers)
  // Adjust filter logic based on API capabilities. Assuming isSupplier: false works.
  const { data: customersResponse, isLoading } = useCustomers(
    { pageNumber: 1, pageSize: 100 },
    { isSupplier: false }
  );

  const clients = customersResponse?.data?.data || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر العميل" : "Select Client")} />
      </SelectTrigger>
      <SelectContent>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name}
          </SelectItem>
        ))}
        {clients.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد عملاء" : "No clients found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default ClientSelector;
