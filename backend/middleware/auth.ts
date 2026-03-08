import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/response";

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
        const token = req.cookies.token;

        if (!token) {
            return sendResponse(res, 401, false, "Not authenticated. No token.");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            userId: string;
            email: string;
        };

        req.user = decoded;
        next();
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            return sendResponse(res, 401, false, "Token expired");
        }
        return sendResponse(res, 401, false, "Invalid token");
    }
};
