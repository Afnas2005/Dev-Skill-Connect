import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";
import { verifyAccessToken } from "../services/authService";

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
    file?: any;
    files?: any;
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
        const token = req.cookies.accessToken || bearerToken;

        if (!token) {
            return sendResponse(res, 401, false, "Not authenticated. No token.");
        }

        const decoded = verifyAccessToken(token);

        if (decoded.type !== "access") {
            return sendResponse(res, 401, false, "Invalid token");
        }

        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return sendResponse(res, 401, false, "Token expired");
        }
        return sendResponse(res, 401, false, "Invalid token");
    }
};
