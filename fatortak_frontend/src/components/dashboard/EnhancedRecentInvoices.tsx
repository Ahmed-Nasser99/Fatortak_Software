import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileText,
  Eye,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  DollarSign,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RecentInvoice } from "@/hooks/useDashboardReport";
import { format } from "date-fns";
import { formatCurrency } from "@/Helpers/formatCurrency";

interface EnhancedRecentInvoicesProps {
  recentInvoices: RecentInvoice[];
}

export const EnhancedRecentInvoices = ({
  recentInvoices,
}: EnhancedRecentInvoicesProps) => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      case "sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getInvoiceTypeColor = (type: string) => {
    return type?.toLowerCase() === "sell"
      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div
          className={`flex items-center justify-between ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {t("recentInvoices")}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest invoice activities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/invoices")}
              className="text-blue-600 hover:text-blue-700 gap-2"
            >
              <Eye className="w-4 h-4" />
              {t("viewAll")}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {recentInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t("getStartedByCreatingNewInvoice")}
            </p>
            <Button
              onClick={() => navigate("/invoices")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Create Invoice
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className={`group p-4 bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-700 dark:to-gray-800/50 rounded-xl border border-gray-200/60 dark:border-gray-600/60 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Badge
                        className={`absolute -top-1 -right-1 text-xs px-1 py-0 ${getInvoiceTypeColor(
                          invoice.invoiceType
                        )}`}
                      >
                        {invoice.invoiceType?.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </h4>
                        <Badge className={getStatusColor(invoice.status)}>
                          {t(`${invoice.status?.toLowerCase()}Status`) ||
                            invoice.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {invoice.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-4 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className={`text-right ${isRTL ? "text-left" : ""}`}>
                      <div className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-white">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(invoice.total)}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isRTL ? "تاريخ الاستحقاق" : "Due Date"}:{" "}
                        {format(new Date(invoice.dueDate), "MMM dd")}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
