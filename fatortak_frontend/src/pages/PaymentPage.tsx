import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, MessageSquare, ArrowLeft, Copy } from "lucide-react";
import { toast } from "react-toastify";

const plans = [
  {
    id: "starter",
    name: "Starter",
    nameAr: "المبتدئ",
    price: 250,
    yearly: 2000,
  },
  {
    id: "professional",
    name: "Professional",
    nameAr: "المحترف",
    price: 499,
    yearly: 3992,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    nameAr: "المؤسسي",
    price: 999,
    yearly: 7992,
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container  mx-auto px-4 py-8 max-w-4xl">
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
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
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/lovable-uploads/cc54248e-9157-4547-8f86-c9cde4ea0bec.png"
                    alt="InstaPay"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-purple-900 dark:text-purple-100">
                    InstaPay
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isRTL ? "دفع فوري آمن" : "Secure instant payment"}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
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
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center overflow-hidden">
                  <img
                    src="/lovable-uploads/8368dcf6-d061-46c0-8ad6-0d5d7dc1bda5.png"
                    alt="Vodafone Cash"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <div className="font-semibold text-red-900 dark:text-red-100">
                    Vodafone Cash
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {isRTL ? "محفظة فودافون كاش" : "Vodafone mobile wallet"}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-xl">
                <div className="text-2xl font-bold text-red-600">
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/20 dark:to-green-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-emerald-800 dark:text-emerald-200">
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-900/20">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
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
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
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
