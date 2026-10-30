import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, MessageSquare, ArrowLeft, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { planPricing } from "@/config/plans";

const plans = [
  {
    id: "starter",
    name: "Starter",
    nameAr: "المبتدئ",
    price: planPricing.starter.monthly,
    yearly: planPricing.starter.yearly,
  },
  {
    id: "professional",
    name: "Professional",
    nameAr: "المحترف",
    price: planPricing.professional.monthly,
    yearly: planPricing.professional.yearly,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "المؤسسي",
    price: planPricing.enterprise.monthly,
    yearly: planPricing.enterprise.yearly,
  },
];

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();

  const planId = searchParams.get("plan");
  const isYearly = searchParams.get("yearly") === "true";

  const selectedPlan = plans.find((plan) => plan.id === planId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? "تم نسخ الرقم" : "Number copied to clipboard");
  };

  const sendToWhatsApp = () => {
    if (!selectedPlan) return;

    const price = isYearly ? selectedPlan.yearly : selectedPlan.price;
    const planName = isRTL ? selectedPlan.nameAr : selectedPlan.name;
    const billingType = isRTL
      ? isYearly
        ? "سنوي"
        : "شهري"
      : isYearly
      ? "yearly"
      : "monthly";

    const message = isRTL
      ? `مرحباً، أريد الاشتراك في باقة ${planName} (${billingType}) بقيمة ${price} جنيه مصري. لقد قمت بالدفع وأرفق إثبات الدفع.`
      : `Hello, I want to subscribe to the ${planName} plan (${billingType}) for ${price} EGP. I have made the payment and I'm attaching the payment proof.`;

    const whatsappUrl = `https://wa.me/201553579746?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-lg mb-4">
              {isRTL
                ? "لم يتم العثور على الباقة المحددة"
                : "Selected plan not found"}
            </p>
            <Button onClick={() => navigate("/subscription-plans")}>
              {isRTL ? "العودة للباقات" : "Back to Plans"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = isYearly ? selectedPlan.yearly : selectedPlan.price;
  const planName = isRTL ? selectedPlan.nameAr : selectedPlan.name;

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/subscription-plans")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            {isRTL ? "العودة" : "Back"}
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRTL ? "إتمام عملية الدفع" : "Complete Payment"}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {isRTL
                ? `باقة ${planName} - ${price} جنيه مصري`
                : `${planName} Plan - ${price} EGP`}
              <span className="text-sm ml-2">
                (
                {isRTL
                  ? isYearly
                    ? "سنوي"
                    : "شهري"
                  : isYearly
                  ? "yearly"
                  : "monthly"}
                )
              </span>
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* InstaPay */}
          <Card className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/lovable-uploads/cc54248e-9157-4547-8f86-c9cde4ea0bec.png"
                    alt="InstaPay"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    InstaPay
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isRTL ? "دفع فوري آمن" : "Secure instant payment"}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-brand-50 p-4 dark:bg-brand-950/30">
                <div className="text-xl font-bold tabular-nums text-brand-700 dark:text-brand-300">
                  +201102941029
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("+201102941029")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vodafone Cash */}
          <Card className="bg-white dark:bg-slate-900 hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-rose-600">
                  <img
                    src="/lovable-uploads/8368dcf6-d061-46c0-8ad6-0d5d7dc1bda5.png"
                    alt="Vodafone Cash"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    Vodafone Cash
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isRTL ? "محفظة فودافون كاش" : "Vodafone mobile wallet"}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-rose-50 p-4 dark:bg-rose-950/20">
                <div className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-300">
                  +201004139772
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("+201004139772")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mb-8 border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">
              {isRTL ? "تعليمات الدفع" : "Payment Instructions"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                {isRTL
                  ? "اختر إحدى طرق الدفع أعلاه وقم بتحويل المبلغ المطلوب"
                  : "Choose one of the payment methods above and transfer the required amount"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                {isRTL
                  ? "احتفظ بإثبات الدفع (سكرين شوت أو إيصال)"
                  : "Keep your payment proof (screenshot or receipt)"}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                3
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                {isRTL
                  ? "اضغط على زر 'إرسال إثبات الدفع' أدناه لإرسال الإثبات عبر الواتساب"
                  : "Click 'Send Payment Proof' button below to send proof via WhatsApp"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Send Button */}
        <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
              {isRTL ? "إرسال إثبات الدفع" : "Send Payment Proof"}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
              {isRTL
                ? "بعد إتمام الدفع، اضغط على الزر أدناه لإرسال إثبات الدفع عبر الواتساب وتفعيل اشتراكك"
                : "After completing payment, click the button below to send payment proof via WhatsApp and activate your subscription"}
            </p>
            <Button
              onClick={sendToWhatsApp}
              size="lg"
              className="bg-emerald-600 px-6 text-white hover:bg-emerald-700"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              {isRTL
                ? "إرسال إثبات الدفع عبر الواتساب"
                : "Send Proof via WhatsApp"}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
              {isRTL
                ? "رقم الواتساب: +201553579746"
                : "WhatsApp: +201553579746"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
