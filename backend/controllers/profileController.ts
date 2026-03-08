import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as profileService from "../services/profileService";

export const getMyProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await profileService.getMyProfile(req.user!.userId);
        return sendResponse(res, 200, true, "Profile fetched successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};

export const updateMyProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await profileService.updateMyProfile(req.user!.userId, req.body);
        return sendResponse(res, 200, true, "Profile updated successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};

export const getPublicProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await profileService.getPublicProfile(String(req.params.userId));
        return sendResponse(res, 200, true, "Public profile fetched successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};
