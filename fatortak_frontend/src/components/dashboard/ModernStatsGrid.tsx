
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardStats } from "@/hooks/useDashboardReport";

interface StatCard {
  title: string;
  value: string;
  change?: string;
  changeType: "positive" | "negative";
  icon: LucideIcon;
  description?: string;
  color: string;
}

interface ModernStatsGridProps {
  stats: DashboardStats;
  statCards: StatCard[];
}

export const ModernStatsGrid = ({ stats, statCards }: ModernStatsGridProps) => {
  const { isRTL, t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card 
          key={index}
          className="group relative overflow-hidden border-0 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className={`absolute inset-0 ${card.color} bg-gradient-to-br`} />
          </div>

          <CardContent className="relative p-6">
            <div className={`flex items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {card.title}
                </p>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </h3>
                  {card.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {card.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className={`relative ${card.color} bg-gradient-to-br p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {card.change && (
              <div className={`mt-4 flex items-center ${isRTL ? "flex-row-reverse" : ""}`}>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  card.changeType === "positive" 
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}>
                  {card.changeType === "positive" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {card.change}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {t("vsLastMonth")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
