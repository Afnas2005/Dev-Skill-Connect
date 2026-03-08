"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).optional(),
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password should have a minimum length of 6",
    }),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.empty": "Email is required",
    }),
    password: joi_1.default.string().required().messages({
        "string.empty": "Password is required",
    }),
});
exports.profileUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(50).optional(),
    skills: joi_1.default.array()
        .items(joi_1.default.object({
        skillName: joi_1.default.string().required(),
        level: joi_1.default.string()
            .valid("beginner", "intermediate", "advanced")
            .required(),
    }))
        .optional(),
});
