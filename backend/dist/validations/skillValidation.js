"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.skillUserIdParamSchema = exports.skillIdParamSchema = exports.updateSkillSchema = exports.createSkillSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const levelSchema = joi_1.default.string()
    .valid("beginner", "intermediate", "advanced")
    .required();
exports.createSkillSchema = joi_1.default.object({
    skillName: joi_1.default.string().min(2).max(80).required(),
    level: levelSchema,
    description: joi_1.default.string().max(1000).allow("").optional(),
    attachments: joi_1.default.array().items(joi_1.default.string().uri()).max(5).optional(),
});
exports.updateSkillSchema = joi_1.default.object({
    skillName: joi_1.default.string().min(2).max(80).optional(),
    level: joi_1.default.string().valid("beginner", "intermediate", "advanced").optional(),
    description: joi_1.default.string().max(1000).allow("").optional(),
    attachments: joi_1.default.array().items(joi_1.default.string().uri()).max(5).optional(),
}).min(1);
exports.skillIdParamSchema = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
exports.skillUserIdParamSchema = joi_1.default.object({
    userId: joi_1.default.string().hex().length(24).required(),
});
