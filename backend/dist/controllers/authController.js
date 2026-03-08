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
exports.googleAuth = exports.logout = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const response_1 = require("../utils/response");
const authService = __importStar(require("../services/authService"));
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
        const { user, token } = await authService.loginUser(req.body);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });
        (0, response_1.sendResponse)(res, 200, true, "Login successful", { user, token });
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
const logout = (req, res, next) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
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
        const { user, token } = await authService.googleAuth(credential);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000,
        });
        (0, response_1.sendResponse)(res, 200, true, "Google login successful", { user, token });
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
