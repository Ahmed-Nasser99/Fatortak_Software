import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatNumber } from "@/Helpers/localization";

interface EnhancedStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  gradient: string;
  bgColor: string;
  iconColor: string;
  subtitle?: string;
}

export const EnhancedStatsCard = ({
  title,
  value,
  change,
  changeType = "positive",
  icon: Icon,
  gradient,
  bgColor,
  iconColor,
  subtitle,
}: EnhancedStatsCardProps) => {
  const { isRTL, t } = useLanguage();
  const isPositive = changeType === "positive";

  return (
    <Card
      className={`${bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${gradient.split(" ")[1]}, ${
            gradient.split(" ")[3]
          })`,
        }}
      />

      <CardHeader
        className={`flex ${
          isRTL ? "flex-row-reverse" : "flex-row"
        } items-center justify-between space-y-0 pb-3 relative z-10`}
      >
        <div className={`space-y-1 ${isRTL ? "text-right" : ""}`}>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </h3>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {typeof value === "number" ? formatNumber(value) : value}
          </div>
        </div>
        <div
          className={`p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm group-hover:shadow-md transition-shadow duration-300`}
        >
          <Icon
            className={`w-5 h-5 ${iconColor} group-hover:scale-110 transition-transform duration-300`}
          />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div
          className={`flex items-center ${
            isRTL ? "justify-end" : "justify-between"
          }`}
        >
          {change && (
            <div
              className={`flex items-center gap-1 text-xs ${
                isRTL ? "flex-row-reverse" : ""
              } ${isPositive ? "text-emerald-600" : "text-red-600"}`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </div>
          )}
          {subtitle && (
            <div
              className={`text-xs text-slate-500 dark:text-slate-400 ${
                isRTL ? "text-right" : ""
              }`}
            >
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
