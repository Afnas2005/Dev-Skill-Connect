import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as postService from "../services/postService";

export const createPost = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await postService.createPost(req.user!.userId, req.body);
        return sendResponse(res, 201, true, "Post created successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const getMyPosts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await postService.getMyPosts(req.user!.userId);
        return sendResponse(res, 200, true, "Posts fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const getFeedPosts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await postService.getFeedPosts();
        return sendResponse(res, 200, true, "Feed posts fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};
