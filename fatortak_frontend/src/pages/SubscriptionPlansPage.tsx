import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuotaUsage } from "@/hooks/useQuota";
import { planPricing } from "@/config/plans";
import {
  Check,
  Crown,
  Zap,
  Users,
  FileText,
  Bot,
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  Star,
  ArrowRight,
} from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    nameAr: "المبتدئ",
    price: planPricing.starter.monthly,
    yearly: planPricing.starter.yearly,
    icon: Zap,
    color: "from-blue-500 to-blue-600",
    popular: false,
    features: [
      { icon: Users, text: "3 Users", textAr: "3 مستخدمين" },
      {
        icon: FileText,
        text: "100 Invoices / Month",
        textAr: "100 فاتورة / شهر",
      },
      {
        icon: Bot,
        text: "30 AI Assistant uses / Month",
        textAr: "30 استخدام للمساعد الذكي / شهر",
      },
      { icon: BarChart3, text: "Basic Reports", textAr: "تقارير أساسية" },
      {
        icon: MessageSquare,
        text: "WhatsApp Send (Limited)",
        textAr: "إرسال واتساب (محدود)",
      },
      { icon: Mail, text: "Email Support", textAr: "دعم البريد الإلكتروني" },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    nameAr: "المحترف",
    price: planPricing.professional.monthly,
    yearly: planPricing.professional.yearly,
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    popular: true,
    features: [
      { icon: Users, text: "5 Users", textAr: "5 مستخدمين" },
      {
        icon: FileText,
        text: "500 Invoices / Month",
        textAr: "500 فاتورة / شهر",
      },
      {
        icon: Bot,
        text: "150 AI Assistant uses / Month",
        textAr: "150 استخدام للمساعد الذكي / شهر",
      },
      { icon: BarChart3, text: "Full Reports", textAr: "تقارير كاملة" },
      { icon: MessageSquare, text: "WhatsApp Send", textAr: "إرسال واتساب" },
      {
        icon: Phone,
        text: "Live Chat Support",
        textAr: "دعم المحادثة المباشرة",
      },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "المؤسسي",
    price: planPricing.enterprise.monthly,
    yearly: planPricing.enterprise.yearly,
    icon: Star,
    color: "from-emerald-500 to-emerald-600",
    popular: false,
    features: [
      { icon: Users, text: "Unlimited Users", textAr: "مستخدمين غير محدود" },
      {
        icon: FileText,
        text: "Unlimited Invoices",
        textAr: "فواتير غير محدودة",
      },
      {
        icon: Bot,
        text: "Unlimited AI Assistant",
        textAr: "مساعد ذكي غير محدود",
      },
      {
        icon: BarChart3,
        text: "Full Reports + Export",
        textAr: "تقارير كاملة + تصدير",
      },
      {
        icon: MessageSquare,
        text: "Unlimited WhatsApp Send",
        textAr: "إرسال واتساب غير محدود",
      },
      { icon: Phone, text: "Priority Support", textAr: "دعم أولوية" },
    ],
  },
];

export default function SubscriptionPlansPage() {
  const [isYearly, setIsYearly] = useState(false);
  const { isRTL } = useLanguage();
  const { data: quotaUsage, isLoading: quotaLoading } = useQuotaUsage();
  const navigate = useNavigate();

  const getCurrentPlan = () => {
    if (!quotaUsage) return null;
    return plans.find(
      (plan) => plan.name.toLowerCase() === quotaUsage.plan.toLowerCase()
    );
  };

  const handleChoosePlan = (planId: string) => {
    navigate(`/payment?plan=${planId}&yearly=${isYearly}`);
  };

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-canvas p-4 sm:p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            {isRTL ? "اختر الباقة المناسبة لك" : "Choose Your Perfect Plan"}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {isRTL
              ? "اختر الباقة التي تناسب احتياجاتك ونمو شركتك"
              : "Select the plan that fits your needs and business growth"}
          </p>
        </div>

        {/* Current Usage Card */}
        {currentPlan && !quotaLoading && (
          <Card className="mb-8 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-brand-50 p-2 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                  <currentPlan.icon className="h-5 w-5" />
                </div>
                {isRTL ? "باقتك الحالية" : "Your Current Plan"}
                <Badge variant="brand" className="ms-auto">
                  {isRTL ? currentPlan.nameAr : currentPlan.name}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {isRTL ? "استخدام المساعد الذكي" : "AI Assistant Usage"}
                    </span>
                    <span className="font-semibold">
                      {quotaUsage?.aiUsed || 0} / {quotaUsage?.aiLimit || "∞"}
                    </span>
                  </div>
                  <Progress
                    value={
                      quotaUsage?.aiLimit
                        ? (quotaUsage.aiUsed / quotaUsage.aiLimit) * 100
                        : 0
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
            <span
              className={`text-sm font-medium ${
                !isYearly ? "text-brand-700 dark:text-brand-300" : "text-slate-500"
              }`}
            >
              {isRTL ? "شهري" : "Monthly"}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                isYearly ? "text-brand-700 dark:text-brand-300" : "text-slate-500"
              }`}
            >
              {isRTL ? "سنوي" : "Yearly"}
              <Badge variant="success" className="ms-1 text-xs">
                {isRTL ? "وفر 3 شهور" : "Save 3 months"}
              </Badge>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden border border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900 ${
                  plan.popular ? "ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-950" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute end-0 top-0 rounded-se-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    {isRTL ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute start-0 top-0 rounded-ss-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                    {isRTL ? "الباقة الحالية" : "Current Plan"}
                  </div>
                )}

                <div className="h-1.5 bg-brand-600" />

                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    <Icon className="h-7 w-7" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isRTL ? plan.nameAr : plan.name}
                    </h3>
                    <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                      <span>
                        {isYearly ? plan.yearly : plan.price} EGP
                      </span>
                      <span className="text-sm text-slate-500 font-normal">
                        /{" "}
                        {isRTL
                          ? isYearly
                            ? "سنة"
                            : "شهر"
                          : isYearly
                          ? "year"
                          : "month"}
                      </span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-emerald-600 font-semibold mt-1">
                        {isRTL ? "وفر" : "Save"}{" "}
                        {(
                          ((plan.price * 12 - plan.yearly) /
                            (plan.price * 12)) *
                          100
                        ).toFixed(0)}
                        %
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <li key={index} className="flex items-center gap-3">
                          <div className="rounded-md bg-brand-50 p-1 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                            <FeatureIcon className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {isRTL ? feature.textAr : feature.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button
                    onClick={() => handleChoosePlan(plan.id)}
                    className="group mt-6 w-full bg-brand-600 text-white hover:bg-brand-700"
                    size="lg"
                  >
                    {isRTL ? "اختر هذه الباقة" : "Choose Plan"}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
