import { useLanguage } from "@/contexts/LanguageContext";
import { formatNumber } from "@/Helpers/localization";
import { RevenueDataPointDto } from "@/types/reports";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export const RevenueChart = ({ data }: { data: RevenueDataPointDto[] }) => {
  const { t } = useLanguage();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{`Period: ${label}`}</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("reports.revenue")}:{" "}
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ${formatNumber(payload[0].value)}
              </span>
            </div>
            {payload[1] && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t("reports.orders")}:{" "}
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {payload[1].value}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            opacity={0.3}
            stroke="#E5E7EB"
            className="dark:stroke-gray-600"
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6B7280" }}
            axisLine={{ stroke: "#E5E7EB", strokeWidth: 1 }}
            tickLine={{ stroke: "#E5E7EB" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="url(#revenueGradient)"
            strokeWidth={3}
            fill="url(#revenueGradient)"
            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
            activeDot={{
              r: 6,
              fill: "#3B82F6",
              stroke: "#ffffff",
              strokeWidth: 2,
              filter: "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
