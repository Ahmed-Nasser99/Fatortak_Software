import React, { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/Helpers/formatCurrency";

interface MonthlyFinancial {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProfitGrowthChartProps {
  monthlyData: MonthlyFinancial[];
  t: (key: string) => string;
}

const compactNumber = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
};

const ProfitGrowthChart: React.FC<ProfitGrowthChartProps> = ({
  monthlyData,
  t,
}) => {
  const growthInsight = useMemo(() => {
    if (!monthlyData || monthlyData.length < 2) {
      return {
        text: t("profitInsight") || "Not enough data for insights yet.",
        isPositive: true,
      };
    }

    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const profitChange = lastMonth.profit - previousMonth.profit;
    const profitChangePercent =
      previousMonth.profit !== 0
        ? Math.round((profitChange / Math.abs(previousMonth.profit)) * 100)
        : 100;

    const expenseChangePercent =
      previousMonth.expenses !== 0
        ? Math.round(
            ((lastMonth.expenses - previousMonth.expenses) /
              previousMonth.expenses) *
              100
          )
        : 0;
    const isPositive = profitChange >= 0;

    let text: string;
    if (isPositive) {
      text = `Profit ${
        profitChange > 0 ? "increased" : "held steady"
      } by ${Math.abs(profitChangePercent)}% this month. `;
      text +=
        expenseChangePercent > 0
          ? `Expenses rose ${expenseChangePercent}%, but revenue growth kept margins healthy.`
          : `Expenses fell ${Math.abs(
              expenseChangePercent
            )}%, improving your margin.`;
    } else {
      text = `Profit decreased by ${Math.abs(
        profitChangePercent
      )}% this month. `;
      text +=
        expenseChangePercent > 0
          ? `Expenses rose ${expenseChangePercent}% — review the largest cost lines.`
          : "Consider reviewing pricing and collection follow-up.";
    }

    return { text, isPositive };
  }, [monthlyData, t]);

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t("profitAndGrowth") || "Profit & Growth"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("noDataAvailable") || "No financial data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{t("profitAndGrowth") || "Profit & Growth"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 12, right: 8, left: -18, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6A4FD8" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6A4FD8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 4"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={50}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={compactNumber}
              />
              <Tooltip
                cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as MonthlyFinancial;
                  return (
                    <div className="min-w-[210px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                      <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {label} {point.year}
                        </p>
                        {point.profit >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-brand-600" />
                            {t("revenue") || "Revenue"}
                          </span>
                          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                            {formatCurrency(point.revenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                            {t("expenses") || "Expenses"}
                          </span>
                          <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                            {formatCurrency(point.expenses)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-1.5 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400">
                            {point.profit >= 0
                              ? t("profit") || "Profit"
                              : t("loss") || "Loss"}
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${
                              point.profit >= 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {formatCurrency(Math.abs(point.profit))}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name={t("revenue") || "Revenue"}
                stroke="#6A4FD8"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name={t("expenses") || "Expenses"}
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#expenseFill)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-4 mt-2 flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("revenue") || "Revenue"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t("expenses") || "Expenses"}
            </span>
          </div>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            growthInsight.isPositive
              ? "border-emerald-100 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
              : "border-amber-100 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30"
          }`}
        >
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {growthInsight.text}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitGrowthChart;
