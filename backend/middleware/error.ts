import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error("[ERROR]", err);

    if (err?.name === "MulterError") {
        return sendResponse(res, 400, false, err.message);
    }

    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    sendResponse(res, statusCode, false, message, process.env.NODE_ENV === "development" ? err.stack : null);
};
