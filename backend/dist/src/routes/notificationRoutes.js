"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const notificationController_1 = require("../controllers/notificationController");
const notificationValidation_1 = require("../validations/notificationValidation");
const router = express_1.default.Router();
router.get("/", auth_1.authMiddleware, (0, validate_1.validate)({ query: notificationValidation_1.notificationsQuerySchema }), notificationController_1.getMyNotifications);
router.patch("/read-all", auth_1.authMiddleware, notificationController_1.markAllNotificationsRead);
router.patch("/:id/read", auth_1.authMiddleware, (0, validate_1.validate)({ params: notificationValidation_1.notificationIdParamSchema }), notificationController_1.markNotificationRead);
router.delete("/:id", auth_1.authMiddleware, (0, validate_1.validate)({ params: notificationValidation_1.notificationIdParamSchema }), notificationController_1.removeNotification);
exports.default = router;
