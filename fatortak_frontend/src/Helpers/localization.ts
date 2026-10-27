import i18n from '../lib/i18n';
import { format as formatDateFns } from 'date-fns';
import { arEG, enUS } from 'date-fns/locale';

/**
 * Gets the current active language code.
 */
export const getLocale = () => i18n.language || 'en';

/**
 * Formats a number or string as a localized number string.
 * @param value The value to format.
 * @param options Intl.NumberFormatOptions for customization.
 */
export const formatNumber = (value: number | string, options?: Intl.NumberFormatOptions) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === null || num === undefined || isNaN(num)) return value?.toString() || '';
  
  const currentLang = getLocale();
  // Force ar-EG for Arabic to ensure Eastern Arabic numerals (٠١٢٣) are likely used
  // consistently, as generic 'ar' might default to Western numerals in some environments.
  const localeToUse = currentLang.startsWith('ar') ? 'ar-EG' : 'en-US';

  return new Intl.NumberFormat(localeToUse, options).format(num);
};

/**
 * Converts Western numerals (0-9) to Eastern Arabic numerals (٠-٩).
 */
export const toEasternArabicNumerals = (str: string) => {
  return str.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);
};

/**
 * Formats a date object or string into a localized date string.
 * @param date The date to format.
 * @param formatStr The date-fns format string (default 'PP' for localized long date).
 */
export const formatDate = (date: Date | string | number, formatStr: string = 'PP') => {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return date.toString();
  
  const currentLang = getLocale();
  // Use arEG for Arabic dates
  const locale = currentLang.startsWith('ar') ? arEG : enUS;

  let formattedDate = formatDateFns(d, formatStr, { locale });

  // Verify if the requested format is the default 'PP' and we are in Arabic
  // If so, override it to a numeric format 'yyyy/MM/dd' to avoid abbreviated month names
  if (currentLang.startsWith('ar')) {
      if (formatStr === 'PP') {
        formattedDate = formatDateFns(d, 'yyyy/MM/dd', { locale });
      }
      
      return toEasternArabicNumerals(formattedDate);
  }
  
  return formattedDate;
};

/**
 * Parses a date string in "YYYY-MM-DD" format as a local date (midnight).
 * This avoids timezone issues where "YYYY-MM-DD" is parsed as UTC.
 */
export const parseLocalDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return undefined;
  
  // Handle "YYYY-MM-DD" explicitly
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day);
};
