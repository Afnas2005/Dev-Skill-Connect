import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { sendResponse } from "../utils/response";
import * as uploadService from "../services/uploadService";

export const uploadProfileImage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const file = req.file as { buffer: Buffer; mimetype: string } | undefined;
        if (!file) {
            return sendResponse(res, 400, false, "Profile image file is required");
        }

        const url = await uploadService.uploadSingleFile(file, "profile-images");
        return sendResponse(res, 200, true, "Profile image uploaded successfully", {
            url,
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadSkillAttachments = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const files = req.files as
            | Array<{ buffer: Buffer; mimetype: string }>
            | undefined;
        if (!files || files.length === 0) {
            return sendResponse(res, 400, false, "At least one attachment file is required");
        }

        const urls = await uploadService.uploadMultipleFiles(files, "skill-attachments");
        return sendResponse(res, 200, true, "Skill attachments uploaded successfully", {
            urls,
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadPostScreenshots = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const files = req.files as
            | Array<{ buffer: Buffer; mimetype: string }>
            | undefined;
        if (!files || files.length === 0) {
            return sendResponse(res, 400, false, "At least one screenshot file is required");
        }

        const urls = await uploadService.uploadMultipleFiles(files, "post-screenshots");
        return sendResponse(res, 200, true, "Post screenshots uploaded successfully", {
            urls,
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadPostFiles = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const files = req.files as
            | Array<{ buffer: Buffer; mimetype: string }>
            | undefined;
        if (!files || files.length === 0) {
            return sendResponse(res, 400, false, "At least one attachment file is required");
        }

        const urls = await uploadService.uploadMultipleFiles(files, "post-files");
        return sendResponse(res, 200, true, "Post files uploaded successfully", {
            urls,
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadResume = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const file = req.file as
            | { buffer: Buffer; mimetype: string; originalname?: string }
            | undefined;
        if (!file) {
            return sendResponse(res, 400, false, "Resume file is required");
        }

        const url = await uploadService.uploadSingleFile(file, "resumes");
        return sendResponse(res, 200, true, "Resume uploaded successfully", {
            url,
        });
    } catch (error) {
        return next(error);
    }
};
