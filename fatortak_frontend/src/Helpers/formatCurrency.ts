import { formatNumber } from "./localization";

export function formatCurrency(value: number | string): string {
  return formatNumber(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
