
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatNumber } from "@/Helpers/localization";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart,
  Target,
  AlertCircle
} from "lucide-react";
import { DashboardStats } from "@/hooks/useDashboardReport";

interface FinancialMetricsProps {
  stats: DashboardStats;
}

export const FinancialMetrics = ({ stats }: FinancialMetricsProps) => {
  const { t, isRTL } = useLanguage();

  const totalRevenue = stats?.totalRevenue || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const netIncome = stats?.netIncome || 0;

  const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;
  const expenseRatio = totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  const revenueGrowth = 12.5; // This would come from comparison data
  const expenseGrowth = 8.3;

  const getHealthScore = () => {
    if (profitMargin > 25) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/20" };
    if (profitMargin > 15) return { label: "Good", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/20" };
    if (profitMargin > 5) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/20" };
    return { label: "Needs Attention", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/20" };
  };

  const healthScore = getHealthScore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Financial Overview */}
      <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-blue-950/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Financial Overview
              </h3>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Revenue, expenses, and profit analysis
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue & Expenses */}
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Revenue
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{revenueGrowth}% growth
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    ${formatNumber(totalRevenue)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10 rounded-xl border border-red-200/50 dark:border-red-700/30">
                <div className="flex items-center gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Expenses
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{expenseGrowth}% increase
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-red-600">
                    ${formatNumber(totalExpenses)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Net Income
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        After all expenses
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ${formatNumber(netIncome)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratios & Metrics */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profit Margin
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, profitMargin))} 
                  className="h-3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Industry average: 15-20%
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expense Ratio
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {expenseRatio.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(100, expenseRatio)} 
                  className="h-3"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Target: Below 70%
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                <div className="flex items-center gap-3 mb-2">
                  <PieChart className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Revenue Breakdown
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Sales</span>
                    <span>85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Services</span>
                    <span>15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Score & Insights */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Business Health
              </h3>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Performance indicators
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Score */}
          <div className={`text-center p-6 rounded-xl ${healthScore.bg}`}>
            <div className={`text-3xl font-bold ${healthScore.color} mb-2`}>
              {healthScore.label}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Overall Financial Health
            </div>
            <div className={`text-2xl font-bold ${healthScore.color} mt-2`}>
              {profitMargin.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Profit Margin
            </div>
          </div>

          {/* Key Insights */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200/50 dark:border-emerald-700/30">
              <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Revenue Growth
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  +{revenueGrowth}% increase this month
                </p>
              </div>
            </div>

            {expenseGrowth > 10 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200/50 dark:border-amber-700/30">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Rising Expenses
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Monitor expense growth: +{expenseGrowth}%
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-700/30">
              <Target className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Recommendations
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Focus on high-margin products
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
