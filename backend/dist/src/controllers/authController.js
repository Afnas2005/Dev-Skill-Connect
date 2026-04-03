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
exports.refreshSession = exports.googleAuth = exports.logout = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const http_1 = require("../config/http");
const response_1 = require("../utils/response");
const authService = __importStar(require("../services/authService"));
const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, (0, http_1.getAccessCookieOptions)());
    res.cookie("refreshToken", refreshToken, (0, http_1.getRefreshCookieOptions)());
};
const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        (0, response_1.sendResponse)(res, 201, true, "User registered successfully", result);
    }
    catch (error) {
        if (error.message === "User already exists") {
            return (0, response_1.sendResponse)(res, 400, false, error.message);
        }
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
        setAuthCookies(res, accessToken, refreshToken);
        (0, response_1.sendResponse)(res, 200, true, "Login successful", { user, accessToken });
    }
    catch (error) {
        if (error.message === "Invalid email or password") {
            return (0, response_1.sendResponse)(res, 401, false, error.message);
        }
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await authService.getUserProfile(userId);
        (0, response_1.sendResponse)(res, 200, true, "User fetched successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        next(error);
    }
};
exports.getMe = getMe;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await authService.updateUserProfile(userId, req.body);
        (0, response_1.sendResponse)(res, 200, true, "Profile updated successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        next(error);
    }
};
exports.updateProfile = updateProfile;
const logout = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        await authService.revokeRefreshToken(userId);
        res.clearCookie("accessToken", (0, http_1.getClearCookieOptions)());
        res.clearCookie("refreshToken", (0, http_1.getClearCookieOptions)());
        (0, response_1.sendResponse)(res, 200, true, "Logged out successfully");
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const googleAuth = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return (0, response_1.sendResponse)(res, 400, false, "Google credential is required");
        }
        const { user, accessToken, refreshToken } = await authService.googleAuth(credential);
        setAuthCookies(res, accessToken, refreshToken);
        (0, response_1.sendResponse)(res, 200, true, "Google login successful", { user, accessToken });
    }
    catch (error) {
        if (error.message === "Invalid Google token") {
            return (0, response_1.sendResponse)(res, 401, false, error.message);
        }
        if (error.message?.startsWith("Google OAuth is not configured")) {
            return (0, response_1.sendResponse)(res, 500, false, error.message);
        }
        next(error);
    }
};
exports.googleAuth = googleAuth;
const refreshSession = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return (0, response_1.sendResponse)(res, 401, false, "Refresh token missing");
        }
        const { user, accessToken, refreshToken: nextRefreshToken } = await authService.refreshAuthSession(refreshToken);
        setAuthCookies(res, accessToken, nextRefreshToken);
        (0, response_1.sendResponse)(res, 200, true, "Session refreshed", { user, accessToken });
    }
    catch (error) {
        if (error.message === "Invalid refresh token" || error.message === "Refresh token expired") {
            res.clearCookie("accessToken", (0, http_1.getClearCookieOptions)());
            res.clearCookie("refreshToken", (0, http_1.getClearCookieOptions)());
            return (0, response_1.sendResponse)(res, 401, false, error.message);
        }
        next(error);
    }
};
exports.refreshSession = refreshSession;
