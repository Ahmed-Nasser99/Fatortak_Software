import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, AreaChart as AreaChartIcon } from "lucide-react";

interface VisualizationData {
  type: "kpi" | "chart";
  data: any;
  chartType?: "line" | "bar" | "pie" | "area";
  title?: string;
  description?: string;
}

interface AiVisualizationProps {
  data: VisualizationData;
}

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-500 dark:text-gray-400">
              {entry.name}:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {typeof entry.value === 'number' 
                ? new Intl.NumberFormat('en-US').format(entry.value) 
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AiVisualization: React.FC<AiVisualizationProps> = ({ data }) => {
  const [activeChartType, setActiveChartType] = useState<"line" | "bar" | "pie" | "area">(
    data?.chartType || "line"
  );

  if (!data) return null;

  if (data.type === "kpi") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4 w-full">
        {data.data.map((kpi: any, index: number) => {
          const isPositive = kpi.change?.includes("+") || kpi.trend === "up";
          const isNegative = kpi.change?.includes("-") || kpi.trend === "down";
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-16 h-16 text-purple-500 transform rotate-12" />
              </div>
              
              <div className="relative z-10">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {kpi.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {kpi.value}
                  </div>
                </div>
                
                {kpi.change && (
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : 
                    isNegative ? "text-rose-600 dark:text-rose-400" : 
                    "text-gray-500"
                  }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : 
                     isNegative ? <TrendingDown className="w-3 h-3" /> : 
                     <Minus className="w-3 h-3" />}
                    <span>{kpi.change}</span>
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">vs last period</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  if (data.type === "chart") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-6 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm w-full overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {data.title}
            </h4>
            {data.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveChartType("line")}
              className={`p-1.5 rounded-md transition-all ${
                activeChartType === "line"
                  ? "bg-white dark:bg-gray-600 text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Line Chart"
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChartType("bar")}
              className={`p-1.5 rounded-md transition-all ${
                activeChartType === "bar"
                  ? "bg-white dark:bg-gray-600 text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChartType("area")}
              className={`p-1.5 rounded-md transition-all ${
                activeChartType === "area"
                  ? "bg-white dark:bg-gray-600 text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Area Chart"
            >
              <AreaChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChartType("pie")}
              className={`p-1.5 rounded-md transition-all ${
                activeChartType === "pie"
                  ? "bg-white dark:bg-gray-600 text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              title="Pie Chart"
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartType === "line" ? (
              <LineChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  tickFormatter={(value) => `${value >= 1000 ? `${value/1000}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            ) : activeChartType === "bar" ? (
              <BarChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${value >= 1000 ? `${value/1000}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', opacity: 0.4 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                >
                  {data.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : activeChartType === "pie" ? (
              <PieChart>
                <Pie
                  data={data.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {data.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            ) : (
              <AreaChart data={data.data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorValueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `${value >= 1000 ? `${value/1000}k` : value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorValueArea)" 
                  strokeWidth={3}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default AiVisualization;
