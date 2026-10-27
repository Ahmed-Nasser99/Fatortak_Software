import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle,
  FileText,
  Download,
  AlertTriangle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { toast } from "react-toastify";
import { payrollService, PayrollDto, PayrollItemDto } from "../services/payrollService";
import { formatDate, formatNumber } from "@/Helpers/localization";

const Payroll: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [payrolls, setPayrolls] = useState<PayrollDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollDto | null>(null);
  const [payrollToSubmit, setPayrollToSubmit] = useState<PayrollDto | null>(null);
  
  // Generation Form State
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
  const [calculationMethod, setCalculationMethod] = useState("MainSalary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const result = await payrollService.getAll();
      if (result.success && result.data) {
        setPayrolls(result.data);
      } else {
        toast.error(result.errorMessage || t("failedToLoadPayrolls"));
      }
    } catch (error) {
      toast.error(t("errorLoadingPayrolls"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, []);

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    try {
      const result = await payrollService.generate({
        month: generateMonth,
        year: generateYear,
        calculationMethod,
        isGlobal: true,
      });

      if (result.success) {
        toast.success(t("payrollGeneratedSuccessfully"));
        setIsGenerateModalOpen(false);
        fetchPayrolls();
      } else {
        toast.error(result.errorMessage || t("failedToGeneratePayroll"));
      }
    } catch (error) {
      toast.error(t("errorGeneratingPayroll"));
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmSubmitPayroll = (payroll: PayrollDto) => {
    setPayrollToSubmit(payroll);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitPayroll = async () => {
    if (!payrollToSubmit) return;

    setIsSubmitting(true);
    try {
      const result = await payrollService.submit(payrollToSubmit.id);
      if (result.success) {
        toast.success(t("payrollSubmittedSuccessfully"));
        fetchPayrolls();
        setIsSubmitModalOpen(false);
        if (selectedPayroll?.id === payrollToSubmit.id) {
            setSelectedPayroll(result.data);
        }
      } else {
        toast.error(result.errorMessage || t("failedToSubmitPayroll"));
      }
    } catch (error) {
      toast.error(t("errorSubmittingPayroll"));
    } finally {
      setIsSubmitting(false);
      setPayrollToSubmit(null);
    }
  };

  const handleDeletePayroll = async (id: string) => {
    if (!window.confirm(t("confirmDeletePayroll"))) {
      return;
    }

    try {
      const result = await payrollService.delete(id);
      if (result.success) {
        toast.success(t("payrollDeletedSuccessfully"));
        fetchPayrolls();
      } else {
        toast.error(result.errorMessage || t("failedToDeletePayroll"));
      }
    } catch (error) {
      toast.error(t("errorDeletingPayroll"));
    }
  };

  const openDetails = async (payroll: PayrollDto) => {
    setIsLoading(true);
    try {
      const result = await payrollService.getById(payroll.id);
      if (result.success && result.data) {
        setSelectedPayroll(result.data);
        setIsDetailsModalOpen(true);
      } else {
        toast.error(result.errorMessage || t("failedToLoadPayrollDetails"));
      }
    } catch (error) {
      toast.error(t("errorLoadingPayrollDetails"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container !max-w-full mx-auto p-4 space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "مسير الرواتب" : "Payroll"}
                </h1>
                <p className="text-blue-100 text-lg">
                  {isRTL ? "إدارة رواتب الموظفين الشهرية" : "Manage monthly employee payrolls"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsGenerateModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                {isRTL ? "إنشاء مسير جديد" : "Generate Payroll"}
              </span>
            </Button>
          </div>
        </div>

        {/* Payrolls List */}
        <Card className="bg-card/60 backdrop-blur-sm border shadow-sm">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-4 text-start">{isRTL ? "الشهر/السنة" : "Month/Year"}</th>
                      <th className="p-4 text-start">{isRTL ? "إجمالي المبلغ" : "Total Amount"}</th>
                      <th className="p-4 text-start">{isRTL ? "الحالة" : "Status"}</th>
                      <th className="p-4 text-start">{isRTL ? "الإجراءات" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll) => (
                      <tr key={payroll.id} className="border-b hover:bg-muted/20 transition-colors">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatNumber(payroll.month)}/{formatNumber(payroll.year)}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-primary">
                          {formatCurrency(payroll.totalAmount)}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={payroll.status === "Submitted" ? "default" : "secondary"}
                            className={payroll.status === "Submitted" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {payroll.status === "Submitted" ? (isRTL ? "تم الاعتماد" : "Submitted") : (isRTL ? "مسودة" : "Draft")}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openDetails(payroll)} title={isRTL ? "عرض التفاصيل" : "View Details"}>
                              <Eye className="w-4 h-4 text-blue-500" />
                            </Button>
                            {payroll.status !== "Submitted" && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => confirmSubmitPayroll(payroll)} title={isRTL ? "اعتماد" : "Submit"}>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePayroll(payroll.id)} title={isRTL ? "حذف" : "Delete"}>
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {payrolls.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          {isRTL ? "لا توجد مسيرات رواتب" : "No payrolls found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generate Modal */}
        <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? "إنشاء مسير رواتب" : "Generate Payroll"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? "الشهر" : "Month"}</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth(Number(e.target.value))}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? "السنة" : "Year"}</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={generateYear}
                    onChange={(e) => setGenerateYear(Number(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{isRTL ? "طريقة الحساب" : "Calculation Method"}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors flex-1">
                    <input
                      type="radio"
                      name="method"
                      value="MainSalary"
                      checked={calculationMethod === "MainSalary"}
                      onChange={(e) => setCalculationMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-medium">{isRTL ? "الراتب الأساسي" : "Main Salary"}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50 transition-colors flex-1">
                    <input
                      type="radio"
                      name="method"
                      value="AttendanceBased"
                      checked={calculationMethod === "AttendanceBased"}
                      onChange={(e) => setCalculationMethod(e.target.value)}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="font-medium">{isRTL ? "بناءً على الحضور" : "Attendance Based"}</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={handleGeneratePayroll} disabled={isGenerating}>
                {isGenerating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : null}
                {isRTL ? "إنشاء" : "Generate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] w-full max-h-[90vh] overflow-y-auto p-0 gap-0">
            <div className="p-6 border-b bg-muted/10">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    {isRTL ? "تفاصيل مسير الرواتب" : "Payroll Details"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-base">
                    {isRTL ? "شهر" : "Month"} {selectedPayroll?.month} / {selectedPayroll?.year}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={selectedPayroll?.status === "Submitted" ? "default" : "secondary"}
                    className={`text-sm px-3 py-1 ${selectedPayroll?.status === "Submitted" ? "bg-green-500 hover:bg-green-600" : ""}`}
                  >
                    {selectedPayroll?.status === "Submitted" ? (isRTL ? "تم الاعتماد" : "Submitted") : (isRTL ? "مسودة" : "Draft")}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => setIsDetailsModalOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {selectedPayroll && (
              <div className="p-6 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          {isRTL ? "إجمالي الرواتب" : "Total Salaries"}
                        </p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                          {formatCurrency(selectedPayroll.totalAmount)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-100 dark:border-purple-900">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">
                          {isRTL ? "عدد الموظفين" : "Employees Count"}
                        </p>
                        <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                          {formatNumber(selectedPayroll.payrollItems.length)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  {selectedPayroll.status !== "Submitted" && (
                     <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-100 dark:border-emerald-900 flex items-center justify-center">
                      <CardContent className="p-6 w-full">
                        <Button 
                          onClick={() => confirmSubmitPayroll(selectedPayroll)} 
                          className="w-full h-full min-h-[60px] text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {isRTL ? "اعتماد المسير الآن" : "Submit Payroll Now"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Employees Table */}
                <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
                  <div className="bg-muted/50 p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {isRTL ? "قائمة الموظفين" : "Employees List"}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="p-4 text-start font-semibold text-muted-foreground">{isRTL ? "الموظف" : "Employee"}</th>
                          <th className="p-4 text-start font-semibold text-muted-foreground">{isRTL ? "الراتب الأساسي" : "Base Salary"}</th>
                          <th className="p-4 text-center font-semibold text-muted-foreground">{isRTL ? "أيام الحضور" : "Days Attended"}</th>
                          <th className="p-4 text-end font-semibold text-muted-foreground">{isRTL ? "الراتب المستحق" : "Calculated Salary"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedPayroll.payrollItems.map((item) => (
                          <tr key={item.id} className="hover:bg-muted/5 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {item.employeeName.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{item.employeeName}</span>
                              </div>
                            </td>
                            <td className="p-4 text-muted-foreground font-mono">
                              {formatCurrency(item.baseSalary)}
                            </td>
                            <td className="p-4 text-center">
                              <Badge variant="outline" className="bg-background">
                                {formatNumber(item.daysAttended)} {isRTL ? "يوم" : "days"}
                              </Badge>
                            </td>
                            <td className="p-4 text-end">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base font-mono">
                                {formatCurrency(item.calculatedSalary)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted/30 font-semibold">
                        <tr>
                          <td colSpan={3} className="p-4 text-end">{isRTL ? "الإجمالي الكلي" : "Grand Total"}</td>
                          <td className="p-4 text-end text-lg text-primary">
                            {formatCurrency(selectedPayroll.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Submit Confirmation Modal */}
        <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <DialogTitle className="text-center text-xl">
                {isRTL ? "تأكيد اعتماد المسير" : "Confirm Payroll Submission"}
              </DialogTitle>
              <DialogDescription className="text-center pt-2">
                {isRTL 
                  ? `هل أنت متأكد من رغبتك في اعتماد مسير الرواتب لشهر ${payrollToSubmit?.month}/${payrollToSubmit?.year}؟`
                  : `Are you sure you want to submit the payroll for ${payrollToSubmit?.month}/${payrollToSubmit?.year}?`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2 my-2">
              <p className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {isRTL ? "سيتم إنشاء قيد مصروفات بقيمة:" : "An expense record will be created for:"} 
                <span className="font-bold text-foreground">{payrollToSubmit && formatCurrency(payrollToSubmit.totalAmount)}</span>
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {isRTL ? "سيتم تسجيل معاملة مالية (خصم)." : "A financial transaction (debit) will be recorded."}
              </p>
              <p className="flex items-center gap-2 text-amber-600 font-medium mt-2">
                <AlertTriangle className="w-4 h-4" />
                {isRTL ? "لا يمكن التراجع عن هذا الإجراء." : "This action cannot be undone."}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsSubmitModalOpen(false)} className="w-full sm:w-auto">
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
              <Button 
                onClick={handleSubmitPayroll} 
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : null}
                {isRTL ? "تأكيد الاعتماد" : "Confirm Submission"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default Payroll;
