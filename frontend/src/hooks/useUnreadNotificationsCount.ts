"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyNotifications } from "@/services/notificationServices";

export function useUnreadNotificationsCount() {
    const query = useQuery({
        queryKey: ["notifications", "badge"],
        queryFn: () => getMyNotifications("all"),
        staleTime: 10 * 1000,
        refetchInterval: 15 * 1000,
        refetchOnWindowFocus: true,
    });

    const items = query.data?.data || [];
    const unreadCount = items.filter((item) => item.unread).length;

    return {
        unreadCount,
        isLoading: query.isLoading,
    };
}
