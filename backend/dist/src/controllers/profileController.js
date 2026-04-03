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
exports.getPublicProfile = exports.updateMyProfile = exports.getMyProfile = void 0;
const response_1 = require("../utils/response");
const profileService = __importStar(require("../services/profileService"));
const getMyProfile = async (req, res, next) => {
    try {
        const result = await profileService.getMyProfile(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Profile fetched successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res, next) => {
    try {
        const result = await profileService.updateMyProfile(req.user.userId, req.body);
        return (0, response_1.sendResponse)(res, 200, true, "Profile updated successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.updateMyProfile = updateMyProfile;
const getPublicProfile = async (req, res, next) => {
    try {
        const result = await profileService.getPublicProfile(String(req.params.userId));
        return (0, response_1.sendResponse)(res, 200, true, "Public profile fetched successfully", result);
    }
    catch (error) {
        if (error.message === "User not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.getPublicProfile = getPublicProfile;
