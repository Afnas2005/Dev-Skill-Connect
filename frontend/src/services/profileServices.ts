import api from "./api";
import type { ApiResponse, AuthUser, ProfilePayload, Skill } from "@/types/domain";

export type ProfileResult = {
    profile: AuthUser;
    skills: Skill[];
};

export const getMyProfile = async () => {
    return api.get<ApiResponse<ProfileResult>>("/profile/me");
};

export const updateMyProfile = async (payload: ProfilePayload) => {
    return api.put<ApiResponse<ProfileResult>>("/profile/me", payload);
};

export const getPublicProfile = async (userId: string) => {
    return api.get<ApiResponse<ProfileResult>>(`/profile/${userId}`);
};

export const changePassword = async (payload: any) => {
    // Mocked response since backend routing for password changes doesn't exist yet
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: { success: true } });
        }, 1000);
    });
};
