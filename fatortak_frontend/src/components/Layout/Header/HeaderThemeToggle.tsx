
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from "@/components/ui/button";
import { getIconBackground } from '../../../constants/colors';

const HeaderThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all duration-200  rounded-xl group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl ${
        theme === 'light' 
          ? `${getIconBackground('warning')} group-hover:shadow-amber-500/40` 
          : `${getIconBackground('secondary')} group-hover:shadow-purple-500/40`
      }`}>
        {theme === 'light' ? 
          <Moon className="w-5 h-5 text-white" /> : 
          <Sun className="w-5 h-5 text-white" />
        }
      </div>
    </Button>
  );
};

export default HeaderThemeToggle;
