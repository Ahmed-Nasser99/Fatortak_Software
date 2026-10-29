
import * as React from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

const ResponsiveTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isRTL } = useLanguage();
  
  return (
    <div 
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm",
        isRTL ? 'rtl' : 'ltr',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
      {...props}
    >
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full caption-bottom text-sm">
          {children}
        </table>
      </div>
    </div>
  )
})
ResponsiveTable.displayName = "ResponsiveTable"

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      "bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 [&_tr]:border-b", 
      className
    )} 
    {...props} 
  />
))
ResponsiveTableHeader.displayName = "ResponsiveTableHeader"

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0 [&_tr:hover]:bg-slate-50 dark:[&_tr:hover]:bg-slate-700", 
      className
    )}
    {...props}
  />
))
ResponsiveTableBody.displayName = "ResponsiveTableBody"

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-slate-200 dark:border-slate-700 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700",
      className
    )}
    {...props}
  />
))
ResponsiveTableRow.displayName = "ResponsiveTableRow"

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { isRTL } = useLanguage();
  
  return (
    <th
      ref={ref}
      className={cn(
        `h-12 px-6 ${isRTL ? 'text-end' : 'text-start'} align-middle font-bold text-slate-900 dark:text-white`,
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableHead.displayName = "ResponsiveTableHead"

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { isRTL } = useLanguage();
  
  return (
    <td
      ref={ref}
      className={cn(
        `p-6 align-middle ${isRTL ? 'text-end' : 'text-start'}`,
        className
      )}
      {...props}
    />
  )
})
ResponsiveTableCell.displayName = "ResponsiveTableCell"

// Mobile Card Component
const MobileCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "lg:hidden bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-4 shadow-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
MobileCard.displayName = "MobileCard"

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
  MobileCard,
}
