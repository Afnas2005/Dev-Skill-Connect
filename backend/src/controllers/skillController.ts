import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as skillService from "../services/skillService";

export const createSkill = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await skillService.createSkill(req.user!.userId, req.body);
        return sendResponse(res, 201, true, "Skill created successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const updateSkill = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await skillService.updateSkill(
            req.user!.userId,
            String(req.params.id),
            req.body
        );
        return sendResponse(res, 200, true, "Skill updated successfully", result);
    } catch (error: any) {
        if (error.message === "Skill not found") {
            return sendResponse(res, 404, false, error.message);
        }
        if (error.message === "Forbidden") {
            return sendResponse(res, 403, false, "You can only edit your own skill");
        }
        return next(error);
    }
};

export const deleteSkill = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await skillService.deleteSkill(req.user!.userId, String(req.params.id));
        return sendResponse(res, 200, true, "Skill deleted successfully", result);
    } catch (error: any) {
        if (error.message === "Skill not found") {
            return sendResponse(res, 404, false, error.message);
        }
        if (error.message === "Forbidden") {
            return sendResponse(res, 403, false, "You can only delete your own skill");
        }
        return next(error);
    }
};

export const getMySkills = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await skillService.getMySkills(req.user!.userId);
        return sendResponse(res, 200, true, "Skills fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const getSkillsByUserId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await skillService.getSkillsByUserId(String(req.params.userId));
        return sendResponse(res, 200, true, "Public skills fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};
