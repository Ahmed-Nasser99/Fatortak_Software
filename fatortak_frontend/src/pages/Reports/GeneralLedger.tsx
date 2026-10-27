import React, { useState } from "react";
import { useAccountLedger } from "../../hooks/useFinancialReports";
import { useAccounts } from "../../hooks/useAccounting";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatCurrency } from "../../Helpers/formatCurrency";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Loader2, Download, ArrowLeft, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GeneralLedger: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: accountsData } = useAccounts({ pageNumber: 1, pageSize: 1000 });
  const accounts = accountsData?.data?.data || [];
  
  const { data: response, isLoading } = useAccountLedger(selectedAccountId, fromDate, toDate);

  const handleExport = () => { /* Export logic */ };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/reports")}>
            <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isRTL ? "دفتر الأستاذ العام" : "General Ledger"}</h1>
            <p className="text-sm text-gray-500">{isRTL ? "كشف حركات الحساب التفصيلي" : "Detailed transaction history for an account"}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            {isRTL ? "تصدير" : "Export"}
          </Button>
        </div>
      </div>

      <Card className="bg-gray-50 dark:bg-gray-800/50 border-none shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[300px] flex flex-col gap-1">
            <Label className="text-xs">{isRTL ? "اختر الحساب" : "Select Account"}</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={isRTL ? "اختر حساباً..." : "Choose an account..."} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc: any) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.accountCode} - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{isRTL ? "من" : "From"}</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">{isRTL ? "إلى" : "To"}</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40" />
          </div>
        </CardContent>
      </Card>

      {!selectedAccountId ? (
        <div className="py-20 text-center flex flex-col items-center gap-4 border-2 border-dashed rounded-xl">
           <Search className="w-12 h-12 text-gray-300" />
           <p className="text-gray-500">{isRTL ? "يرجى اختيار حساب لعرض الحركة" : "Please select an account to view transactions"}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800/50 overflow-hidden">
              <CardHeader className="py-2 px-6 border-b border-gray-200/50 dark:border-white/5">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 font-mono">{isRTL ? "الرصيد الافتتاحي" : "Opening Balance"}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-6 pb-6">
                <div className="text-2xl lg:text-3xl font-bold font-mono">{formatCurrency(response?.openingBalance || 0)}</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-100 text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-white dark:border-gray-800/50 overflow-hidden shadow-xl">
              <CardHeader className="py-2 px-6 border-b border-gray-200/50 dark:border-white/10">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-300 font-mono">{isRTL ? "الرصيد الختامي" : "Closing Balance"}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 px-6 pb-6">
                <div className="text-2xl lg:text-3xl font-bold font-mono">{formatCurrency(response?.closingBalance || 0)}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{isRTL ? "تفاصيل الحركات" : "Transaction Details"}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">{isRTL ? "التاريخ" : "Date"}</TableHead>
                      <TableHead className="w-32">{isRTL ? "رقم القيد" : "Entry #"}</TableHead>
                      <TableHead>{isRTL ? "البيان" : "Description"}</TableHead>
                      <TableHead className="text-right w-32">{isRTL ? "مدين" : "Debit"}</TableHead>
                      <TableHead className="text-right w-32">{isRTL ? "دائن" : "Credit"}</TableHead>
                      <TableHead className="text-right w-32 font-bold">{isRTL ? "الرصيد" : "Balance"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {response?.entries?.map((entry: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs whitespace-nowrap">{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-xs font-mono font-bold text-blue-600">{entry.entryNumber}</TableCell>
                        <TableCell className="text-sm max-w-md overflow-hidden text-ellipsis">{entry.description}</TableCell>
                        <TableCell className="text-right font-mono text-green-600">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                        <TableCell className="text-right font-mono text-red-600">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                        <TableCell className="text-right font-mono font-bold bg-gray-50 dark:bg-gray-800/10">{formatCurrency(entry.runningBalance)}</TableCell>
                      </TableRow>
                    ))}
                    {(!response?.entries || response.entries.length === 0) && (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-gray-400">No transactions recorded in this period</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default GeneralLedger;
