import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import {
  FileText,
  Building,
  CreditCard,
  Check,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Globe,
  Shield,
  TrendingUp,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import "react-phone-number-input/style.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import SearchableDropdown from "@/components/ui/SearchableDropdown";

const SubmitButton = ({
  currentStep,
  setCurrentStep,
  isLoading,
  successMessage,
  isRTL,
  validateForm,
  setTouched,
}) => {
  const { t } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const getCurrentStepFields = (step) => {
    switch (step) {
      case 1:
        return [
          "firstName",
          "lastName",
          "email",
          "password",
          "confirmPassword",
        ];
      case 2:
        return ["companyName", "phone", "taxNumber", "address"];
      case 3:
        return ["currency", "country"];
      case 4:
        return []; // No validation needed for step 4
      default:
        return [];
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling

    // Get current step fields to validate
    const currentStepFields = getCurrentStepFields(currentStep);

    if (currentStepFields.length === 0) {
      // No validation needed, proceed to next step
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      setTouched({});
      return;
    }

    try {
      // Validate current step fields
      const validationErrors = await validateForm();
      const currentStepErrors = Object.keys(validationErrors).filter((key) =>
        currentStepFields.includes(key)
      );

      if (currentStepErrors.length === 0) {
        // Validation passed, move to next step
        setCurrentStep((prev) => Math.min(prev + 1, 4));
        setTouched({});
      } else {
        // Validation failed, mark current step fields as touched
        const touchedFields = {};
        currentStepFields.forEach((field) => {
          touchedFields[field] = true;
        });
        setTouched(touchedFields);
      }
    } catch (error) {
      // Handle unexpected errors during validation
    }
  };

  // Show Next button for steps 1, 2, and 3
  if (currentStep < 4) {
    return (
      <button
        type="button" // Make sure it's type="button" not "submit"
        onClick={handleNextStep}
        disabled={isLoading}
        className={`px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <span>{t("next")}</span>
            <ArrowIcon className="w-4 h-4" />
          </>
        )}
      </button>
    );
  }

  // Show Submit button for step 4
  return (
    <button
      type="submit" // Only step 4 should submit the form
      disabled={isLoading || successMessage}
      className={`px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
        isRTL ? "flex-row-reverse" : ""
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t("creatingAccount")}</span>
        </>
      ) : successMessage ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{t("success")}</span>
        </>
      ) : (
        <>
          <span>{t("createAccount")}</span>
          <Check className="w-4 h-4" />
        </>
      )}
    </button>
  );
};
interface Option {
  value: string;
  label: React.ReactNode;
  currency?: string;
}
const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const { isRTL, t, toggleLanguage, language } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [countryOptions, setCountryOptions] = useState<Option[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<Option[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,translations,currencies"
        );
        const data = await res.json();

        const currencyMap: Record<string, string> = {};

        // Build country list with flag + default currency
        const mappedCountries = data.map((c: any) => {
          const countryName = language === 'ar' ? (c.translations?.ara?.common || c.name.common) : c.name.common;
          const flag = c.flags?.png;
          const firstCurrency = c.currencies
            ? Object.keys(c.currencies)[0]
            : null;

          if (c.currencies) {
            for (const [code, details] of Object.entries(c.currencies)) {
              const currencyDetails = details as any;
              const label = `${code} - ${currencyDetails.name}${
                currencyDetails.symbol ? ` (${currencyDetails.symbol})` : ""
              }`;
              currencyMap[code] = label;
            }
          }

          return {
            value: countryName,
            label: (
              <div className="flex items-center gap-2">
                {flag && (
                  <img src={flag} alt="" className="w-6 h-4 rounded-sm" />
                )}
                <span>{countryName}</span>
                {firstCurrency && (
                  <span className="text-slate-500 text-sm">
                    ({firstCurrency})
                  </span>
                )}
              </div>
            ),
            currency: firstCurrency,
          };
        });

        // Unique currency list
        const uniqueCurrencies = Object.entries(currencyMap).map(
          ([code, label]) => ({
            value: code,
            label,
          })
        );

        mappedCountries.sort((a, b) =>
          a.value.localeCompare(b.value, "en", { sensitivity: "base" })
        );
        uniqueCurrencies.sort((a, b) =>
          (a.label as string).localeCompare(b.label as string)
        );

        setCountryOptions(mappedCountries);
        setCurrencyOptions(uniqueCurrencies);
        setLoadingCountries(false);
      } catch (error) {
        // console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, [language]);
  // Form validation schemas
  const createStep1Schema = () =>
    Yup.object().shape({
      firstName: Yup.string()
        .min(2, t("firstNameMinError"))
        .required(t("firstNameRequired")),
      lastName: Yup.string()
        .min(2, t("lastNameMinError"))
        .required(t("lastNameRequired")),
      email: Yup.string().email(t("emailInvalid")).required(t("emailRequired")),
      password: Yup.string()
        .min(6, t("passwordMinError"))
        .required(t("passwordRequired")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], t("passwordMismatchError"))
        .required(t("confirmPasswordRequired")),
    });

  const createStep2Schema = () =>
    Yup.object().shape({
      companyName: Yup.string()
        .min(2, t("companyNameMinError"))
        .required(t("companyNameRequired")),
      phone: Yup.string()
        .required(t("phoneRequired"))
        .test("is-valid-phone", t("phoneInvalid"), (value) => {
          if (!value || value.trim() === "") return false;
          try {
            return isValidPhoneNumber(value);
          } catch {
            return false;
          }
        }),
      taxNumber: Yup.string().optional(),
      address: Yup.string().optional(),
    });

  const createStep3Schema = () =>
    Yup.object().shape({
      currency: Yup.string().required(t("currencyRequired")),
      country: Yup.string().required(t("countryRequired")),
    });

  // Initial values for the form
  const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
    taxNumber: "",
    address: "",
    currency: "EGP",
    country: "Egypt",
  };

  const getCurrentSchema = () => {
    switch (currentStep) {
      case 1:
        return createStep1Schema();
      case 2:
        return createStep2Schema();
      case 3:
        return createStep3Schema();
      default:
        return Yup.object().shape({});
    }
  };

  const getStepProgress = () => (currentStep / 4) * 100;

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setServerErrors([]);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (currentStep < 4) {
      setSubmitting(false);
      return;
    }

    setIsLoading(true);
    setServerErrors([]);
    setSubmitting(true);

    try {
      const registerData = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        companyName: values.companyName,
        phoneNumber: values.phone || undefined,
        address: values.address || undefined,
        currency: values.currency,
      };

      const result = await register(registerData);

      if (result.success) {
        toast.success(t("accountCreatedSuccess"));
        setTimeout(() => {
          navigate("/welcome");
        }, 2000);
      } else {
        // Handle server errors - translate them directly
        const errors = [];

        if (result.errors && Array.isArray(result.errors)) {
          errors.push(...result.errors.map((error) => t(error)));
        }

        if (result.errorMessage) {
          errors.push(t(result.errorMessage));
        }

        if (errors.length === 0) {
          errors.push(t("registrationFailed"));
        }
        errors.map((e) => toast.error(e));
        setServerErrors(errors);
      }
    } catch (error) {
      const errorMessage = error?.message
        ? t(error.message)
        : t("unexpectedError");
      setServerErrors([errorMessage]);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: t("accountInfo"), icon: User },
    { number: 2, title: t("companyInfo"), icon: Building },
    { number: 3, title: t("settings"), icon: CreditCard },
    { number: 4, title: t("trialPlan"), icon: Check },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Language Switcher - Top Right */}
      <div className={`absolute top-6 z-20 ${isRTL ? "left-6" : "right-6"}`}>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 bg-white/20 dark:bg-slate-800/20 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 hover:bg-white/30 dark:hover:bg-slate-800/30 rounded-lg transition-all"
          title={language === "en" ? "العربية" : "English"}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === "en" ? "العربية" : "English"}
          </span>
        </button>
      </div>

      <div className="w-full mx-auto grid lg:grid-cols-2 gap-8 relative z-10">
        {/* Left Side - Brand & Features */}
        <div className="hidden lg:flex flex-col justify-center px-12 space-y-8">
          <div className={`space-y-6 ${isRTL ? "text-end" : "text-start"}`}>
            {/* Logo */}
            <div>
              <img
                src="/lovable-uploads/fatortak-logo.png"
                alt="FATORTAK"
                className="h-9 w-auto object-contain dark:brightness-0 dark:invert"
              />
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("businessManagement")}
              </p>
            </div>

            {/* Welcome Text */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                {t("createYourAccount")}
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-400">
                {t("joinThousandsOfCompanies")}
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-6 mt-8">
              {[
                {
                  title: t("advancedSecurity"),
                  desc: t("secureDataProtection"),
                  icon: Shield,
                },
                {
                  title: t("continuousGrowth"),
                  desc: t("scaleYourBusiness"),
                  icon: TrendingUp,
                },
                {
                  title: t("expertTeam"),
                  desc: t("dedicatedSupport"),
                  icon: Users,
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 rounded-xl border border-slate-200/70 bg-white p-4 transition-colors hover:border-brand-200 ${
                    isRTL ? "flex-row-reverse space-x-reverse text-end" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg">
            {/* Mobile Logo */}
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <img
                src="/lovable-uploads/fatortak-logo.png"
                alt="FATORTAK"
                className="h-9 w-auto object-contain dark:brightness-0 dark:invert"
              />
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {t("businessManagement")}
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={getCurrentSchema()}
              onSubmit={handleSubmit}
              validateOnChange={true}
              validateOnBlur={true}
              enableReinitialize={true} // Add this to allow schema updates
            >
              {({
                values,
                errors,
                touched,
                setFieldValue,
                setFieldTouched,
                setTouched,
                isValid,
                validateForm,
              }) => (
                <Form className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-8 dark:border-slate-800 dark:bg-slate-900">
                  {/* Header */}
                  <div className={`text-center space-y-2`}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                      {t("createAccount")}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t("stepOf", { current: currentStep, total: 4 })}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="h-1.5 rounded-full bg-brand-600 transition-all duration-500"
                        style={{ width: `${getStepProgress()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      {Math.round(getStepProgress())}% {t("complete")}
                    </p>
                  </div>

                  {/* Server Errors */}
                  {serverErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                      <div
                        className={`flex items-start gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className={`flex-1 ${isRTL ? "text-end" : ""}`}>
                          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                            {t("registrationFailedCheckErrors")}
                          </h4>
                          <ul
                            className={`list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300 ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {serverErrors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4">
                      <div
                        className={`flex items-center gap-3 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800 dark:text-green-200">
                          {successMessage}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Progress Steps */}
                  <div className="flex items-center justify-between mb-8 overflow-x-auto">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep >= step.number;
                      const isCurrent = currentStep === step.number;

                      return (
                        <div
                          key={step.number}
                          className="flex items-center flex-1 min-w-0"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`
                                w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-300
                                ${
                                  isActive
                                    ? "bg-brand-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                }
                                ${
                                  isCurrent
                                    ? "ring-4 ring-blue-500/20 scale-110"
                                    : ""
                                }
                              `}
                            >
                              {currentStep > step.number ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                            </div>
                            <span
                              className={`mt-2 text-xs font-medium text-center ${
                                isActive
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.title}
                            </span>
                          </div>
                          {index < steps.length - 1 && (
                            <div
                              className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                                currentStep > step.number
                                  ? "bg-brand-600"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-5">
                    {/* Step 1: Account Creation */}
                    {currentStep === 1 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="firstName"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("firstName")} *
                            </label>
                            <div className="relative">
                              <User
                                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                  isRTL ? "right-3" : "left-3"
                                }`}
                              />
                              <Field name="firstName">
                                {({ field }) => (
                                  <input
                                    {...field}
                                    id="firstName"
                                    className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                      isRTL
                                        ? "pr-10 pl-4 text-end"
                                        : "pl-10 pr-4"
                                    } ${
                                      errors.firstName && touched.firstName
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                        : ""
                                    }`}
                                    placeholder={t("firstName")}
                                    disabled={isLoading}
                                  />
                                )}
                              </Field>
                            </div>
                            <ErrorMessage name="firstName">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="lastName"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("lastName")} *
                            </label>
                            <div className="relative">
                              <User
                                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                  isRTL ? "right-3" : "left-3"
                                }`}
                              />
                              <Field name="lastName">
                                {({ field }) => (
                                  <input
                                    {...field}
                                    id="lastName"
                                    className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                      isRTL
                                        ? "pr-10 pl-4 text-end"
                                        : "pl-10 pr-4"
                                    } ${
                                      errors.lastName && touched.lastName
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                        : ""
                                    }`}
                                    placeholder={t("lastName")}
                                    disabled={isLoading}
                                  />
                                )}
                              </Field>
                            </div>
                            <ErrorMessage name="lastName">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {t("email")} *
                          </label>
                          <div className="relative">
                            <Mail
                              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                isRTL ? "right-3" : "left-3"
                              }`}
                            />
                            <Field name="email">
                              {({ field }) => (
                                <input
                                  {...field}
                                  id="email"
                                  type="email"
                                  className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                    isRTL
                                      ? "pr-10 pl-4 text-end"
                                      : "pl-10 pr-4"
                                  } ${
                                    errors.email && touched.email
                                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                      : ""
                                  }`}
                                  placeholder={t("email")}
                                  disabled={isLoading}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage name="email">
                            {(msg) => (
                              <p
                                className={`text-sm text-red-500 ${
                                  isRTL ? "text-end" : ""
                                }`}
                              >
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="password"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("password")} *
                            </label>
                            <div className="relative">
                              <Lock
                                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                  isRTL ? "right-3" : "left-3"
                                }`}
                              />
                              <Field name="password">
                                {({ field }) => (
                                  <input
                                    {...field}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                      isRTL
                                        ? "pr-10 pl-10 text-end"
                                        : "pl-10 pr-10"
                                    } ${
                                      errors.password && touched.password
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                        : ""
                                    }`}
                                    placeholder={t("password")}
                                    disabled={isLoading}
                                  />
                                )}
                              </Field>
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 ${
                                  isRTL ? "left-2" : "right-2"
                                }`}
                                disabled={isLoading}
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <ErrorMessage name="password">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="confirmPassword"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("confirmPassword")} *
                            </label>
                            <div className="relative">
                              <Lock
                                className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                  isRTL ? "right-3" : "left-3"
                                }`}
                              />
                              <Field name="confirmPassword">
                                {({ field }) => (
                                  <input
                                    {...field}
                                    id="confirmPassword"
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                      isRTL
                                        ? "pr-10 pl-10 text-end"
                                        : "pl-10 pr-10"
                                    } ${
                                      errors.confirmPassword &&
                                      touched.confirmPassword
                                        ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                        : ""
                                    }`}
                                    placeholder={t("confirmPassword")}
                                    disabled={isLoading}
                                  />
                                )}
                              </Field>
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className={`absolute top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 ${
                                  isRTL ? "left-2" : "right-2"
                                }`}
                                disabled={isLoading}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <ErrorMessage name="confirmPassword">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Company Info */}
                    {currentStep === 2 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="space-y-2">
                          <label
                            htmlFor="companyName"
                            className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {t("companyName")} *
                          </label>
                          <div className="relative">
                            <Building
                              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${
                                isRTL ? "right-3" : "left-3"
                              }`}
                            />
                            <Field name="companyName">
                              {({ field }) => (
                                <input
                                  {...field}
                                  id="companyName"
                                  className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                    isRTL
                                      ? "pr-10 pl-4 text-end"
                                      : "pl-10 pr-4"
                                  } ${
                                    errors.companyName && touched.companyName
                                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                                      : ""
                                  }`}
                                  placeholder={t("companyName")}
                                  disabled={isLoading}
                                />
                              )}
                            </Field>
                          </div>
                          <ErrorMessage name="companyName">
                            {(msg) => (
                              <p
                                className={`text-sm text-red-500 ${
                                  isRTL ? "text-end" : ""
                                }`}
                              >
                                {msg}
                              </p>
                            )}
                          </ErrorMessage>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="phone"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("phoneNumber")}
                            </label>
                            <div className="relative">
                              <Field name="phone">
                                {({ field, form }) => (
                                  <PhoneInput
                                    value={field.value}
                                    onChange={(val) => {
                                      // Format the phone number properly for RTL
                                      const formattedValue = val || "";
                                      form.setFieldValue(
                                        "phone",
                                        formattedValue
                                      );
                                      form.setFieldTouched("phone", true);
                                    }}
                                    onBlur={() =>
                                      form.setFieldTouched("phone", true)
                                    }
                                    international
                                    countryCallingCodeEditable={false}
                                    defaultCountry="EG"
                                    placeholder={t("phoneNumber")}
                                    disabled={isLoading}
                                    className={`phone-input ${
                                      form.errors.phone && form.touched.phone
                                        ? "phone-input-error"
                                        : ""
                                    } ${isRTL ? "phone-input-rtl" : ""}`}
                                  />
                                )}
                              </Field>
                            </div>
                            <ErrorMessage name="phone">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 flex items-center gap-1 ${
                                    isRTL ? "text-end flex-row-reverse" : ""
                                  }`}
                                >
                                  <AlertTriangle className="w-3 h-3" />
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                            {values.phone && !errors.phone && (
                              <div className="text-sm space-y-1">
                                <p
                                  className={`text-green-600 flex items-center gap-1 ${
                                    isRTL ? "flex-row-reverse" : ""
                                  }`}
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  {t("validPhoneNumber")}
                                </p>
                                {(() => {
                                  try {
                                    const phoneNumber = parsePhoneNumber(
                                      values.phone
                                    );
                                    if (phoneNumber) {
                                      return (
                                        <div
                                          className={`text-xs text-slate-500 dark:text-slate-400 space-y-1 ${
                                            isRTL ? "text-end" : ""
                                          }`}
                                        >
                                          <p>
                                            {t("country")}:{" "}
                                            {phoneNumber.country}
                                          </p>
                                          <p>
                                            {t("format")}:{" "}
                                            {phoneNumber.formatInternational()}
                                          </p>
                                          <p>
                                            {t("type")}:{" "}
                                            {phoneNumber.getType() ||
                                              t("unknown")}
                                          </p>
                                        </div>
                                      );
                                    }
                                  } catch (error) {
                                    return null;
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="taxNumber"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("taxNumber")}
                            </label>
                            <Field name="taxNumber">
                              {({ field }) => (
                                <input
                                  {...field}
                                  id="taxNumber"
                                  className={`w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                    isRTL ? "text-end" : "text-start"
                                  }`}
                                  placeholder={t("taxNumber")}
                                  disabled={isLoading}
                                />
                              )}
                            </Field>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="address"
                            className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                              isRTL ? "text-end" : ""
                            }`}
                          >
                            {t("address")}
                          </label>
                          <div className="relative">
                            <MapPin
                              className={`absolute top-3 ${
                                isRTL ? "right-3" : "left-3"
                              } w-5 h-5 text-slate-400`}
                            />
                            <Field name="address">
                              {({ field }) => (
                                <textarea
                                  {...field}
                                  id="address"
                                  rows={3}
                                  className={`w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white ${
                                    isRTL
                                      ? "pr-10 pl-4 text-end"
                                      : "pl-10 pr-4"
                                  }`}
                                  placeholder={t("address")}
                                  disabled={isLoading}
                                />
                              )}
                            </Field>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Settings */}
                    {currentStep === 3 && (
                      <div className="space-y-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <label
                              htmlFor="country"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("country")} *
                            </label>

                            <Field name="country">
                              {({ field, form }) => (
                                <SearchableDropdown
                                  options={countryOptions as Array<{ value: string; label: string }>}
                                  value={field.value}
                                  onChange={(value) => {
                                    const selected = countryOptions.find(
                                      (c: any) => c.value === value
                                    );
                                    form.setFieldValue("country", value);
                                    form.setFieldTouched("country", true);

                                    if (selected?.currency) {
                                      form.setFieldValue(
                                        "currency",
                                        selected.currency
                                      );
                                    }
                                  }}
                                  placeholder={
                                    t("selectCountry") || "Select Country"
                                  }
                                  isLoading={loadingCountries}
                                  isRTL={isRTL}
                                />
                              )}
                            </Field>

                            <ErrorMessage name="country">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="currency"
                              className={`block text-sm font-medium text-slate-700 dark:text-slate-300 ${
                                isRTL ? "text-end" : ""
                              }`}
                            >
                              {t("defaultCurrency")} *
                            </label>

                            <Field name="currency">
                              {({ field, form }) => (
                                <SearchableDropdown
                                  options={currencyOptions as Array<{ value: string; label: string }>}
                                  value={field.value}
                                  onChange={(value) => {
                                    form.setFieldValue("currency", value);
                                    form.setFieldTouched("currency", true);
                                  }}
                                  placeholder={
                                    t("selectCurrency") || "Select Currency"
                                  }
                                  isLoading={isLoading}
                                  isRTL={isRTL}
                                />
                              )}
                            </Field>

                            <ErrorMessage name="currency">
                              {(msg) => (
                                <p
                                  className={`text-sm text-red-500 ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {msg}
                                </p>
                              )}
                            </ErrorMessage>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Trial Plan */}
                    {currentStep === 4 && (
                      <div className="space-y-6 animate-fade-in">
                        <div
                          className={`text-center mb-6 ${
                            isRTL ? "text-end" : ""
                          }`}
                        >
                          <h3 className="text-xl lg:text-2xl font-semibold text-slate-800 dark:text-white mb-2">
                            {t("trialPlanTitle")}
                          </h3>
                          <p className="text-slate-600 dark:text-slate-400">
                            {t("trialPlanDescription")}
                          </p>
                        </div>

                        <div className="max-w-md mx-auto">
                          <div className="relative rounded-2xl border border-brand-200 bg-brand-50/60 p-6 dark:border-brand-900 dark:bg-brand-950/30">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <div className="bg-brand-600 text-white text-xs px-4 py-1 rounded-full font-medium">
                                {t("trialPlan")}
                              </div>
                            </div>

                            <div className="text-center space-y-6">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                                <Shield className="w-8 h-8 text-white" />
                              </div>

                              <div>
                                <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                  {t("trialPlan")}
                                </h4>
                                <p className="mb-1 text-3xl font-bold text-brand-700 dark:text-brand-300">
                                  {t("free")}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {t("trialDuration")}
                                </p>
                              </div>

                              <div
                                className={`space-y-4 ${
                                  isRTL ? "text-end" : "text-start"
                                }`}
                              >
                                <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                                  <h5 className="font-semibold text-slate-800 dark:text-white mb-3 text-center">
                                    {t("whatYouGet")}
                                  </h5>
                                  <ul className="space-y-3">
                                    {[
                                      t("fiftyInvoicesPerMonth"),
                                      t("oneUser"),
                                      t("tenAiAssistantRequests"),
                                      t("unlimitedCustomers"),
                                      t("unlimitedItems"),
                                      t("basicSupport"),
                                    ].map((feature, index) => (
                                      <li
                                        key={index}
                                        className={`flex items-center gap-3 ${
                                          isRTL ? "flex-row-reverse" : ""
                                        }`}
                                      >
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                          {feature}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl p-4">
                                <p
                                  className={`text-xs text-blue-700 dark:text-blue-300 leading-relaxed ${
                                    isRTL ? "text-end" : ""
                                  }`}
                                >
                                  {t("trialNote")}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div
                    className={`flex justify-between items-center mt-8 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={currentStep === 1 || isLoading}
                      className={`px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentStep === 1 ? "invisible" : ""
                      } ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{t("previous")}</span>
                    </button>

                    <SubmitButton
                      currentStep={currentStep}
                      setCurrentStep={setCurrentStep}
                      isLoading={isLoading}
                      successMessage={successMessage}
                      isRTL={isRTL}
                      validateForm={validateForm}
                      setTouched={setTouched}
                    />
                  </div>

                  {/* Footer */}
                  <div
                    className={`text-center pt-4 border-t border-slate-200 dark:border-slate-700 ${
                      isRTL ? "text-end" : ""
                    }`}
                  >
                    <p className="text-slate-600 dark:text-slate-400">
                      {t("alreadyHaveAccount")}{" "}
                      <Link
                        to="/login"
                        className="font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200"
                      >
                        {t("signIn")}
                      </Link>
                    </p>
                  </div>


                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-lg flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                {currentStep === 4 ? t("creatingAccount") : t("validating")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {currentStep === 4
                  ? t("pleaseWaitCreating")
                  : t("pleaseWaitValidating")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
