import { apiClient } from "./api";
import {
  NotificationDto,
  NotificationFilterDto,
  PagedResponseDto,
  PaginationDto,
} from "../types/api";

export const notificationService = {
  // Get notifications with pagination and filtering
  getNotifications: async (
    pagination: PaginationDto,
    filters?: NotificationFilterDto
  ) => {
    const params = {
      pageNumber: pagination.pageNumber,
      pageSize: pagination.pageSize,
      ...(filters?.isRead !== undefined && { isRead: filters.isRead }),
      ...(filters?.notificationType && {
        notificationType: filters.notificationType,
      }),
      ...(filters?.fromDate && { fromDate: filters.fromDate }),
      ...(filters?.toDate && { toDate: filters.toDate }),
    };

    return apiClient.get<PagedResponseDto<NotificationDto>>(
      "/api/notifications",
      params
    );
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiClient.post<boolean>(
      `/api/notifications/mark-as-read/${notificationId}`
    );
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return apiClient.post<boolean>("/api/notifications/read-all");
  },

  // Get unread notifications count
  getUnreadCount: async () => {
    return apiClient.get<number>("/api/notifications/unread-count");
  },
};
