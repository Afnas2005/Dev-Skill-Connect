import Joi from "joi";

export const searchQuerySchema = Joi.object({
    skill: Joi.string().min(1).max(80).optional(),
    level: Joi.string()
        .valid("beginner", "intermediate", "advanced")
        .optional(),
});

export const connectActionBodySchema = Joi.object({
    action: Joi.string().valid("accepted", "rejected").required(),
});
