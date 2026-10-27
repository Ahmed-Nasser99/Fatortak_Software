"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency } from "@/Helpers/formatCurrency";
import { formatDate } from "@/Helpers/localization";
import {
  Receipt,
  Calendar,
  Tag,
  FileText,
  X,
  Download,
  Edit,
  Trash2,
} from "lucide-react";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: any;
}

const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expense,
}) => {
  const { t, isRTL } = useLanguage();

  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            {isRTL ? "تفاصيل المصروف" : "Expense Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{expense?.type}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amount Section */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? "المبلغ" : "Amount"}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    -{formatCurrency(expense.amount)}{" "}
                    {expense.currency || "EGP"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Section */}
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {isRTL ? "التفاصيل" : "Details"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "التاريخ" : "Date"}
                    </p>
                    <p>{formatDate(expense.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? "الحالة" : "Status"}
                    </p>
                    <p className="capitalize">
                      {expense.status || "Completed"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              {isRTL ? "إغلاق" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDetailsModal;
