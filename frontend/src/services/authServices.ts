import api from "./api";
import type { ApiError, ApiResponse, AuthUser } from "@/types/domain";
export type { ApiError, ApiResponse };

export type RegisterPayload = {
    email: string;
    password: string;
    name?: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type ProfilePayload = {
    name?: string;
    skills?: Array<{
        skillName: string;
        level: string;
    }>;
};

export type AuthResult = {
    user: AuthUser;
    token: string;
};

export const registerUser = async (data: RegisterPayload) => {
    const response = await api.post<ApiResponse<{ user: AuthUser }>>("/auth/register", data);
    return response;
};

export const loginUser = async (data: LoginPayload) => {
    const response = await api.post<ApiResponse<AuthResult>>("/auth/login", data);
    return response;
};

export const googleLogin = async (credential: string) => {
    const response = await api.post<ApiResponse<AuthResult>>("/auth/google", { credential });
    return response;
};

export const getMe = async () => {
    const response = await api.get<ApiResponse<{ user: AuthUser }>>("/auth/me");
    return response;
};

export const logoutUser = async () => {
    const response = await api.post<ApiResponse<null>>("/auth/logout");
    return response;
};

export const updateProfile = async (data: ProfilePayload) => {
    const response = await api.put<ApiResponse<unknown>>("/auth/profile", data);
    return response;
};
