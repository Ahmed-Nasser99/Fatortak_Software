import React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTone = "brand" | "success" | "warning" | "danger" | "info" | "neutral";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  tone?: StatTone;
  trend?: number;
  trendLabel?: string;
  className?: string;
  tooltip?: string;
}

const toneClasses: Record<StatTone, { icon: string; accent: string }> = {
  brand: {
    icon: "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300",
    accent: "text-brand-700 dark:text-brand-300",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    accent: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    accent: "text-amber-700 dark:text-amber-300",
  },
  danger: {
    icon: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    accent: "text-rose-700 dark:text-rose-300",
  },
  info: {
    icon: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    accent: "text-sky-700 dark:text-sky-300",
  },
  neutral: {
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    accent: "text-slate-700 dark:text-slate-200",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "brand",
  trend,
  trendLabel,
  className,
  tooltip,
}) => {
  const styles = toneClasses[tone];
  const trendPositive = (trend ?? 0) >= 0;

  return (
    <div
      title={tooltip}
      className={cn(
        "group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:border-brand-200 sm:p-5 dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-snug text-slate-500 sm:text-[13px] dark:text-slate-400">
            {title}
          </p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:mt-2 sm:text-2xl dark:text-white">
            {value}
          </p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10", styles.icon)}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      <div className="mt-3 flex min-h-5 items-center justify-between gap-3 sm:mt-4">
        <p className="truncate text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
          {subtitle}
        </p>
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              trendPositive ? styles.accent : "text-rose-600 dark:text-rose-300"
            )}
          >
            {trendPositive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(trend)}%
            {trendLabel && <span className="font-normal text-slate-400">{trendLabel}</span>}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
