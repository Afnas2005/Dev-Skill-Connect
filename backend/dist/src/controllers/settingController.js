"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMyAccount = exports.updateMySettings = exports.getMySettings = void 0;
const http_1 = require("../config/http");
const response_1 = require("../utils/response");
const settingService = __importStar(require("../services/settingService"));
const getMySettings = async (req, res, next) => {
    try {
        const result = await settingService.getMySettings(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Settings fetched successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.getMySettings = getMySettings;
const updateMySettings = async (req, res, next) => {
    try {
        const result = await settingService.updateMySettings(req.user.userId, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Settings updated successfully", result);
    }
    catch (error) {
        const knownErrors = [
            "User not found",
            "Email already in use",
            "Password confirmation does not match",
            "Current password is required",
            "Current password is incorrect",
        ];
        if (knownErrors.includes(error.message)) {
            return (0, response_1.sendResponse)(res, 400, false, error.message);
        }
        return next(error);
    }
};
exports.updateMySettings = updateMySettings;
const deleteMyAccount = async (req, res, next) => {
    try {
        const result = await settingService.deleteMyAccount(req.user.userId);
        res.clearCookie("accessToken", (0, http_1.getClearCookieOptions)());
        res.clearCookie("refreshToken", (0, http_1.getClearCookieOptions)());
        return (0, response_1.sendResponse)(res, 200, true, "Account deleted successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.deleteMyAccount = deleteMyAccount;
