"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.profileUpdateSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const urlOrEmpty = joi_1.default.string().uri().allow("").optional();
exports.profileUpdateSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(80).optional(),
    bio: joi_1.default.string().max(500).allow("").optional(),
    professionalTitle: joi_1.default.string().max(120).allow("").optional(),
    location: joi_1.default.string().max(120).allow("").optional(),
    profileImage: joi_1.default.string().uri().allow("").optional(),
    backgroundImage: joi_1.default.string().uri().allow("").optional(),
    socialLinks: joi_1.default.object({
        github: urlOrEmpty,
        linkedin: urlOrEmpty,
        twitter: urlOrEmpty,
    }).optional(),
});
exports.userIdParamSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
});
