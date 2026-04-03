import Joi from "joi";

const passwordPattern = Joi.string().min(6).max(80);

export const updateSettingsSchema = Joi.object({
    email: Joi.string().email().optional(),
    username: Joi.string().min(2).max(50).allow("").optional(),
    currentPassword: Joi.string().allow("").optional(),
    newPassword: passwordPattern.allow("").optional(),
    confirmNewPassword: passwordPattern.allow("").optional(),
    privacy: Joi.object({
        publicProfile: Joi.boolean().optional(),
        showOnlineStatus: Joi.boolean().optional(),
        searchVisibility: Joi.boolean().optional(),
    }).optional(),
    notifications: Joi.object({
        emailRequests: Joi.boolean().optional(),
        emailMessages: Joi.boolean().optional(),
        emailUpdates: Joi.boolean().optional(),
        pushDesktop: Joi.boolean().optional(),
        pushSound: Joi.boolean().optional(),
    }).optional(),
});
