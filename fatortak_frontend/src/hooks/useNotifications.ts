import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";
import { NotificationFilterDto, PaginationDto } from "../types/api";

export const useNotifications = (
  pagination: PaginationDto,
  filters?: NotificationFilterDto
) => {
  return useQuery({
    queryKey: ["notifications", pagination, filters],
    queryFn: () => notificationService.getNotifications(pagination, filters),
    // Optionally add staleTime or other options
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationService.markAsRead(notificationId),
    onSuccess: () => {
      // Invalidate both notifications and unread count queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      // Invalidate both notifications and unread count queries
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unread-notifications-count"],
      });
    },
    onError: (error: any) => {
      throw error;
    },
  });
};

export const useUnreadNotificationsCount = () => {
  return useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () => notificationService.getUnreadCount(),
    // You might want to refetch this more frequently
    refetchInterval: 30000, // 30 seconds
  });
};
