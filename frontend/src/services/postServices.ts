import api from "./api";
import type { ApiResponse, AppPost, FeedPost, PostPayload } from "@/types/domain";

export const createPost = async (payload: PostPayload) => {
    return api.post<ApiResponse<AppPost>>("/posts", payload);
};

export const getMyPosts = async () => {
    return api.get<ApiResponse<AppPost[]>>("/posts/me");
};

export const getFeedPosts = async () => {
    return api.get<ApiResponse<FeedPost[]>>("/posts/feed");
};
