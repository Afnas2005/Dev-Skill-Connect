"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const response_1 = require("../utils/response");
const authService_1 = require("../services/authService");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
        const token = req.cookies.accessToken || bearerToken;
        if (!token) {
            return (0, response_1.sendResponse)(res, 401, false, "Not authenticated. No token.");
        }
        const decoded = (0, authService_1.verifyAccessToken)(token);
        if (decoded.type !== "access") {
            return (0, response_1.sendResponse)(res, 401, false, "Invalid token");
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return (0, response_1.sendResponse)(res, 401, false, "Token expired");
        }
        return (0, response_1.sendResponse)(res, 401, false, "Invalid token");
    }
};
exports.authMiddleware = authMiddleware;
