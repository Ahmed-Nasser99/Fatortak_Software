import React, { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";

const HeaderSearch: React.FC = () => {
  const { isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative hidden md:block group"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-xl"></div>
      <div className="relative">
        <Search
          className={`absolute top-1/2 transform -translate-y-1/2 ${
            isRTL ? "right-4" : "left-4"
          } w-5 h-5 text-gray-400 z-10 transition-colors duration-200 group-focus-within:text-blue-500`}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search")}
          className={`
            relative z-10 w-72 lg:w-96 py-3.5 text-sm font-medium
            ${isRTL ? "pr-12 pl-6 text-right" : "pl-12 pr-6"} 
            border-2 border-gray-200/60 dark:border-gray-700/60 rounded-2xl
            bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm
            focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800
            dark:text-white placeholder:text-gray-400
            transition-all duration-300 hover:shadow-lg focus:shadow-xl hover:border-gray-300 dark:hover:border-gray-600
          `}
        />
      </div>
    </form>
  );
};

export default HeaderSearch;
