import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InvoiceDto } from "../../types/api";
import { invoiceService } from "../../services/invoiceService";
import { toast } from "react-toastify";
import { DollarSign, CreditCard, Wallet, Landmark, FileText, CheckSquare } from 'lucide-react';
import DataSourceSelector from '../ui/DataSourceSelector';
import { useAccounts } from '../../hooks/useAccounting';
import { formatNumber } from '../../Helpers/localization';
import { useLanguage } from '../../contexts/LanguageContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceDto | null;
  onSuccess: () => void;
}

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ isOpen, onClose, invoice, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [paymentAccountId, setPaymentAccountId] = useState<string>("");
  const [chequeNumber, setChequeNumber] = useState<string>("");
  const [chequeBankName, setChequeBankName] = useState<string>("");
  const [chequeDueDate, setChequeDueDate] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const { data: accountsResponse } = useAccounts({ pageNumber: 1, pageSize: 1000 }, { isActive: true });
  const accounts = accountsResponse?.data?.data || [];

  React.useEffect(() => {
    if (invoice) {
      // Default to remaining balance
      const paidSoFar = (invoice as any).amountPaid || 0;
      setAmount(invoice.total - paidSoFar);
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;

    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    const remainingBalance = invoice.total - ((invoice as any).amountPaid || 0);
    if (amount > remainingBalance + 0.01) {
      toast.error(`Amount exceeds remaining balance of ${remainingBalance}`);
      return;
    }

    // Account Balance Validation for Purchase Invoices
    if (isPurchaseInvoice && paymentAccountId) {
      const selectedAccount = accounts.find(a => a.id === paymentAccountId);
      if (selectedAccount && selectedAccount.balance !== undefined && selectedAccount.balance < amount) {
        toast.error(`${isRTL ? "رصيد غير كافٍ في" : "Insufficient funds in"} ${selectedAccount.name}. ${isRTL ? "المتاح" : "Available"}: ${formatNumber(selectedAccount.balance)} EGP`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        amount,
        paymentMethod,
        paymentAccountId: paymentAccountId || undefined,
        attachment: attachment || undefined,
        paymentDate: paymentDate ? new Date(paymentDate).toISOString() : undefined
      };

      if (paymentMethod === "Cheque") {
        payload.chequeNumber = chequeNumber;
        payload.chequeBankName = chequeBankName;
        payload.chequeDueDate = chequeDueDate ? new Date(chequeDueDate).toISOString() : undefined;
      }

      const result = await invoiceService.recordPayment(invoice.id, payload);

      if (result.success) {
        toast.success("Payment recorded successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(result.errorMessage || "Failed to record payment");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while recording payment");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) return null;

  const remainingBalance = invoice.total - ((invoice as any).amountPaid || 0);
  const isPurchaseInvoice = invoice.invoiceType?.toLowerCase() === "buy" || invoice.invoiceType?.toLowerCase() === "purchase";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Record Payment - {invoice.invoiceNumber}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Total Amount</span>
              <span className="font-mono">{invoice.total.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Remaining Balance</span>
              <span className="font-mono font-bold text-slate-900">{remainingBalance.toLocaleString()} EGP</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  EGP
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  placeholder="Enter amount"
                  className="pl-12 font-mono text-lg font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isRTL ? "تاريخ الدفع" : "Payment Date"}
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Method
              </Label>
              <Select 
                value={paymentMethod} 
                onValueChange={(val) => {
                  setPaymentMethod(val);
                  setPaymentAccountId(""); // Clear the payment account when the method changes so the user selects a new valid one
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank">Bank Transfer</SelectItem>
                  {!isPurchaseInvoice && <SelectItem value="Cheque">Cheque</SelectItem>}
                  {isPurchaseInvoice && <SelectItem value="EmployeeAdvance">Employee Advance</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "Cheque" && (
              <div className="space-y-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="space-y-2">
                  <Label htmlFor="chequeNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cheque Number
                  </Label>
                  <Input
                    id="chequeNumber"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="Enter cheque number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeBankName" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bank Name
                  </Label>
                  <Input
                    id="chequeBankName"
                    value={chequeBankName}
                    onChange={(e) => setChequeBankName(e.target.value)}
                    placeholder="Enter bank name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chequeDueDate" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Due Date
                  </Label>
                  <Input
                    id="chequeDueDate"
                    type="date"
                    value={chequeDueDate}
                    onChange={(e) => setChequeDueDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="account" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Payment Account
              </Label>
              <DataSourceSelector
                value={paymentAccountId}
                onChange={setPaymentAccountId}
                paymentMethod={paymentMethod}
              />
              {isPurchaseInvoice && paymentAccountId && (() => {
                const acc = accounts.find(a => a.id === paymentAccountId);
                if (acc && (acc.balance || 0) < amount) {
                  return (
                    <p className="text-[10px] text-red-600 font-bold mt-1 animate-pulse flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {isRTL ? "رصيد غير كافٍ" : "Insufficient balance"}
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attachment (Optional)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="attachment"
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                  className="cursor-pointer file:cursor-pointer file:border-0 file:bg-indigo-50 file:text-indigo-700 file:text-xs file:font-bold file:px-3 file:h-full"
                />
                {attachment && (
                   <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8"
            >
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordPaymentModal;
