"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationIdParamSchema = exports.notificationsQuerySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.notificationsQuerySchema = joi_1.default.object({
    type: joi_1.default.string().valid("all", "connections", "mentions", "skills").optional(),
});
exports.notificationIdParamSchema = joi_1.default.object({
    id: joi_1.default.string().hex().length(24).required(),
});
