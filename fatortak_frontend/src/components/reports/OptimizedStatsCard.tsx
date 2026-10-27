import { Card } from "@/components/ui/card";
import { formatNumber } from "@/Helpers/localization";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon } from "lucide-react";

interface OptimizedStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  isCurrency?: boolean;
  icon: LucideIcon;
  gradient: string;
  isLoading?: boolean;
}

export const OptimizedStatsCard = ({
  title,
  value,
  change,
  isCurrency = false,
  icon: Icon,
  gradient,
  isLoading = false,
}: OptimizedStatsCardProps) => {
  const { isRTL } = useLanguage();

  const isPositive = change?.startsWith("+");
  const displayValue = isCurrency
    ? `${formatNumber(value)}`
    : formatNumber(value);

  if (isLoading) {
    return (
      <Card className="relative overflow-hidden h-32 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800" />
        <div className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl animate-pulse" />
            <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
            <div className="w-32 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 border-0 shadow-lg">
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative p-6 text-white">
        <div
          className={`flex items-center ${
            isRTL ? "justify-end" : "justify-between"
          } mb-4`}
        >
          <div
            className={`w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl ${
              isRTL ? "ml-4" : ""
            }`}
          >
            <Icon className="w-7 h-7 text-white drop-shadow-lg" />
          </div>

          {change && (
            <div
              className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                isPositive
                  ? "bg-emerald-500/80 text-white shadow-emerald-500/30"
                  : "bg-red-500/80 text-white shadow-red-500/30"
              } shadow-lg backdrop-blur-sm border border-white/20 ${
                isRTL ? "mr-4" : ""
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isPositive ? "bg-emerald-300" : "bg-red-300"
                } ${isRTL ? "ml-2" : "mr-2"}`}
              />
              {change}
            </div>
          )}
        </div>

        <div className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
          <h3 className="text-sm font-semibold text-white/90 tracking-wide uppercase">
            {title}
          </h3>
          <p className="text-3xl font-black text-white drop-shadow-lg tracking-tight">
            {displayValue}
          </p>
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/5 rounded-full blur-sm" />
      </div>
    </Card>
  );
};
