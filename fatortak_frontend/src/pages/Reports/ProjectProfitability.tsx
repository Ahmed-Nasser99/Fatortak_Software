import React, { useState } from "react";
import { useProjectProfitability } from "../../hooks/useFinancialReports";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency } from "../../Helpers/formatCurrency";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Download, ArrowLeft, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectProfitability: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { data: response, isLoading } = useProjectProfitability(fromDate || undefined, toDate || undefined);

  const handleExport = () => { /* Export logic */ };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? "ربحية المشاريع" : "Project Profitability"}</h1>
            <p className="text-sm text-gray-500">{isRTL ? "مقارنة إيرادات ومصروفات المشاريع" : "Comparison of project revenues vs expenses"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800/50 overflow-hidden shadow-sm">
          <CardHeader className="py-2 px-6 border-b border-gray-200/50 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي الإيرادات" : "Total Revenue"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-6 pb-6">
            <div className="text-2xl lg:text-3xl font-bold font-mono">
              {formatCurrency(response?.projects?.reduce((acc: number, p: any) => acc + (p.totalRevenue || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800/50 overflow-hidden shadow-sm">
          <CardHeader className="py-2 px-6 border-b border-gray-200/50 dark:border-white/5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{isRTL ? "إجمالي المصروفات" : "Total Expenses"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-6 pb-6">
            <div className="text-2xl lg:text-3xl font-bold font-mono">
              {formatCurrency(response?.projects?.reduce((acc: number, p: any) => acc + (p.totalExpenses || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800/50 overflow-hidden shadow-xl">
          <CardHeader className="py-2 px-6 border-b border-gray-200/50 dark:border-white/10">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300">{isRTL ? "صافي الربح" : "Net Profit"}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-6 pb-6">
            <div className="text-2xl lg:text-3xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {formatCurrency(response?.projects?.reduce((acc: number, p: any) => acc + (p.grossProfit || 0), 0) || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
           <CardTitle className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{isRTL ? "تفاصيل ربحية المشاريع" : "Project Profitability Details"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "المشروع" : "Project"}</TableHead>
                  <TableHead>{isRTL ? "العميل" : "Client"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "قيمة العقد" : "Budget"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "إجمالي الإيرادات" : "Revenue"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "إجمالي المصروفات" : "Expenses"}</TableHead>
                  <TableHead className="text-right font-bold">{isRTL ? "صافي الربح" : "Profit"}</TableHead>
                  <TableHead className="text-center">{isRTL ? "نسبة الربح" : "Margin %"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {response?.projects?.map((project: any) => (
                    <TableRow key={project.projectId}>
                      <TableCell className="font-medium">
                        <div className="font-bold">{project.projectName}</div>
                      </TableCell>
                      <TableCell className="text-gray-500 italic">
                        {project.clientName || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency(project.contractValue)}</TableCell>
                      <TableCell className="text-right font-mono text-green-600">{formatCurrency(project.totalRevenue)}</TableCell>
                      <TableCell className="text-right font-mono text-red-600">{formatCurrency(project.totalExpenses)}</TableCell>
                      <TableCell className="text-right font-mono font-bold">{formatCurrency(project.grossProfit)}</TableCell>
                      <TableCell className="text-center">
                         <div className={`px-2 py-1 rounded text-xs font-bold inline-block ${project.profitMargin >= 20 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {project.profitMargin.toFixed(1)}%
                         </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!response?.projects || response.projects.length === 0) && (
                    <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-500">No project data available</TableCell></TableRow>
                  )}
                </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectProfitability;
