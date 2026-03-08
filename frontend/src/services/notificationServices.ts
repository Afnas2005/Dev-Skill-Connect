import api from "./api";
import type { ApiResponse, AppNotification, NotificationType } from "@/types/domain";

export const getMyNotifications = async (type: NotificationType | "all" = "all") => {
    const query = new URLSearchParams();
    if (type && type !== "all") {
        query.set("type", type);
    }
    const url = query.toString() ? `/notifications?${query.toString()}` : "/notifications";
    return api.get<ApiResponse<AppNotification[]>>(url);
};

export const markAllNotificationsRead = async () => {
    return api.patch<ApiResponse<AppNotification[]>>("/notifications/read-all");
};

export const markNotificationRead = async (id: string) => {
    return api.patch<ApiResponse<{ id: string; unread: boolean }>>(`/notifications/${id}/read`);
};

export const deleteNotification = async (id: string) => {
    return api.delete<ApiResponse<{ id: string }>>(`/notifications/${id}`);
};
