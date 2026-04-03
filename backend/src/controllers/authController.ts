import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import {
    getAccessCookieOptions,
    getRefreshCookieOptions,
    getClearCookieOptions,
} from "../config/http";
import { sendResponse } from "../utils/response";
import * as authService from "../services/authService";

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
    res.cookie("accessToken", accessToken, getAccessCookieOptions());
    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());
};

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await authService.registerUser(req.body);
        sendResponse(res, 201, true, "User registered successfully", result);
    } catch (error: any) {
        if (error.message === "User already exists") {
            return sendResponse(res, 400, false, error.message);
        }
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

        setAuthCookies(res, accessToken, refreshToken);

        sendResponse(res, 200, true, "Login successful", { user, accessToken });
    } catch (error: any) {
        if (error.message === "Invalid email or password") {
            return sendResponse(res, 401, false, error.message);
        }
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;
        const result = await authService.getUserProfile(userId);
        sendResponse(res, 200, true, "User fetched successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        next(error);
    }
};

export const updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user!.userId;
        const result = await authService.updateUserProfile(userId, req.body);
        sendResponse(res, 200, true, "Profile updated successfully", result);
    } catch (error: any) {
        if (error.message === "User not found") {
            return sendResponse(res, 404, false, error.message);
        }
        next(error);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as AuthRequest).user?.userId;
        await authService.revokeRefreshToken(userId);
        res.clearCookie("accessToken", getClearCookieOptions());
        res.clearCookie("refreshToken", getClearCookieOptions());
        sendResponse(res, 200, true, "Logged out successfully");
    } catch (error: any) {
        next(error);
    }
};

export const googleAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return sendResponse(res, 400, false, "Google credential is required");
        }

        const { user, accessToken, refreshToken } = await authService.googleAuth(credential);

        setAuthCookies(res, accessToken, refreshToken);

        sendResponse(res, 200, true, "Google login successful", { user, accessToken });
    } catch (error: any) {
        if (error.message === "Invalid Google token") {
            return sendResponse(res, 401, false, error.message);
        }

        if (error.message?.startsWith("Google OAuth is not configured")) {
            return sendResponse(res, 500, false, error.message);
        }

        next(error);
    }
};

export const refreshSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return sendResponse(res, 401, false, "Refresh token missing");
        }

        const { user, accessToken, refreshToken: nextRefreshToken } =
            await authService.refreshAuthSession(refreshToken);

        setAuthCookies(res, accessToken, nextRefreshToken);

        sendResponse(res, 200, true, "Session refreshed", { user, accessToken });
    } catch (error: any) {
        if (error.message === "Invalid refresh token" || error.message === "Refresh token expired") {
            res.clearCookie("accessToken", getClearCookieOptions());
            res.clearCookie("refreshToken", getClearCookieOptions());
            return sendResponse(res, 401, false, error.message);
        }

        next(error);
    }
};
