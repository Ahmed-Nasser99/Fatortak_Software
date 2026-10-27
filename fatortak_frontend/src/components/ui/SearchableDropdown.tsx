import React from "react";
import Select from "react-select";

interface SearchableDropdownProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  isRTL?: boolean;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  isLoading,
  isRTL,
}) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={(option) => onChange(option?.value || "")}
      placeholder={placeholder}
      isLoading={isLoading}
      isSearchable
      className="react-select-container"
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({
          ...base,
          minHeight: "48px",
          borderWidth: "2px",
          borderColor: "#e5e7eb",
          ":hover": {
            borderColor: "#e5e7eb",
          },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 9999,
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: "#8b5cf6",
          primary25: "#f3e8ff",
        },
      })}
    />
  );
};

export default SearchableDropdown;
