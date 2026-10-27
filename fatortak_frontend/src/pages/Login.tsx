import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Globe,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isRTL, t, toggleLanguage, language } = useLanguage();

  // Login validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
    password: Yup.string()
      .min(6, t("passwordMinError"))
      .required(t("passwordRequired")),
  });

  const initialValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, setErrors }: any,
  ) => {
    setIsLoading(true);
    setSubmitting(true);

    try {
      const success = await login(values.email, values.password);

      if (success) {
        toast.success(t("loginSuccess"));
        navigate("/dashboard");
      } else {
        // This will trigger if login returns false (invalid credentials)
        setErrors({
          email: t("invalidCredentials"),
          password: t("invalidCredentials"),
        });
        toast.error(t("invalidCredentials"));
      }
    } catch (error: any) {
      // Handle different types of errors
      let errorMessage = t("unexpectedError");

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;

        if (status === 401) {
          errorMessage = t("invalidCredentials");
          setErrors({
            email: t("invalidCredentials"),
            password: t("invalidCredentials"),
          });
        } else if (status === 403) {
          errorMessage = t("accountSuspended");
        } else if (status === 429) {
          errorMessage = t("tooManyAttempts");
        } else if (status >= 500) {
          errorMessage = t("serverError");
        }
      } else if (error.request) {
        // Network error
        errorMessage = t("networkError");
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
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
      <div className={`absolute top-6 z-20 ${isRTL ? "left-6" : "right-6"}`}>
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

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Brand & Features (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-center px-12 space-y-8">
          <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
            {/* Logo */}
            <div
              className={`flex items-center space-x-4 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="/lovable-uploads/8f24889c-d3d3-4842-a775-81f28f9af29a.png"
                    alt="FATORTAK"
                    className="w-8 h-8 object-contain brightness-0 invert"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  FATORTAK
                </h1>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  {t("businessManagement")}
                </p>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-slate-800 dark:text-white leading-tight">
                {t("welcomeBack")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {t("enterCredentials")}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6 mt-8">
              {[
                { title: t("invoices"), desc: t("manageAllInvoicesEasily") },
                { title: t("reports"), desc: t("revenueAnalytics") },
                { title: t("customers"), desc: t("customerAnalytics") },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 ${
                    isRTL ? "flex-row-reverse space-x-reverse text-right" : ""
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div
              className={`lg:hidden flex items-center justify-center mb-8 space-x-3 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <img
                  src="/lovable-uploads/8f24889c-d3d3-4842-a775-81f28f9af29a.png"
                  alt="FATORTAK"
                  className="w-6 h-6 object-contain brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  FATORTAK
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("businessManagement")}
                </p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 space-y-6">
              <div
                className={`text-center space-y-2 ${isRTL ? "text-right" : ""}`}
              >
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {t("signInToAccount")}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {t("enterCredentials")}
                </p>
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-5">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                          isRTL ? "text-right" : ""
                        }`}
                      >
                        {t("email")} *
                      </label>
                      <div className="relative">
                        <Mail
                          className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                            isRTL ? "right-4" : "left-4"
                          }`}
                        />
                        <Field
                          name="email"
                          type="email"
                          className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-slate-800 dark:text-white ${
                            isRTL ? "pr-12 pl-4 text-right" : "pl-12 pr-4"
                          } ${
                            errors.email && touched.email
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                          placeholder={t("email")}
                          disabled={isLoading}
                        />
                      </div>
                      <ErrorMessage name="email">
                        {(msg) => (
                          <p
                            className={`text-sm text-red-500 flex items-center gap-1 ${
                              isRTL ? "text-right flex-row-reverse" : ""
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className={`block text-sm font-semibold text-slate-700 dark:text-slate-300 ${
                          isRTL ? "text-right" : ""
                        }`}
                      >
                        {t("password")} *
                      </label>
                      <div className="relative">
                        <Lock
                          className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                            isRTL ? "right-4" : "left-4"
                          }`}
                        />
                        <Field
                          name="password"
                          type={showPassword ? "text" : "password"}
                          className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-2 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-slate-800 dark:text-white ${
                            isRTL ? "pr-12 pl-12 text-right" : "pl-12 pr-12"
                          } ${
                            errors.password && touched.password
                              ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                          placeholder={t("password")}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${
                            isRTL ? "left-4" : "right-4"
                          }`}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage name="password">
                        {(msg) => (
                          <p
                            className={`text-sm text-red-500 flex items-center gap-1 ${
                              isRTL ? "text-right flex-row-reverse" : ""
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || isSubmitting}
                      className={`w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                        isRTL ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      {isLoading || isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{t("signingIn")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("signIn")}</span>
                          <ArrowIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Register Link */}
              {/* <div
                className={`text-center pt-4 border-t border-slate-200 dark:border-slate-700 ${
                  isRTL ? "text-right" : ""
                }`}
              >
                <p className="text-slate-600 dark:text-slate-400">
                  {t("dontHaveAccount")}{" "}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    {t("createAccount")}
                  </Link>
                </p>
              </div> */}
              <div className={`text-center ${isRTL ? "text-right" : ""}`}>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                {t("signingIn")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("pleaseWait")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
