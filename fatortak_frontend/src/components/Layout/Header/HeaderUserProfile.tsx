import React from "react";
import {
  User,
  ChevronDown,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getIconBackground } from "../../../constants/colors";

const HeaderUserProfile: React.FC = () => {
  const { isRTL } = useLanguage();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleSupportClick = () => {
    navigate("/support");
  };

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 cursor-pointer group ${
            isRTL ? "flex-row-reverse space-x-reverse" : ""
          }`}
        >
          <div className="relative">
            <div
              className={`w-10 h-10 ${getIconBackground(
                "primary"
              )} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/40 transition-all duration-200`}
            >
              <span className="text-white font-bold text-sm">
                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"></div>
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split("@")[0] || (isRTL ? "المستخدم" : "User")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role || (isRTL ? "مدير" : "Admin")}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/70 dark:border-gray-700/70 shadow-xl rounded-2xl p-2"
      >
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-xl cursor-pointer transition-all duration-200"
        >
          <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-medium">
            {isRTL ? "الملف الشخصي" : "Profile"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-xl cursor-pointer transition-all duration-200"
        >
          <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-medium">
            {isRTL ? "الإعدادات" : "Settings"}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSupportClick}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-xl cursor-pointer transition-all duration-200"
        >
          <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="font-medium">{isRTL ? "الدعم" : "Support"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 rounded-xl cursor-pointer transition-all duration-200 text-red-600 dark:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">
            {isRTL ? "تسجيل الخروج" : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderUserProfile;
