import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Copy, Eye, MoreHorizontal, FileText, CheckCircle, XCircle, Search, RefreshCw, BadgeDollarSign, Wallet, Paperclip } from "lucide-react";
import { toast } from "react-toastify";
import { chequeService, ChequeDto, ChequeFilterDto } from "../services/chequeService";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLanguage } from "../contexts/LanguageContext";

export default function Cheques() {
  const { isRTL } = useLanguage();
  const [cheques, setCheques] = useState<ChequeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ChequeFilterDto>({
    status: "",
    pageNumber: 1,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);

  const fetchCheques = async () => {
    setLoading(true);
    try {
      const result = await chequeService.getCheques(filter);
      if (result.success) {
        setCheques(result.data.data);
        setTotalCount(result.data.totalCount);
      } else {
        toast.error("Failed to load cheques");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheques();
  }, [filter]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await chequeService.updateStatus(id, { status: newStatus });
      if (result.success) {
        toast.success(`Cheque status updated to ${newStatus}`);
        fetchCheques(); // Refresh list
      } else {
        toast.error(result.errorMessage || "Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "UnderCollection":
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Under Collection</Badge>;
      case "Deposited":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Deposited</Badge>;
      case "Bounced":
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Bounced</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cheques Management</h1>
          <p className="text-slate-500 mt-1">Track and manage all customer cheque payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchCheques} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 flex flex-wrap gap-4 items-end">
          <div className="space-y-1.5 w-[250px]">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter by Status
            </Label>
            <Select
              value={filter.status}
              onValueChange={(value) => setFilter({ ...filter, status: value === "All" ? "" : value, pageNumber: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="UnderCollection">Under Collection</SelectItem>
                <SelectItem value="Deposited">Deposited</SelectItem>
                <SelectItem value="Bounced">Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cheques List */}
      <div className="grid gap-4">
        {loading && cheques.length === 0 ? (
          <div className="py-20 flex justify-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : cheques.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No cheques found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-1">
              There are no cheques matching your current filters.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Cheque Number</th>
                    <th className="px-6 py-4">Bank Name</th>
                    <th className="px-6 py-4">Invoice</th>
                    <th className="px-6 py-4">Project Name</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4 text-center">Attachment</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cheques.map((cheque) => (
                    <tr key={cheque.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{cheque.chequeNumber}</span>
                          {cheque.paymentAccountName && (
                            <span className="text-xs text-indigo-600 font-medium">Acc: {cheque.paymentAccountName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{cheque.bankName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="secondary" className="font-mono text-xs">
                            {cheque.invoiceNumber}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {cheque.projectName ? (
                          <span className="text-sm text-slate-600 line-clamp-2 max-w-[200px]" title={cheque.projectName}>
                            {cheque.projectName}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">---</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {format(new Date(cheque.dueDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cheque.attachmentUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${cheque.attachmentUrl}`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 data-[state=open]:bg-indigo-50 rounded-lg p-2 h-auto"
                            title="View Attachment"
                          >
                            <Paperclip className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-slate-900">
                          {cheque.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(cheque.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4 text-slate-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                                onClick={() => {
                                    navigator.clipboard.writeText(cheque.chequeNumber);
                                    toast.success("Cheque number copied to clipboard");
                                }}
                            >
                              <Copy className="mr-2 h-4 w-4 text-slate-400" />
                              Copy Cheque #
                            </DropdownMenuItem>

                            {cheque.status === "UnderCollection" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(cheque.id, "Deposited")}
                                  className="text-emerald-600 focus:text-emerald-700"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark as Deposited
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusUpdate(cheque.id, "Bounced")}
                                  className="text-rose-600 focus:text-rose-700"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark as Bounced
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination placeholder if needed*/}
            {totalCount > filter.pageSize && (
              <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
                  <p>Showing {cheques.length} of {totalCount} cheques</p>
                  <div className="flex gap-2">
                       <Button 
                        variant="outline" 
                        size="sm"
                        disabled={filter.pageNumber === 1}
                        onClick={() => setFilter({...filter, pageNumber: filter.pageNumber - 1})}
                       >
                           Previous
                       </Button>
                       <Button 
                        variant="outline" 
                        size="sm"
                        disabled={filter.pageNumber * filter.pageSize >= totalCount}
                        onClick={() => setFilter({...filter, pageNumber: filter.pageNumber + 1})}
                       >
                           Next
                       </Button>
                  </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
