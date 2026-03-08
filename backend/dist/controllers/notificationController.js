"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeNotification = exports.markNotificationRead = exports.markAllNotificationsRead = exports.getMyNotifications = void 0;
const response_1 = require("../utils/response");
const notificationService = __importStar(require("../services/notificationService"));
const getMyNotifications = async (req, res, next) => {
    try {
        const result = await notificationService.getMyNotifications(req.user.userId, req.query.type);
        return (0, response_1.sendResponse)(res, 200, true, "Notifications fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getMyNotifications = getMyNotifications;
const markAllNotificationsRead = async (req, res, next) => {
    try {
        const result = await notificationService.markAllRead(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "All notifications marked as read", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
const markNotificationRead = async (req, res, next) => {
    try {
        const result = await notificationService.markRead(req.user.userId, String(req.params.id));
        return (0, response_1.sendResponse)(res, 200, true, "Notification marked as read", result);
    }
    catch (error) {
        if (error.message === "Notification not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.markNotificationRead = markNotificationRead;
const removeNotification = async (req, res, next) => {
    try {
        const result = await notificationService.deleteNotification(req.user.userId, String(req.params.id));
        return (0, response_1.sendResponse)(res, 200, true, "Notification deleted", result);
    }
    catch (error) {
        if (error.message === "Notification not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.removeNotification = removeNotification;
