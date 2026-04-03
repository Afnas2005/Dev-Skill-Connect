"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingsSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const passwordPattern = joi_1.default.string().min(6).max(80);
exports.updateSettingsSchema = joi_1.default.object({
    email: joi_1.default.string().email().optional(),
    username: joi_1.default.string().min(2).max(50).allow("").optional(),
    currentPassword: joi_1.default.string().allow("").optional(),
    newPassword: passwordPattern.allow("").optional(),
    confirmNewPassword: passwordPattern.allow("").optional(),
    privacy: joi_1.default.object({
        publicProfile: joi_1.default.boolean().optional(),
        showOnlineStatus: joi_1.default.boolean().optional(),
        searchVisibility: joi_1.default.boolean().optional(),
    }).optional(),
    notifications: joi_1.default.object({
        emailRequests: joi_1.default.boolean().optional(),
        emailMessages: joi_1.default.boolean().optional(),
        emailUpdates: joi_1.default.boolean().optional(),
        pushDesktop: joi_1.default.boolean().optional(),
        pushSound: joi_1.default.boolean().optional(),
    }).optional(),
});
