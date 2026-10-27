import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/Helpers/formatCurrency";

// Type definition for monthly financial data
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

interface TooltipData {
  month: string;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  x: number;
  y: number;
}

const ProfitGrowthChart: React.FC<ProfitGrowthChartProps> = ({
  monthlyData,
  t,
}) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Calculate chart points based on real data
  const chartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return {
        revenuePoints: "",
        expensePoints: "",
        maxValue: 0,
        months: [],
        dataPoints: [],
      };
    }

    const maxValue = Math.max(
      ...monthlyData.map((d) => Math.max(d.revenue, d.expenses))
    );

    const chartHeight = 200;
    const chartWidth = 600;
    const pointSpacing = chartWidth / (monthlyData.length - 1 || 1);

    // Calculate Y position (inverted because SVG y=0 is at top)
    const getY = (value: number) => {
      if (maxValue === 0) return chartHeight;
      return chartHeight - (value / maxValue) * chartHeight;
    };

    // Store data points for hover detection
    const dataPoints = monthlyData.map((data, index) => ({
      x: index * pointSpacing,
      revenueY: getY(data.revenue),
      expenseY: getY(data.expenses),
      data,
    }));

    // Generate points for revenue line
    const revenuePoints = dataPoints
      .map((point) => `${point.x},${point.revenueY}`)
      .join(" ");

    // Generate points for expense line
    const expensePoints = dataPoints
      .map((point) => `${point.x},${point.expenseY}`)
      .join(" ");

    const months = monthlyData.map((d) => d.month);

    return { revenuePoints, expensePoints, maxValue, months, dataPoints };
  }, [monthlyData]);

  // Calculate growth percentage
  const growthInsight = useMemo(() => {
    if (!monthlyData || monthlyData.length < 2) {
      return {
        text: t("profitInsight") || "Insufficient data for insights",
        isPositive: true,
      };
    }

    const lastMonth = monthlyData[monthlyData.length - 1];
    console.log(lastMonth);

    const previousMonth = monthlyData[monthlyData.length - 2];
    console.log(previousMonth);

    const profitChange = lastMonth.profit - previousMonth.profit;
    const profitChangePercent =
      previousMonth.profit !== 0
        ? Math.round((profitChange / Math.abs(previousMonth.profit)) * 100)
        : 100;

    const expenseChange = lastMonth.expenses - previousMonth.expenses;
    const expenseChangePercent =
      previousMonth.expenses !== 0
        ? Math.round((expenseChange / previousMonth.expenses) * 100)
        : 100;
    const isPositive = profitChange >= 0;

    let text = "";
    if (isPositive) {
      text = `Your profit ${
        profitChange > 0 ? "increased" : "remained stable"
      } by ${Math.abs(profitChangePercent)}% this month. `;
      if (expenseChangePercent > 0) {
        text += `Expenses went up ${expenseChangePercent}% but revenue growth compensated.`;
      } else {
        text += `Expenses decreased by ${Math.abs(
          expenseChangePercent
        )}%, improving margins.`;
      }
    } else {
      text = `Profit decreased by ${Math.abs(
        profitChangePercent
      )}% this month. `;
      if (expenseChangePercent > 0) {
        text += `This is mainly due to ${expenseChangePercent}% increase in expenses.`;
      } else {
        text += `Consider reviewing revenue strategies.`;
      }
    }

    return { text, isPositive };
  }, [monthlyData, t]);

  // Handle mouse move to show tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 600;

    // Find closest data point
    let closestIndex = 0;
    let minDistance = Infinity;

    chartData.dataPoints.forEach((point, index) => {
      const distance = Math.abs(point.x - mouseX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Show tooltip if within reasonable distance (50px)
    if (minDistance < 50 && chartData.dataPoints[closestIndex]) {
      const point = chartData.dataPoints[closestIndex];
      setTooltip({
        month: point.data.month,
        year: point.data.year,
        revenue: point.data.revenue,
        expenses: point.data.expenses,
        profit: point.data.profit,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setHoveredIndex(closestIndex);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
    setHoveredIndex(null);
  };

  // Show loading state if no data
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t("profitAndGrowth") || "Profit & Growth"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">
              {t("noDataAvailable") || "No financial data available"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t("profitAndGrowth") || "Profit & Growth"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2 mb-4">
          <div className="flex-1 h-full relative">
            <svg
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Grid lines */}
              <line
                x1="0"
                y1="50"
                x2="600"
                y2="50"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="100"
                x2="600"
                y2="100"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="150"
                x2="600"
                y2="150"
                stroke="#e5e7eb"
                strokeWidth="1"
              />

              {/* Revenue line (blue) with gradient */}
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient
                  id="expenseGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Revenue area fill */}
              {chartData.revenuePoints && (
                <polygon
                  points={`0,200 ${chartData.revenuePoints} 600,200`}
                  fill="url(#revenueGradient)"
                />
              )}

              {/* Expense area fill */}
              {chartData.expensePoints && (
                <polygon
                  points={`0,200 ${chartData.expensePoints} 600,200`}
                  fill="url(#expenseGradient)"
                />
              )}

              {/* Revenue line (blue) */}
              {chartData.revenuePoints && (
                <polyline
                  points={chartData.revenuePoints}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Expenses line (orange) */}
              {chartData.expensePoints && (
                <polyline
                  points={chartData.expensePoints}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Data point circles */}
              {chartData.dataPoints.map((point, index) => (
                <g key={index}>
                  {/* Revenue point */}
                  <circle
                    cx={point.x}
                    cy={point.revenueY}
                    r={hoveredIndex === index ? 6 : 4}
                    fill="#3b82f6"
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                  {/* Expense point */}
                  <circle
                    cx={point.x}
                    cy={point.expenseY}
                    r={hoveredIndex === index ? 6 : 4}
                    fill="#f97316"
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-200"
                  />
                </g>
              ))}

              {/* Vertical hover line */}
              {hoveredIndex !== null && chartData.dataPoints[hoveredIndex] && (
                <line
                  x1={chartData.dataPoints[hoveredIndex].x}
                  y1="0"
                  x2={chartData.dataPoints[hoveredIndex].x}
                  y2="200"
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="absolute bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 pointer-events-none z-10"
                style={{
                  left: `${tooltip.x}px`,
                  top: `${tooltip.y - 150}px`,
                  transform: "translateX(-50%)",
                  minWidth: "220px",
                }}
              >
                <div className="space-y-3">
                  {/* Month/Year header */}
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tooltip.month} {tooltip.year}
                    </h4>
                    {tooltip.profit >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  {/* Revenue */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("revenue") || "Revenue"}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(tooltip.revenue)}
                    </span>
                  </div>

                  {/* Expenses */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("expenses") || "Expenses"}
                      </span>
                    </div>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      {formatCurrency(tooltip.expenses)}
                    </span>
                  </div>

                  {/* Profit/Loss */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {tooltip.profit >= 0
                        ? t("profit") || "Profit"
                        : t("loss") || "Loss"}
                    </span>
                    <span
                      className={`font-bold ${
                        tooltip.profit >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(Math.abs(tooltip.profit))}
                    </span>
                  </div>

                  {/* Margin percentage */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t("margin") || "Margin"}
                    </span>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {tooltip.revenue > 0
                        ? `${((tooltip.profit / tooltip.revenue) * 100).toFixed(
                            1
                          )}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              {chartData.months.map((month, index) => (
                <span
                  key={index}
                  className={`transition-all ${
                    hoveredIndex === index ? "font-semibold text-gray-900" : ""
                  }`}
                >
                  {month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 !my-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {t("revenue") || "Revenue"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              {t("expenses") || "Expenses"}
            </span>
          </div>
        </div>

        {/* AI-powered Insights */}
        <div
          className={`p-3 rounded-lg ${
            growthInsight.isPositive
              ? "bg-green-50 border border-green-200"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          <p className="text-sm text-gray-700">{growthInsight.text}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfitGrowthChart;
