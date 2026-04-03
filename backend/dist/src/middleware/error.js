"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const errorHandler = (err, req, res, next) => {
    console.error("[ERROR]", err);
    if (err?.name === "MulterError") {
        return (0, response_1.sendResponse)(res, 400, false, err.message);
    }
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    (0, response_1.sendResponse)(res, statusCode, false, message, process.env.NODE_ENV === "development" ? err.stack : null);
};
exports.errorHandler = errorHandler;
