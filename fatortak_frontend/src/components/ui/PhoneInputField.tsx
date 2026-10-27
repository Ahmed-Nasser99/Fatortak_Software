import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import "react-phone-number-input/style.css";
import { useLanguage } from "../../contexts/LanguageContext";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  error?: string;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  label,
  required = false,
  error,
}) => {
  const { t, isRTL } = useLanguage();
  const [internalValue, setInternalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (phoneValue: string | undefined) => {
    const newValue = phoneValue || "";
    setInternalValue(newValue);

    if (newValue) {
      try {
        const phoneNumber = parsePhoneNumber(newValue);
        const isValidLength = phoneNumber.isPossible();
        setIsValid(isValidLength);

        if (isValidLength) {
          onChange(newValue);
        }
      } catch (e) {
        setIsValid(false);
      }
    } else {
      setIsValid(true);
      onChange(newValue);
    }
  };

  const showError = error || (!isValid && internalValue);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && "*"}
      </label>
      <div className={isRTL ? "rtl-phone-input" : ""}>
        <PhoneInput
          international
          defaultCountry="EG"
          value={internalValue}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
            showError
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } ${isRTL ? "text-right" : "text-left"}`}
          placeholder={isRTL ? "أدخل رقم الهاتف" : "Enter phone number"}
          error={showError ? t("invalidPhoneNumber") : undefined}
        />
      </div>
      {showError && (
        <p className="text-red-500 text-xs mt-1">
          {error || t("invalidPhoneNumber")}
        </p>
      )}
    </div>
  );
};

export default PhoneInputField;
