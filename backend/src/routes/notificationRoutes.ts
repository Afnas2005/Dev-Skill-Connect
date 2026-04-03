import express from "express";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
    getMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    removeNotification,
} from "../controllers/notificationController";
import {
    notificationIdParamSchema,
    notificationsQuerySchema,
} from "../validations/notificationValidation";

const router = express.Router();

router.get("/", authMiddleware, validate({ query: notificationsQuerySchema }), getMyNotifications);
router.patch("/read-all", authMiddleware, markAllNotificationsRead);
router.patch(
    "/:id/read",
    authMiddleware,
    validate({ params: notificationIdParamSchema }),
    markNotificationRead
);
router.delete(
    "/:id",
    authMiddleware,
    validate({ params: notificationIdParamSchema }),
    removeNotification
);

export default router;
