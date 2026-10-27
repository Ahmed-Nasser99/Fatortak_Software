import React from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getIconBackground } from "../../../constants/colors";

const HeaderNotifications: React.FC = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      title: isRTL ? "مرحباً بك في النظام" : "Welcome to the System",
      message: isRTL
        ? "تم تحديث لوحة التحكم بنجاح"
        : "Dashboard updated successfully",
      time: "5m ago",
      unread: true,
      type: "success",
    },
    {
      id: 2,
      title: isRTL ? "تحديث جديد متاح" : "New Update Available",
      message: isRTL
        ? "يتوفر إصدار جديد من التطبيق"
        : "New version of the app is available",
      time: "1h ago",
      unread: true,
      type: "info",
    },
    {
      id: 3,
      title: isRTL ? "تم حفظ التغييرات" : "Changes Saved",
      message: isRTL
        ? "تم حفظ جميع التغييرات بنجاح"
        : "All changes have been saved successfully",
      time: "2h ago",
      unread: false,
      type: "default",
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleNotificationClick = (notificationId: number) => {
    navigate("/notifications");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:scale-105 rounded-xl group"
        >
          <div
            className={`w-10 h-10 ${getIconBackground(
              "error"
            )} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/40 transition-all duration-200`}
          >
            <Bell className="w-5 h-5 text-white" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/70 dark:border-gray-700/70 shadow-2xl rounded-2xl p-0 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              {isRTL ? "الإشعارات" : "Notifications"}
            </h3>
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                {unreadCount} {isRTL ? "جديد" : "new"}
              </span>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`p-4 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-gray-100/80 dark:hover:from-gray-700/50 dark:hover:to-gray-600/50 border-b border-gray-100/70 dark:border-gray-600/70 last:border-b-0 cursor-pointer transition-all duration-200 ${
                notification.unread
                  ? "bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-900/10 dark:to-indigo-900/10"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    notification.unread
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50">
          <Button
            variant="ghost"
            onClick={() => navigate("/notifications")}
            className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all duration-200"
          >
            {isRTL ? "عرض جميع الإشعارات" : "View all notifications"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderNotifications;
