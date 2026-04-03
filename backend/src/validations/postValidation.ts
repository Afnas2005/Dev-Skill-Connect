import Joi from "joi";

const codeLangSchema = Joi.string()
    .valid("typescript", "javascript", "python", "java", "go", "rust", "cpp", "other")
    .optional();

const urlList = Joi.array().items(Joi.string().uri()).max(10).optional();

export const createPostSchema = Joi.object({
    content: Joi.string().max(3000).allow("").optional(),
    codeSnippet: Joi.string().max(12000).allow("").optional(),
    codeLanguage: codeLangSchema,
    screenshots: urlList,
    attachments: urlList,
    visibility: Joi.string().valid("public", "private").optional(),
    status: Joi.string().valid("draft", "published").optional(),
    scheduledAt: Joi.date().iso().allow(null).optional(),
});
