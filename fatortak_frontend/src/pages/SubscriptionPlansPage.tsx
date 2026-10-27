import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuotaUsage } from "@/hooks/useQuota";
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
    price: 300,
    yearly: 2700,
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
    price: 600,
    yearly: 5400,
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
    price: 900,
    yearly: 8100,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container !max-w-full mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
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
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${currentPlan.color} text-white`}
                >
                  <currentPlan.icon className="w-5 h-5" />
                </div>
                {isRTL ? "باقتك الحالية" : "Your Current Plan"}
                <Badge variant="secondary" className="ml-auto">
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
          <div className="flex items-center gap-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60">
            <span
              className={`text-sm font-medium ${
                !isYearly ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {isRTL ? "شهري" : "Monthly"}
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
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
                isYearly ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {isRTL ? "سنوي" : "Yearly"}
              <Badge variant="secondary" className="ml-1 text-xs">
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
                className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular ? "ring-2 ring-purple-500 ring-offset-4" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    {isRTL ? "الأكثر شعبية" : "Most Popular"}
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                    {isRTL ? "الباقة الحالية" : "Current Plan"}
                  </div>
                )}

                <div className={`h-2 bg-gradient-to-r ${plan.color}`} />

                <CardHeader className="text-center space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {isRTL ? plan.nameAr : plan.name}
                    </h3>
                    <div className="text-3xl font-bold mt-2">
                      <span
                        className={`bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}
                      >
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
                          <div
                            className={`p-1 rounded-md bg-gradient-to-r ${plan.color} bg-opacity-10`}
                          >
                            <FeatureIcon className={`w-4 h-4  text-white`} />
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
                    className={`w-full mt-6 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200 group`}
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
