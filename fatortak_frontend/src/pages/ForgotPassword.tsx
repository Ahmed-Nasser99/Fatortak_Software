import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { Mail, ArrowRight, ArrowLeft, Globe, ChevronLeft } from "lucide-react";
import { apiClient } from "../services/api";
import { toast } from "react-toastify";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isRTL, t, language, toggleLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await apiClient.post<any>(
        "/api/auth/ForgetPasswordRequest",
        { email }
      );

      if (result.success) {
        toast.success(t("resetEmailSent"));
        navigate("/login");
      } else {
        toast.error(result.errorMessage || t("resetRequestFailed"));
      }
    } catch (error) {
      toast.error(t("resetRequestFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-all duration-200 shadow-lg hover:shadow-xl"
          title={language === "en" ? "العربية" : "English"}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === "en" ? "العربية" : "English"}
          </span>
        </button>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate("/login")}
          className={`flex items-center mb-6 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>{t("backToLogin")}</span>
        </button>

        {/* Forgot Password Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 space-y-6">
          <div className={`text-center space-y-2 ${isRTL ? "text-right" : ""}`}>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {t("forgotPassword")}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t("enterEmailForReset")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                {t("email")}
              </label>
              <div className="relative">
                <Mail
                  className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                    isRTL ? "right-4" : "left-4"
                  }`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-slate-800 dark:text-white ${
                    isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                  }`}
                  placeholder={t("email")}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{t("sendResetLink")}</span>
                  <ArrowIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <div
            className={`text-center pt-4 border-t border-slate-200 dark:border-slate-700 ${
              isRTL ? "text-right" : ""
            }`}
          >
            <p className="text-slate-600 dark:text-slate-400">
              {t("rememberPassword")}{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {t("backToLogin")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
