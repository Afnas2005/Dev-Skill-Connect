import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: Joi.string().min(6).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password should have a minimum length of 6",
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required",
    }),
});

export const profileUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    skills: Joi.array()
        .items(
            Joi.object({
                skillName: Joi.string().required(),
                level: Joi.string()
                    .valid("beginner", "intermediate", "advanced")
                    .required(),
            })
        )
        .optional(),
});
