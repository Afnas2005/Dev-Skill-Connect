import api from "./api";
import type { ApiResponse } from "@/types/domain";

export const uploadProfileImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ApiResponse<{ url: string }>>("/uploads/profile-image", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const uploadSkillAttachments = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return api.post<ApiResponse<{ urls: string[] }>>("/uploads/skill-attachments", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const uploadPostScreenshots = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return api.post<ApiResponse<{ urls: string[] }>>("/uploads/post-screenshots", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const uploadPostFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return api.post<ApiResponse<{ urls: string[] }>>("/uploads/post-files", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<ApiResponse<{ url: string }>>("/uploads/resume", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
