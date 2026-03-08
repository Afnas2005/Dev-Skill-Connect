import Joi from "joi";

const levelSchema = Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required();

export const createSkillSchema = Joi.object({
    skillName: Joi.string().min(2).max(80).required(),
    level: levelSchema,
    description: Joi.string().max(1000).allow("").optional(),
    attachments: Joi.array().items(Joi.string().uri()).max(5).optional(),
});

export const updateSkillSchema = Joi.object({
    skillName: Joi.string().min(2).max(80).optional(),
    level: Joi.string().valid("beginner", "intermediate", "advanced").optional(),
    description: Joi.string().max(1000).allow("").optional(),
    attachments: Joi.array().items(Joi.string().uri()).max(5).optional(),
}).min(1);

export const skillIdParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});

export const skillUserIdParamSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
});
