import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response";
import * as searchService from "../services/searchService";
import { AuthRequest } from "../middleware/auth";

export const searchSkills = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await searchService.searchSkills({
            skill: req.query.skill as string | undefined,
            level: req.query.level as "beginner" | "intermediate" | "advanced" | undefined,
            viewerId: req.user?.userId,
        });

        return sendResponse(res, 200, true, "Search results fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const connectWithUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await searchService.sendConnectionRequest(
            req.user!.userId,
            String(req.params.userId)
        );
        return sendResponse(res, 201, true, "Connection request sent", result);
    } catch (error: any) {
        if (
            error.message === "You cannot connect with yourself" ||
            error.message === "User not found" ||
            error.message === "Already connected" ||
            error.message === "Connection request already sent"
        ) {
            return sendResponse(res, 400, false, error.message);
        }
        return next(error);
    }
};

export const respondToConnectionRequest = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await searchService.respondToConnectionRequest(
            req.user!.userId,
            String(req.params.userId),
            req.body.action as "accepted" | "rejected"
        );
        return sendResponse(res, 200, true, "Connection request updated", result);
    } catch (error: any) {
        if (error.message === "Connection request not found") {
            return sendResponse(res, 404, false, error.message);
        }
        return next(error);
    }
};
