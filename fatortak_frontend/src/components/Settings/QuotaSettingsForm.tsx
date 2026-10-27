import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuotaUsage } from "@/hooks/useQuota";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Calendar,
  CreditCard,
  Users,
  Bot,
  FileText,
  Crown,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";

interface QuotaUsage {
  plan: string;
  isYearly: boolean;
  startDate: string;
  endDate: string;
  aiUsed: number;
  aiLimit: number;
  remainingAi: number;
  invoicesThisMonth: number;
  invoiceLimit: number;
  remainingInvoices: number;
  users: number;
  userLimit: number;
  remainingUsers: number;
}

const QuotaSettingsForm: React.FC = () => {
  const { data: quotaUsage, isLoading, error } = useQuotaUsage();
  const { isRTL, t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !quotaUsage) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 rounded-2xl overflow-hidden">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {isRTL
              ? "خطأ في تحميل معلومات الحصة النسبية"
              : "Failed to Load Quota Information"}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {isRTL
              ? "لا يمكن الوصول إلى معلومات حصتك النسبية في الوقت الحالي. يرجى المحاولة لاحقاً."
              : "Unable to access your quota information at this time. Please try again later."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    plan,
    isYearly,
    startDate,
    endDate,
    aiUsed,
    aiLimit,
    remainingAi,
    invoicesThisMonth,
    invoiceLimit,
    remainingInvoices,
    users,
    userLimit,
    remainingUsers,
  } = quotaUsage as QuotaUsage;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const UsageCard = ({ 
    title, 
    used, 
    limit, 
    remaining, 
    color,
    percentage
  }: { 
    title: string; 
    used: number; 
    limit: number; 
    remaining: number; 
    color: string;
    percentage: number;
  }) => (
    <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl relative group h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
            {title}
          </CardTitle>
          <Badge variant="outline" className="font-bold text-xs border-muted text-muted-foreground">
            {remaining} {isRTL ? "متبقي" : "Left"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-black text-foreground">{used}</span>
          <span className="text-sm text-muted-foreground font-bold">/ {limit}</span>
        </div>
        <Progress 
          value={percentage} 
          className="h-2 mb-2 bg-muted/50" 
          indicatorClassName={
            percentage > 90 ? "bg-destructive" : 
            percentage > 70 ? "bg-amber-500" : 
            `bg-gradient-to-r ${color}`
          }
        />
        <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-black text-muted-foreground/60 mt-2">
          <span>{percentage.toFixed(0)}% {isRTL ? "مستخدم" : "Used"}</span>
          <span>{limit} {isRTL ? "الإجمالي" : "Limit"}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Plan Header Info */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-foreground tracking-tight">{plan}</h2>
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                  {isYearly ? (isRTL ? "سنوي" : "Yearly") : (isRTL ? "شهري" : "Monthly")}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm font-bold flex items-center gap-2">
                {formatDate(startDate)} — {formatDate(endDate)}
              </p>
            </div>
          </div>
          <button className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 text-sm uppercase tracking-widest">
            <span>{isRTL ? "ترقية الخطة" : "Upgrade Plan"}</span>
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Usage Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UsageCard 
          title={isRTL ? "طلبات الذكاء الصناعي" : "AI Requests"}
          used={aiUsed}
          limit={aiLimit}
          remaining={remainingAi}
          percentage={(aiUsed / aiLimit) * 100}
          color="from-indigo-500 to-indigo-600"
        />
        <UsageCard 
          title={isRTL ? "الفواتير المصدرة" : "Invoices Created"}
          used={invoicesThisMonth}
          limit={invoiceLimit}
          remaining={remainingInvoices}
          percentage={(invoicesThisMonth / invoiceLimit) * 100}
          color="from-emerald-500 to-emerald-600"
        />
        <UsageCard 
          title={isRTL ? "المستخدمون النشطون" : "Active Users"}
          used={users}
          limit={userLimit}
          remaining={remainingUsers}
          percentage={(users / userLimit) * 100}
          color="from-violet-500 to-violet-600"
        />
      </div>

      {/* Plan Details Summary */}
      <Card className="rounded-[2rem] border bg-muted/20 border-muted overflow-hidden">
        <CardHeader className="pb-4 bg-background/50 border-b border-muted/50 p-8">
          <CardTitle className="text-lg font-black uppercase tracking-widest text-foreground">
            {isRTL ? "تفاصيل باقتك الحالية" : "Current Plan Overview"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-background border border-muted shadow-sm hover:shadow-lg transition-all">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">{isRTL ? "طلبات AI" : "AI Requests"}</div>
              <div className="text-4xl font-black text-foreground">{aiLimit}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">Per Month</div>
            </div>
            <div className="p-6 rounded-3xl bg-background border border-muted shadow-sm hover:shadow-lg transition-all">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">{isRTL ? "فواتير" : "Invoices"}</div>
              <div className="text-4xl font-black text-foreground">{invoiceLimit}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">Monthly Quota</div>
            </div>
            <div className="p-6 rounded-3xl bg-background border border-muted shadow-sm hover:shadow-lg transition-all">
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">{isRTL ? "مستخدمين" : "Users"}</div>
              <div className="text-4xl font-black text-foreground">{userLimit}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2 font-bold">Team Capacity</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotaSettingsForm;
