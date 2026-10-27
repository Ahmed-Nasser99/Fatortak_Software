import React, { useState } from "react";
import { useSalesReport } from "../../hooks/useFinancialReports";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency } from "../../Helpers/formatCurrency";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Download, ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SalesReport: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const { data: response, isLoading } = useSalesReport(fromDate, toDate);

  const handleExport = () => { /* Export logic */ };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? "تقرير المبيعات" : "Sales Report"}</h1>
            <p className="text-sm text-gray-500">{isRTL ? "ملخص المبيعات حسب العميل" : "Sales summary aggregated by customer"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{isRTL ? "من" : "From"}</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{isRTL ? "إلى" : "To"}</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800/50 overflow-hidden">
          <CardHeader className="py-1 px-4 border-b border-gray-200/50 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي المبيعات" : "Gross Sales"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="text-lg lg:text-xl font-bold font-mono">{formatCurrency(response?.totalAmount || 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800/50 overflow-hidden">
          <CardHeader className="py-1 px-4 border-b border-gray-200/50 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي الضرائب" : "Total Tax"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="text-lg lg:text-xl font-bold font-mono">{formatCurrency(response?.totalTax || 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800/50 overflow-hidden">
          <CardHeader className="py-1 px-4 border-b border-gray-200/50 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي الخصم" : "Total Discount"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="text-lg lg:text-xl font-bold font-mono text-red-600 dark:text-red-400">{formatCurrency(response?.totalDiscount || 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800/50 overflow-hidden shadow-xl">
          <CardHeader className="py-1 px-4 border-b border-gray-200/50 dark:border-white/10">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">{isRTL ? "صافي المبيعات" : "Net Sales"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 pb-4">
            <div className="text-lg lg:text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{formatCurrency(response?.netSales || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
           {isLoading ? <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isRTL ? "العميل" : "Customer"}</TableHead>
                    <TableHead className="text-center">{isRTL ? "عدد الفواتير" : "Invoices"}</TableHead>
                    <TableHead className="text-right">{isRTL ? "إجمالي المبلغ" : "Total Amount"}</TableHead>
                    <TableHead className="text-right">{isRTL ? "المحصل" : "Total Paid"}</TableHead>
                    <TableHead className="text-right font-bold">{isRTL ? "المتبقي" : "Remaining"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {response?.items?.map((item: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.customerName}</TableCell>
                      <TableCell className="text-center">{item.invoiceCount}</TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">{formatCurrency(item.totalPaid)}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-blue-600">{formatCurrency(item.totalRemaining)}</TableCell>
                    </TableRow>
                  ))}
                  {(!response?.items || response.items.length === 0) && (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-gray-500">No sales data found for this period</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReport;
