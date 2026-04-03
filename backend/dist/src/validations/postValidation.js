"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const codeLangSchema = joi_1.default.string()
    .valid("typescript", "javascript", "python", "java", "go", "rust", "cpp", "other")
    .optional();
const urlList = joi_1.default.array().items(joi_1.default.string().uri()).max(10).optional();
exports.createPostSchema = joi_1.default.object({
    content: joi_1.default.string().max(3000).allow("").optional(),
    codeSnippet: joi_1.default.string().max(12000).allow("").optional(),
    codeLanguage: codeLangSchema,
    screenshots: urlList,
    attachments: urlList,
    visibility: joi_1.default.string().valid("public", "private").optional(),
    status: joi_1.default.string().valid("draft", "published").optional(),
    scheduledAt: joi_1.default.date().iso().allow(null).optional(),
});
