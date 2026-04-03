import { Response } from "express";

export const sendResponse = (
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data: any = null
) => {
    if (success) {
        return res.status(statusCode).json({
            success,
            message,
            data,
        });
    }

    return res.status(statusCode).json({
        success,
        message,
        ...(data ? { errors: data } : {}),
    });
};
