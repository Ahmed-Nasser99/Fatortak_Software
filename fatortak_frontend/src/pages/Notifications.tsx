import React, { useState } from "react";
import {
  Bell,
  Check,
  X,
  Filter,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { getIconBackground } from "../constants/colors";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadNotificationsCount,
} from "../hooks/useNotifications";
import { PaginationDto } from "../types/api";

const Notifications: React.FC = () => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  // Notification filter state
  const [notificationFilter, setNotificationFilter] = useState({
    isRead: undefined as boolean | undefined,
  });

  // Fetch notifications
  const { data: notificationsData, isLoading } = useNotifications(
    pagination,
    filter === "all" ? undefined : { isRead: filter === "read" }
  );

  // Mutation hooks
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  // Unread count
  const { data: unreadCount } = useUnreadNotificationsCount();

  // Process notifications data
  const notifications = notificationsData?.data?.data || [];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "error":
        return <X className="w-5 h-5 text-white" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getNotificationBg = (type: string) => {
    return getIconBackground(type as any);
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = notifications?.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div
      className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
        <div
          className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className={`flex items-center space-x-4`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg mx-3">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isRTL ? "الإشعارات" : "Notifications"}
              </h1>
              <p className="text-blue-100 text-lg">
                {unreadCount?.data && unreadCount?.data > 0
                  ? `${unreadCount?.data} ${isRTL ? "إشعار جديد" : "unread notifications"}`
                  : isRTL ? "لا توجد إشعارات جديدة" : "No new notifications"}
              </p>
            </div>
          </div>

          {unreadCount?.data && unreadCount?.data > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Check className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                {isRTL ? "تعيين الكل كمقروء" : "Mark all as read"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 transform -translate-y-1/2 ${
                isRTL ? "right-3" : "left-3"
              } w-5 h-5 text-gray-400`}
            />
            <Input
              type="text"
              placeholder={
                isRTL ? "البحث في الإشعارات..." : "Search notifications..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${isRTL ? "pr-10" : "pl-10"}`}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => {
                setFilter("all");
                setNotificationFilter({ isRead: undefined });
              }}
              size="sm"
            >
              {isRTL ? "الكل" : "All"}
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => {
                setFilter("unread");
                setNotificationFilter({ isRead: false });
              }}
              size="sm"
            >
              {isRTL ? "غير المقروء" : "Unread"}
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              onClick={() => {
                setFilter("read");
                setNotificationFilter({ isRead: true });
              }}
              size="sm"
            >
              {isRTL ? "المقروء" : "Read"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-pulse">
              <div
                className={`w-16 h-16 ${getIconBackground(
                  "secondary"
                )} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isRTL ? "جاري التحميل..." : "Loading..."}
              </h3>
            </div>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center">
            <div
              className={`w-16 h-16 ${getIconBackground(
                "secondary"
              )} rounded-2xl flex items-center justify-center mx-auto mb-4`}
            >
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isRTL ? "لا توجد إشعارات" : "No notifications found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {isRTL
                ? "لا توجد إشعارات تطابق البحث الحالي"
                : "No notifications match your current search"}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 transition-all duration-200 hover:shadow-lg ${
                !notification.isRead
                  ? "border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/10"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 ${getNotificationBg(
                    notification.notificationType || "info"
                  )} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  {getNotificationIcon(notification.notificationType || "info")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 text-xs"
                          >
                            {isRTL ? "جديد" : "New"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-3">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                        {notification.notificationType && (
                          <Badge variant="outline" className="text-xs">
                            {notification.notificationType}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {/* Note: Delete functionality would need to be implemented in the API */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled // Disabled until delete functionality is implemented
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// Helper function to format date as time ago
function formatTimeAgo(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? "" : "s"} ago`;
    }
  }

  return "Just now";
}

export default Notifications;
