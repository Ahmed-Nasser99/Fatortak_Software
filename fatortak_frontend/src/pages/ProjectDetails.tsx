import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layout,
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
  User,
  FileText,
  Briefcase,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Info,
  Layers,
  FileSpreadsheet,
  Download,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "../hooks/useProjects";
import { projectService } from "../services/projectService";
import { useInvoices } from "../hooks/useInvoices";
import { useExpenses } from "../hooks/useExpenses";
import { useJournalEntries } from "../hooks/useAccounting";
import { ProjectStatus, JournalEntryReferenceType } from "../types/api";
import { formatDate, formatNumber } from "@/Helpers/localization";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import ExpenseModal from "../components/modals/ExpenseModal";
import EnhancedInvoiceModal from "../components/modals/EnhancedInvoiceModal";
import RecordPaymentModal from "../components/modals/RecordPaymentModal";
import { toast } from "react-toastify";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);

  const {
    data: projectResponse,
    isLoading: projectLoading,
    refetch: refetchProject,
  } = useProject(id!);
  const project = projectResponse?.data;

  // Data for tabs
  const {
    data: invoicesResponse,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
  } = useInvoices({ pageNumber: 1, pageSize: 100 }, { projectId: id });

  const {
    data: expensesResponse,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useExpenses({ pageNumber: 1, pageSize: 100 }, { projectId: id });

  const {
    data: paymentsResponse,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useJournalEntries(
    { pageNumber: 1, pageSize: 100 },
    { projectId: id, referenceType: JournalEntryReferenceType.Payment },
  );

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-gray-500"
      >
        <AlertCircle className="w-16 h-16 mb-4 text-rose-500" />
        <h2 className="text-2xl font-bold text-gray-900">Project Not Found</h2>
        <p className="mb-6">
          The project you're looking for doesn't exist or you don't have access.
        </p>
        <Button
          variant="default"
          className="bg-indigo-600"
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </Button>
      </motion.div>
    );
  }

  const handleExportPdf = async () => {
    if (!project) return;
    try {
      setIsExporting("pdf");
      await projectService.exportProjectPdf(project.id, project.name);
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Export PDF failed:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    if (!project) return;
    try {
      setIsExporting("excel");
      await projectService.exportProjectExcel(project.id, project.name);
      toast.success("Excel sheet generated successfully");
    } catch (error) {
      console.error("Export Excel failed:", error);
      toast.error("Failed to generate Excel sheet");
    } finally {
      setIsExporting(null);
    }
  };

  const invoices = invoicesResponse?.data?.data || [];
  const salesInvoices = invoices.filter(
    (inv) =>
      inv.invoiceType?.toLowerCase() === "sales" ||
      inv.invoiceType?.toLowerCase() === "sell" ||
      inv.invoiceType?.toLowerCase() === "sale",
  );
  const purchaseInvoices = invoices.filter(
    (inv) =>
      inv.invoiceType?.toLowerCase() === "purchase" ||
      inv.invoiceType?.toLowerCase() === "buy",
  );

  const expenses = expensesResponse?.data?.data || [];
  const allPayments = paymentsResponse?.data?.data || [];

  // Revenue Collections: Entries that CREDIT Accounts Receivable (1200 series)
  const revenuePayments = allPayments.filter((p) =>
    p.lines.some((l) => l.accountCode.startsWith("120") && l.credit > 0),
  );

  // Supplier Payments: Entries that CREDIT Cash/Bank (1000/1100 series) for Purchase Invoices
  const supplierPayments = allPayments.filter((p) =>
    p.lines.some(
      (l) =>
        (l.accountCode.startsWith("100") ||
          l.accountCode.startsWith("110") ||
          l.accountCode.startsWith("101")) &&
        l.credit > 0,
    ),
  );

  // Financial Stats from Backend
  const invoicedAmount = project.totalInvoiced || 0;
  const collectedAmount = project.totalCollected || 0;
  const totalPaidOut = project.totalPaid || 0;
  const totalExpenses = project.totalExpenses || 0;
  const totalAdvances = project.totalAdvances || 0;
  const totalCosts = totalExpenses + totalAdvances;
  const netProfit = project.netProfit || 0;
  const profitMargin =
    invoicedAmount > 0 ? (netProfit / invoicedAmount) * 100 : 0;
  const collectionPercentage =
    invoicedAmount > 0 ? (collectedAmount / invoicedAmount) * 100 : 0;
  
  const vatAmount = project.includeVat ? project.contractValue * (project.vatRate || 0) : 0;
  const netValue = project.contractValue - (project.discount || 0) + vatAmount;
  const totalRemaining = Math.max(0, netValue - collectedAmount);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1">
            Active
          </Badge>
        );
      case ProjectStatus.Completed:
        return (
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
            Completed
          </Badge>
        );
      case ProjectStatus.OnHold:
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-100 px-3 py-1">
            On Hold
          </Badge>
        );
      case ProjectStatus.Cancelled:
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-100 px-3 py-1">
            Cancelled
          </Badge>
        );
      case ProjectStatus.Settled:
        return (
          <Badge className="bg-cyan-50 text-cyan-700 border-cyan-100 px-3 py-1">
            Settled
          </Badge>
        );
      case ProjectStatus.Archived:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-100 px-3 py-1">
            Archived
          </Badge>
        );
      case ProjectStatus.NotStarted:
        return (
          <Badge className="bg-slate-50 text-slate-700 border-slate-100 px-3 py-1">
            Not Started
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-700 px-3 py-1">Draft</Badge>
        );
    }
  };

  const ExecutiveStat = ({ title, value, icon: Icon, detail }: any) => (
    <Card className="relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {title}
            </p>
            <h3 className="text-2xl font-black font-mono tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors">
              {formatNumber(value)}{" "}
              <span className="text-xs font-normal text-slate-400">EGP</span>
            </h3>
            {detail && <div className="mt-2">{detail}</div>}
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20 -z-10" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/projects")}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                {getStatusBadge(project.status)}
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-4 h-4" />
                <span>{project.customerName || "Internal Project"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              disabled={isExporting !== null}
              className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 px-4 shadow-sm"
              onClick={handleExportPdf}
            >
              <FileText className={`w-4 h-4 text-rose-500 ${isExporting === "pdf" ? "animate-pulse" : ""}`} />
              <span className="text-slate-700">{isExporting === "pdf" ? "Exporting..." : "Export PDF"}</span>
            </Button>
            <Button
              variant="outline"
              disabled={isExporting !== null}
              className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 px-4 shadow-sm"
              onClick={handleExportExcel}
            >
              <FileSpreadsheet className={`w-4 h-4 text-emerald-500 ${isExporting === "excel" ? "animate-pulse" : ""}`} />
              <span className="text-slate-700">{isExporting === "excel" ? "Exporting..." : "Export Excel"}</span>
            </Button>
            {project.status !== ProjectStatus.Completed &&
              project.status !== ProjectStatus.Cancelled && (
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 rounded-xl px-4 shadow-md shadow-indigo-200"
                  onClick={() =>
                    navigate(`/projects/edit-with-contract/${project.id}`)
                  }
                >
                  Edit Project
                </Button>
              )}
          </div>
        </div>

        {/* Hero Financials */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
          <ExecutiveStat
            title="Contract Value"
            value={project.contractValue}
            icon={Briefcase}
          />
          <ExecutiveStat
            title="Discount"
            value={project.discount || 0}
            icon={TrendingUp}
            className="text-rose-600"
          />
          <ExecutiveStat
            title="Net Value"
            value={project.contractValue - (project.discount || 0)}
            icon={DollarSign}
          />
          <ExecutiveStat
            title="Total Paid"
            value={collectedAmount}
            icon={TrendingUp}
            detail={
// ... existing code ...
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Invoiced</span>
                  <span>{formatNumber(invoicedAmount)}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${collectionPercentage}%` }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            }
          />
          <ExecutiveStat
            title="Total Remaining"
            value={totalRemaining}
            icon={Receipt}
            detail={
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-flex tracking-wider uppercase">
                  Pending Collection
                </span>
              </div>
            }
          />
          <ExecutiveStat
            title="Total Costs"
            value={totalCosts}
            icon={DollarSign}
            detail={
              <div className="flex flex-col gap-1 text-[9px] font-bold uppercase tracking-tight">
                <div className="flex justify-between text-slate-500">
                  <span>Accrued: {formatNumber(totalExpenses)}</span>
                </div>
                <div className="flex justify-between text-rose-500">
                  <span>Paid: {formatNumber(totalPaidOut)}</span>
                </div>
              </div>
            }
          />
          <ExecutiveStat
            title="Net Profit"
            value={netProfit}
            icon={TrendingUp}
            detail={
              <div className="flex items-center gap-1">
                {netProfit >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-400" />
                )}
                <span
                  className={`text-xs font-bold ${netProfit >= 0 ? "text-slate-600" : "text-rose-600"}`}
                >
                  {profitMargin.toFixed(1)}% Margin
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <div className="flex justify-center mb-10">
          <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-sm backdrop-blur-sm">
            {[
              { id: "overview", label: "Overview", icon: Layout },
              { id: "payments", label: "Payments", icon: Receipt },
              { id: "expenses", label: "Expenses", icon: DollarSign },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="group relative px-6 py-2.5 rounded-xl data-[state=active]:text-slate-900 text-slate-500 font-bold uppercase tracking-widest text-[10px] transition-all shadow-none h-auto bg-transparent gap-2 flex items-center border-none"
              >
                <tab.icon
                  className={`w-3.5 h-3.5 relative z-10 transition-colors ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                />
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/50"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content: Document Details */}
                <Card className="md:col-span-2 border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                  <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      Contract Details & Items
                    </div>
                  </div>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-slate-50/30 text-slate-500 font-semibold border-b border-slate-100">
                            <th className="py-4 px-6">
                              Service/Product Description
                            </th>
                            <th className="py-4 px-3 text-center w-24">QTY</th>
                            <th className="py-4 px-3 text-center w-24">Unit</th>
                            <th className="py-4 px-4 text-right w-32">
                              Unit Price
                            </th>
                            <th className="py-4 px-6 text-right w-40">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {!project.projectLines ||
                          project.projectLines.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-12 text-center text-slate-400 italic"
                              >
                                No line items specified for this project.
                              </td>
                            </tr>
                          ) : (
                            (() => {
                              const groupedMap = new Map();
                              const sectionOrder = [];
                              (project.projectLines || []).forEach((line) => {
                                const secName = line.sectionName || "General Works";
                                if (!groupedMap.has(secName)) {
                                  groupedMap.set(secName, []);
                                  sectionOrder.push(secName);
                                }
                                groupedMap.get(secName).push(line);
                              });

                              const grouped = sectionOrder.map((name) => ({
                                sectionName: name,
                                lines: groupedMap.get(name),
                              }));
                              
                              let globalIndex = 0;
                              return grouped.map((group, gIdx) => (
                                <React.Fragment key={gIdx}>
                                  <tr className="bg-[#cbd5e1] text-[#1e293b] font-bold text-sm">
                                    <td colSpan={5} className="py-2 px-6 text-left tracking-widest uppercase">
                                      {group.sectionName}
                                    </td>
                                  </tr>
                                  {group.lines.map(line => {
                                    const index = globalIndex++;
                                    return (
                                      <tr
                                        key={line.id}
                                        className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50/10"} hover:bg-indigo-50/30 transition-colors`}
                                      >
                                        <td className="py-4 px-6 font-medium text-slate-800">
                                          {line.description}
                                        </td>
                                        <td className="py-4 px-3 text-center text-slate-600 font-mono">
                                          {line.quantity}
                                        </td>
                                        <td className="py-4 px-3 text-center">
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] font-bold text-slate-500 bg-slate-50 border-slate-200"
                                          >
                                            {line.unit || "---"}
                                          </Badge>
                                        </td>
                                        <td className="py-4 px-4 text-right text-slate-600 font-mono tracking-tighter">
                                          {formatNumber(line.unitPrice)}
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-indigo-900 font-mono tracking-tighter">
                                          {formatNumber(line.lineTotal)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {/* Section Total Row */}
                                  <tr className="bg-[#1e293b] text-white font-bold text-sm">
                                    <td colSpan={4} className="py-2 px-6 text-right uppercase tracking-wider">
                                      Section Total
                                    </td>
                                    <td className="py-2 px-6 text-right font-mono bg-[#0f172a]">
                                      {formatNumber(
                                        group.lines.reduce((acc, l) => acc + (l.lineTotal || 0), 0)
                                      )}
                                    </td>
                                  </tr>
                                </React.Fragment>
                              ));
                            })()
                          )}
                        </tbody>
                        {project.projectLines?.length > 0 && (
                          <tfoot>
                            <tr className="bg-slate-50 font-bold border-t border-slate-200">
                              <td
                                colSpan={4}
                                className="py-4 px-6 text-right text-slate-700 uppercase tracking-wider text-xs"
                              >
                                Contract Sub-Total
                              </td>
                              <td className="py-4 px-6 text-right text-indigo-700 font-mono text-lg">
                                {formatNumber(project.contractValue)} EGP
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Sidebar: Metadata & Conditions */}
                <div className="space-y-6">
                  <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                    <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <Info className="w-4 h-4 text-indigo-500" /> Project
                        Metadata
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Description
                        </span>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {project.description ||
                            "Professional services as per technical offer."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Created On
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="w-3 h-3 text-indigo-400" />{" "}
                            {formatDate(project.createdAt)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Status
                          </span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${project.status === ProjectStatus.Active ? "bg-emerald-500" : "bg-slate-300"} animate-pulse`}
                            />
                            <span className="text-xs font-bold text-slate-700">
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {(project.paymentTerms || project.notes) && (
                    <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                      <CardHeader className="bg-indigo-50/30 pb-4 border-b border-indigo-50">
                        <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                          <FileText className="w-4 h-4 text-indigo-600" /> Terms
                          & Remarks
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        {project.paymentTerms && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Invoicing Scheme
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                              "{project.paymentTerms}"
                            </p>
                          </div>
                        )}
                        {project.notes && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Special Notes
                            </span>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-[11px] text-slate-500 font-medium whitespace-pre-wrap">
                              {project.notes}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-6">
                  <div className="flex flex-row items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">
                        Invoices & Requisition
                      </CardTitle>
                      <CardDescription>
                        Track all billing documents sent to the client.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-indigo-600 px-3 py-1">
                        {salesInvoices.length} Documents
                      </Badge>

                      {project.status !== ProjectStatus.Completed && project.status !== ProjectStatus.Cancelled && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            salesInvoices.length > 0 &&
                            salesInvoices[0].status === "Paid"
                          }
                          onClick={() => {
                            const unpaidInvoice = salesInvoices.find(
                              (inv) => inv.status !== "Paid",
                            );
                            if (unpaidInvoice) {
                              setSelectedInvoice(unpaidInvoice);
                              setIsRecordPaymentOpen(true);
                            } else {
                              toast.info("No pending invoices to pay.");
                            }
                          }}
                          className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 px-4 shadow-sm h-9"
                        >
                          <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
                          <span className="text-slate-700">Receive Payment</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 font-bold text-slate-500">
                        <tr>
                          <th className="py-5 px-6">Invoice ID</th>
                          <th className="py-5 px-4">Date</th>
                          <th className="py-5 px-4">Amount</th>
                          <th className="py-5 px-4 text-right">Paid</th>
                          <th className="py-5 px-4 text-right">Balance</th>
                          <th className="py-5 px-4">Status</th>
                          <th className="py-5 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {salesInvoices.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-16 text-center text-slate-400 italic"
                            >
                              No billing documents found for this project.
                            </td>
                          </tr>
                        ) : (
                          salesInvoices.map((inv) => (
                            <tr
                              key={inv.id}
                              className="hover:bg-slate-50/50 group transition-colors"
                            >
                              <td className="py-5 px-6">
                                <span
                                  className="font-bold text-indigo-600 group-hover:underline cursor-pointer"
                                  onClick={() => navigate(`/invoice/${inv.id}`)}
                                >
                                  {inv.invoiceNumber}
                                </span>
                              </td>
                              <td className="py-5 px-4 text-slate-600">
                                {formatDate(inv.issueDate)}
                              </td>
                              <td className="py-5 px-4 font-black font-mono tracking-tighter text-slate-900">
                                {formatNumber(inv.total)} EGP
                              </td>
                              <td className="py-5 px-4 text-right font-mono text-emerald-600 font-bold">
                                {formatNumber((inv as any).amountPaid || 0)}
                              </td>
                              <td className="py-5 px-4 text-right font-mono text-slate-500">
                                {formatNumber(
                                  inv.total - ((inv as any).amountPaid || 0),
                                )}
                              </td>
                              <td className="py-5 px-4">
                                <Badge
                                  variant={
                                    inv.status === "Paid"
                                      ? "outline"
                                      : "secondary"
                                  }
                                  className={
                                    inv.status === "Paid"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                      : inv.status === "PartialPaid"
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                        : ""
                                  }
                                >
                                  {inv.status}
                                </Badge>
                              </td>
                              <td className="py-5 px-6 text-right flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setIsRecordPaymentOpen(true);
                                  }}
                                  disabled={inv.status === "Paid"}
                                  className="text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                  title="Record Payment"
                                >
                                  <DollarSign className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => navigate(`/invoice/${inv.id}`)}
                                  className="text-indigo-600 hover:bg-indigo-50 rounded-xl"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Received Payments History */}
              <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Received Payments
                      </h3>
                      <p className="text-sm text-slate-500 font-medium tracking-tight">
                        Financial timeline of collected revenue from the client.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-900/5 rounded-2xl border border-emerald-100 shadow-sm backdrop-blur-sm group hover:bg-emerald-900/10 transition-all duration-300">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest leading-none mb-1">
                        Project Liquidity
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-700 tracking-tighter leading-none">
                        {formatNumber(collectedAmount)}{" "}
                        <span className="text-[10px] font-normal opacity-70">
                          EGP
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 font-bold text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="py-5 px-6 uppercase tracking-wider text-[10px]">
                          Date
                        </th>
                        <th className="py-5 px-4 uppercase tracking-wider text-[10px]">
                          Transaction Id
                        </th>
                        <th className="py-5 px-4 uppercase tracking-wider text-[10px]">
                          Reference / Note
                        </th>
                        <th className="py-5 px-4 text-center uppercase tracking-wider text-[10px]">
                          Payment Method
                        </th>
                        <th className="py-5 px-4 text-center uppercase tracking-wider text-[10px]">
                          Status
                        </th>
                        <th className="py-5 px-4 text-center uppercase tracking-wider text-[10px]">
                          Attachment
                        </th>
                        <th className="py-5 px-6 text-right uppercase tracking-wider text-[10px]">
                          Amount Received
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {revenuePayments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center opacity-40">
                              <Receipt className="w-12 h-12 mb-3 text-slate-300" />
                              <p className="text-slate-500 italic font-medium">
                                No revenue payments received yet.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        revenuePayments.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-emerald-50/20 group transition-all duration-300"
                          >
                            <td className="py-5 px-6">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">
                                  {formatDate(p.date)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(p.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-4">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px] bg-slate-50 border-slate-200 text-slate-600 py-0.5"
                              >
                                {p.entryNumber}
                              </Badge>
                            </td>
                            <td className="py-5 px-4 max-w-sm">
                              <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                {p.description || "Customer payment collection"}
                              </p>
                            </td>
                            <td className="py-5 px-4 text-center">
                              <Badge variant="outline" className="font-mono text-[10px] bg-slate-50 border-slate-200 text-slate-600">
                                {(p as any).paymentMethod || "Cash"}
                              </Badge>
                            </td>
                            <td className="py-5 px-4 text-center">
                              <Badge 
                                variant={
                                  (p as any).status === 'Bounced' || (p as any).status === 'Rejected' ? 'outline' : 
                                  'secondary'
                                }
                                className={
                                  (p as any).status === 'Bounced' || (p as any).status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                  (p as any).status === 'UnderCollection' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }
                              >
                                {(p as any).status || "Completed"}
                              </Badge>
                            </td>
                            <td className="py-5 px-4 text-center">
                              {p.attachmentUrl && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${p.attachmentUrl}`, '_blank')}
                                  className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 data-[state=open]:bg-indigo-50 rounded-lg p-2 h-auto"
                                >
                                  <Paperclip className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                            <td className="py-5 px-6 text-right">
                              <div className="flex flex-col items-end">
                                <span className="font-black font-mono text-lg text-emerald-600 tracking-tighter">
                                  {formatNumber(p.totalCredit)}{" "}
                                  <span className="text-[10px] font-normal opacity-70">
                                    EGP
                                  </span>
                                </span>
                                <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-tighter">
                                  Verified Collection
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses">
              <div className="space-y-8">
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-6">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>
                        <CardTitle className="text-xl font-bold text-slate-900">
                          Direct Project Expenses
                        </CardTitle>
                        <CardDescription>
                          Costs associated with procurement, labor, and
                          logistics.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-rose-500 px-3 py-1">
                          {expenses.length} Records
                        </Badge>
                        {project.status !== ProjectStatus.Completed && project.status !== ProjectStatus.Cancelled && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpenseModalOpen(true)}
                            className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 px-4 shadow-sm h-9"
                          >
                            <Plus className="w-4 h-4 text-rose-500" />{" "}
                            <span className="text-slate-700">Add Expense</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 font-bold text-slate-500">
                          <tr>
                            <th className="py-5 px-6">Date</th>
                            <th className="py-5 px-4">Cost Center</th>
                            <th className="py-5 px-4">Activity / Note</th>
                            <th className="py-5 px-4 text-center">Attachment</th>
                            <th className="py-5 px-6 text-right">
                              Debit Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {expenses.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-16 text-center text-slate-400 italic"
                              >
                                Zero expenses recorded.
                              </td>
                            </tr>
                          ) : (
                            expenses.map((exp) => (
                              <tr
                                key={exp.id}
                                className="hover:bg-rose-50/10 transition-colors"
                              >
                                <td className="py-5 px-6 text-slate-600">
                                  {formatDate(exp.date)}
                                </td>
                                <td className="py-5 px-4 font-bold text-slate-800">
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-50 border-slate-200"
                                  >
                                    {exp.categoryName}
                                  </Badge>
                                </td>
                                <td className="py-5 px-4 text-slate-500 italic max-w-xs truncate">
                                  {exp.notes || "Project related expense"}
                                </td>
                                <td className="py-5 px-4 text-center">
                                  {exp.attachmentUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${exp.attachmentUrl}`, '_blank')}
                                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 data-[state=open]:bg-indigo-50 rounded-lg p-2 h-auto"
                                    >
                                      <Paperclip className="w-4 h-4" />
                                    </Button>
                                  )}
                                </td>
                                <td className="py-5 px-6 text-right font-black font-mono tracking-tighter text-rose-600">
                                  {formatNumber(exp.total)} EGP
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Invoices Section */}
                <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-white border-b border-slate-100 flex flex-row items-center justify-between py-6">
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900">
                        Purchase Documents
                      </CardTitle>
                      <CardDescription>
                        Invoices received from suppliers for project materials.
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500 px-3 py-1">
                      {purchaseInvoices.length} Documents
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 font-bold text-slate-500">
                          <tr>
                            <th className="py-5 px-6">Invoice ID</th>
                            <th className="py-5 px-4">Date</th>
                            <th className="py-5 px-4">Amount</th>
                            <th className="py-5 px-4 text-right">Paid</th>
                            <th className="py-5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {purchaseInvoices.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-16 text-center text-slate-400 italic"
                              >
                                No purchase documents found.
                              </td>
                            </tr>
                          ) : (
                            purchaseInvoices.map((inv) => (
                              <tr
                                key={inv.id}
                                className="hover:bg-slate-50/50 group transition-colors"
                              >
                                <td className="py-5 px-6">
                                  <span
                                    className="font-bold text-amber-600 group-hover:underline cursor-pointer"
                                    onClick={() =>
                                      navigate(`/invoice/${inv.id}`)
                                    }
                                  >
                                    {inv.invoiceNumber}
                                  </span>
                                </td>
                                <td className="py-5 px-4 text-slate-600">
                                  {formatDate(inv.issueDate)}
                                </td>
                                <td className="py-5 px-4 font-black font-mono tracking-tighter text-slate-900">
                                  {formatNumber(inv.total)} EGP
                                </td>
                                <td className="py-5 px-4 text-right font-mono text-emerald-600 font-bold">
                                  {formatNumber((inv as any).amountPaid || 0)}
                                </td>
                                <td className="py-5 px-4">
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-100"
                                  >
                                    {inv.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Supplier Payments History */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          Payments to Suppliers
                        </h3>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">
                          History of outbound payments made against purchase
                          invoices.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-rose-900/5 rounded-2xl border border-rose-100 shadow-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest leading-none mb-1">
                          Outbound Cash
                        </span>
                        <span className="text-xl font-black font-mono text-rose-700 tracking-tighter leading-none">
                          {formatNumber(totalPaidOut)}{" "}
                          <span className="text-[10px] font-normal opacity-70">
                            EGP
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50/50 font-bold text-slate-500 border-b border-slate-100">
                        <tr>
                          <th className="py-5 px-6 uppercase tracking-wider text-[10px]">
                            Date
                          </th>
                          <th className="py-5 px-4 uppercase tracking-wider text-[10px]">
                            Transaction
                          </th>
                          <th className="py-5 px-4 uppercase tracking-wider text-[10px]">
                            Reference / Note
                          </th>
                          <th className="py-5 px-4 text-center uppercase tracking-wider text-[10px]">
                            Attachment
                          </th>
                          <th className="py-5 px-6 text-right uppercase tracking-wider text-[10px]">
                            Amount Paid
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {supplierPayments.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="py-20 text-center text-slate-400 italic"
                            >
                              No outbound payments recorded yet.
                            </td>
                          </tr>
                        ) : (
                          supplierPayments.map((p) => (
                            <tr
                              key={p.id}
                              className="hover:bg-rose-50/20 group transition-all duration-300"
                            >
                              <td className="py-5 px-6">
                                <span className="font-bold text-slate-900">
                                  {formatDate(p.date)}
                                </span>
                              </td>
                              <td className="py-5 px-4">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-[10px] bg-slate-50 border-slate-200 text-slate-600"
                                >
                                  {p.entryNumber}
                                </Badge>
                              </td>
                              <td className="py-5 px-4">
                                <p className="text-xs font-medium text-slate-600 italic">
                                  {p.description || "Project related payment"}
                                </p>
                              </td>
                              <td className="py-5 px-4 text-center">
                                {p.attachmentUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'https://localhost:44338'}/${p.attachmentUrl}`, '_blank')}
                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 data-[state=open]:bg-indigo-50 rounded-lg p-2 h-auto"
                                  >
                                    <Paperclip className="w-4 h-4" />
                                  </Button>
                                )}
                              </td>
                              <td className="py-5 px-6 text-right">
                                <span className="font-black font-mono text-lg text-rose-600 tracking-tighter">
                                  {formatNumber(p.totalCredit)} EGP
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={() => {
          refetchProject();
          setIsExpenseModalOpen(false);
          toast.success("Expense added successfully");
        }}
        initialProjectId={id}
      />

      <EnhancedInvoiceModal
        isOpen={isInvoiceModalOpen}
        isSell={true}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          refetchProject();
          setIsInvoiceModalOpen(false);
          toast.success("Invoice added successfully");
        }}
        initialData={{ projectId: id }}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        invoice={selectedInvoice}
        onSuccess={() => {
          refetchProject();
          refetchInvoices();
          refetchPayments();
          refetchExpenses();
          setIsRecordPaymentOpen(false);
        }}
      />
    </motion.div>
  );
};

export default ProjectDetails;
