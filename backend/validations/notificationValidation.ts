import Joi from "joi";

export const notificationsQuerySchema = Joi.object({
    type: Joi.string().valid("all", "connections", "mentions", "skills").optional(),
});

export const notificationIdParamSchema = Joi.object({
    id: Joi.string().hex().length(24).required(),
});
