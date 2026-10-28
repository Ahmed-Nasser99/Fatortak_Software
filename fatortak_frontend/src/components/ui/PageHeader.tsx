import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  eyebrow?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  eyebrow,
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">
          {eyebrow}
        </p>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
