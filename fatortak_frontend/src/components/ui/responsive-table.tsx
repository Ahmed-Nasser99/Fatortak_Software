
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
        "w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm",
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
      "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 [&_tr]:border-b", 
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
      "[&_tr:last-child]:border-0 [&_tr:hover]:bg-gray-50 dark:[&_tr:hover]:bg-gray-700", 
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
      "border-b border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700",
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
        `h-12 px-6 ${isRTL ? 'text-right' : 'text-left'} align-middle font-bold text-gray-900 dark:text-white`,
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
        `p-6 align-middle ${isRTL ? 'text-right' : 'text-left'}`,
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
      "lg:hidden bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 shadow-sm",
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
