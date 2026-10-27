
import { formatNumber } from "@/Helpers/localization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  change?: string;
  isCurrency?: boolean;
  icon?: LucideIcon;
  gradient?: string;
}

export const StatsCard = ({ stat }: { stat: StatItem }) => {
  const isPositive = stat.change?.startsWith("+");
  const isNegative = stat.change?.startsWith("-");
  const IconComponent = stat.icon;

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/25 dark:hover:shadow-gray-900/25 transition-all duration-300 hover:-translate-y-1">
      {stat.gradient && (
        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      )}
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          {IconComponent && stat.gradient && (
            <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          )}
          {stat.change && (
            <div
              className={`flex items-center text-sm font-medium px-2 py-1 rounded-lg ${
                isPositive
                  ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
                  : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {stat.change}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {stat.title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stat.isCurrency
              ? `$${formatNumber(stat.value)}`
              : formatNumber(stat.value)}
          </p>
        </div>
      </div>
    </div>
  );
};
