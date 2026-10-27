
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

// Language names in their native form
const languageNames: Record<string, string> = {
  en: "English",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  hi: "हिन्दी",
  bn: "বাংলা",
  id: "Bahasa Indonesia",
  fil: "Filipino",
  pt: "Português",
  ur: "اردو",
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    supportedLngs: Object.keys(languageNames),
    fallbackLng: "en",
    detection: {
      order: [
        "localStorage",
        "htmlTag",
        "cookie",
        "sessionStorage",
        "navigator",
        "path",
        "subdomain",
      ],
      caches: ["localStorage"],
    },
    backend: {
      loadPath: "/locale/{{lng}}/{{ns}}.json",
    },
    ns: ["translation", "reports"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
  });

export { languageNames };
export default i18n;
