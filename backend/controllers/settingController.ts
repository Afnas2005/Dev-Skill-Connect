import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as settingService from "../services/settingService";

export const getMySettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await settingService.getMySettings(req.user!.userId);
        return sendResponse(res, 200, true, "Settings fetched successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};

export const updateMySettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await settingService.updateMySettings(req.user!.userId, req.body);
        return sendResponse(res, 200, true, "Settings updated successfully", result);
    } catch (error: any) {
        const knownErrors = [
            "User not found",
            "Email already in use",
            "Password confirmation does not match",
            "Current password is required",
            "Current password is incorrect",
        ];
        if (knownErrors.includes(error.message)) {
            return sendResponse(res, 400, false, error.message);
        }
        return next(error);
    }
};

export const deleteMyAccount = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await settingService.deleteMyAccount(req.user!.userId);
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
        return sendResponse(res, 200, true, "Account deleted successfully", result);
    } catch (error) {
        return next(error);
    }
};
