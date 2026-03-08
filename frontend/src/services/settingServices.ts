import api from "./api";
import type { ApiResponse, AppSettings, SettingsPayload } from "@/types/domain";

export const getMySettings = async () => {
    return api.get<ApiResponse<AppSettings>>("/settings/me");
};

export const updateMySettings = async (payload: SettingsPayload) => {
    return api.put<ApiResponse<AppSettings>>("/settings/me", payload);
};

export const deleteMyAccount = async () => {
    return api.delete<ApiResponse<{ deleted: boolean }>>("/settings/me");
};
