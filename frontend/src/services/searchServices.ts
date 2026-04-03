import api from "./api";
import type { ApiResponse, AuthUser, Skill, SkillLevel } from "@/types/domain";

export type SearchResult = {
    user: AuthUser;
    skills: Skill[];
    connectionStatus: "none" | "pending" | "connected";
};

export const searchSkills = async (params: {
    skill?: string;
    level?: SkillLevel | "all";
}) => {
    const query = new URLSearchParams();
    if (params.skill) {
        query.set("skill", params.skill);
    }
    if (params.level && params.level !== "all") {
        query.set("level", params.level);
    }

    const url = query.toString() ? `/search?${query.toString()}` : "/search";
    return api.get<ApiResponse<SearchResult[]>>(url);
};

export const sendConnectionRequest = async (targetUserId: string) => {
    return api.post<ApiResponse<{ id: string; status: "pending" }>>(
        `/search/connect/${targetUserId}`
    );
};

export const respondToConnectionRequest = async (
    targetUserId: string,
    action: "accepted" | "rejected"
) => {
    return api.patch<ApiResponse<{ senderId: string; receiverId: string; status: "accepted" | "rejected" }>>(
        `/search/connect/${targetUserId}`,
        { action }
    );
};

export const startDirectConversation = async (targetUserId: string) => {
    return api.post<ApiResponse<{ id: string }>>(`/chat/conversations/direct/${targetUserId}`);
};
