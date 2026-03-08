import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as authService from "../services/authService";

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
        const { user, token } = await authService.loginUser(req.body);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        sendResponse(res, 200, true, "Login successful", { user, token });
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

export const logout = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

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

        const { user, token } = await authService.googleAuth(credential);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });

        sendResponse(res, 200, true, "Google login successful", { user, token });
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
