import React from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import { languageNames } from "../../../lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getIconBackground } from "../../../constants/colors";

const HeaderLanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      en: "🇺🇸",
      ar: "🇸🇦",
      fr: "🇫🇷",
      es: "🇪🇸",
      it: "🇮🇹",
      hi: "🇮🇳",
      bn: "🇧🇩",
      id: "🇮🇩",
      fil: "🇵🇭",
      pt: "🇵🇹",
      ur: "🇵🇰",
    };
    return flags[lang] || "🌐";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200  rounded-xl group"
        >
          <div
            className={`w-10 h-10 ${getIconBackground(
              "success"
            )} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/40 transition-all duration-200`}
          >
            <span className="text-white text-sm font-bold">
              {getLanguageFlag(language)}
            </span>
          </div>
          <ChevronDown className="absolute -bottom-1 -right-1 w-3 h-3 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700/70 shadow-xl rounded-2xl p-2 max-h-64 overflow-y-auto"
      >
        {Object.entries(languageNames).map(([lang, name]) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors duration-200 ${
              language === lang
                ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                : ""
            }`}
          >
            <span className="text-xl">{getLanguageFlag(lang)}</span>
            <span className="font-medium">{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderLanguageSwitcher;
