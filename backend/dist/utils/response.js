"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, statusCode, success, message, data = null) => {
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
exports.sendResponse = sendResponse;
