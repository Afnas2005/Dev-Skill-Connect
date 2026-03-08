import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as notificationService from "../services/notificationService";

export const getMyNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await notificationService.getMyNotifications(
            req.user!.userId,
            req.query.type as "all" | "connections" | "mentions" | "skills" | undefined
        );
        return sendResponse(res, 200, true, "Notifications fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const markAllNotificationsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await notificationService.markAllRead(req.user!.userId);
        return sendResponse(res, 200, true, "All notifications marked as read", result);
    } catch (error) {
        return next(error);
    }
};

export const markNotificationRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await notificationService.markRead(req.user!.userId, String(req.params.id));
        return sendResponse(res, 200, true, "Notification marked as read", result);
    } catch (error: any) {
        if (error.message === "Notification not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};

export const removeNotification = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await notificationService.deleteNotification(
            req.user!.userId,
            String(req.params.id)
        );
        return sendResponse(res, 200, true, "Notification deleted", result);
    } catch (error: any) {
        if (error.message === "Notification not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};
