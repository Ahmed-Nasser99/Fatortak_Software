import React from "react";
import { useExpenseCategories } from "../../hooks/useExpenseCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { isRTL } = useLanguage();
  const { data: categoriesResponse, isLoading } = useExpenseCategories();
  const categories = categoriesResponse?.data || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر التصنيف" : "Select Category")} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
        {categories.length === 0 && !isLoading && (
          <div className="p-2 text-sm text-gray-500 text-center">
            {isRTL ? "لا يوجد تصنيفات" : "No categories found"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default CategorySelector;
