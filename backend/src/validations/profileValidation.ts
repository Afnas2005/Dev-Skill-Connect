import Joi from "joi";

const urlOrEmpty = Joi.string().uri().allow("").optional();

export const profileUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(80).optional(),
    bio: Joi.string().max(500).allow("").optional(),
    professionalTitle: Joi.string().max(120).allow("").optional(),
    location: Joi.string().max(120).allow("").optional(),
    profileImage: Joi.string().uri().allow("").optional(),
    backgroundImage: Joi.string().uri().allow("").optional(),
    resumeUrl: Joi.string().uri().allow("").optional(),
    socialLinks: Joi.object({
        github: urlOrEmpty,
        linkedin: urlOrEmpty,
        twitter: urlOrEmpty,
    }).optional(),
});

export const userIdParamSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
});
