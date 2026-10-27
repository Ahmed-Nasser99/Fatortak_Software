
import { formatNumber } from "@/Helpers/localization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { DashboardStats } from "@/hooks/useDashboardReport";

interface FinancialOverviewProps {
  stats: DashboardStats;
}

export const FinancialOverview = ({ stats }: FinancialOverviewProps) => {
  const { t, isRTL } = useLanguage();

  const totalRevenue = stats?.totalRevenue || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const netIncome = stats?.netIncome || 0;

  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          {t("financialOverview")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue vs Expenses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("totalRevenue")}
                </span>
              </div>
              <span className="font-bold text-emerald-600">
                ${formatNumber(totalRevenue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("totalExpenses")}
                </span>
              </div>
              <span className="font-bold text-red-600">
                ${formatNumber(totalExpenses)}
              </span>
            </div>
            
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {t("netIncome")}
                  </span>
                </div>
                <span className={`font-bold text-lg ${
                  netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  ${formatNumber(netIncome)}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Ratios */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("profitMargin")}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {profitMargin.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, profitMargin))} 
                className="h-2"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("expenseRatio")}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {expenseRatio.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(100, expenseRatio)} 
                className="h-2"
              />
            </div>
            
            <div className="pt-2">
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm">
                <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  {t("healthScore")}
                </div>
                <div className={`text-2xl font-bold ${
                  profitMargin > 20 ? 'text-emerald-600' : 
                  profitMargin > 10 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {profitMargin > 20 ? 'Excellent' : 
                   profitMargin > 10 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
