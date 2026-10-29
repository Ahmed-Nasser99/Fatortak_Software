
import { formatNumber } from "@/Helpers/localization";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Column {
  header: string;
  accessor: string;
  isCurrency?: boolean;
  isBadge?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
}

export const DataTable = ({ columns, data }: DataTableProps) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 hover:from-slate-100 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-700">
              {columns.map((column, index) => (
                <TableHead 
                  key={column.accessor}
                  className={`font-bold text-slate-900 dark:text-white ${
                    index === 0 ? 'pl-6' : ''
                  } ${index === columns.length - 1 ? 'pr-6' : ''}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow 
                key={rowIndex}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200 border-slate-200 dark:border-slate-700"
              >
                {columns.map((column, columnIndex) => (
                  <TableCell 
                    key={column.accessor}
                    className={`font-medium ${
                      columnIndex === 0 ? 'pl-6 font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                    } ${columnIndex === columns.length - 1 ? 'pr-6' : ''}`}
                  >
                    {column.isCurrency ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ${formatNumber(row[column.accessor])}
                      </span>
                    ) : column.isBadge ? (
                      <Badge
                        variant={row[column.accessor] === "VIP" ? "default" : "outline"}
                        className={`${
                          row[column.accessor] === "VIP" 
                            ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0" 
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {row[column.accessor]}
                      </Badge>
                    ) : (
                      row[column.accessor]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
