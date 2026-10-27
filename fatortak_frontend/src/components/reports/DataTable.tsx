
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
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 hover:from-gray-100 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-700">
              {columns.map((column, index) => (
                <TableHead 
                  key={column.accessor}
                  className={`font-bold text-gray-900 dark:text-white ${
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
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 border-gray-200 dark:border-gray-700"
              >
                {columns.map((column, columnIndex) => (
                  <TableCell 
                    key={column.accessor}
                    className={`font-medium ${
                      columnIndex === 0 ? 'pl-6 font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
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
                            : "border-gray-300 dark:border-gray-600"
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
