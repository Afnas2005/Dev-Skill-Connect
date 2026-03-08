"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markRead = exports.markAllRead = exports.getMyNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const seedDefaults = async (userId) => {
    const existing = await Notification_1.default.countDocuments({ userId });
    if (existing > 0)
        return;
    const now = Date.now();
    await Notification_1.default.insertMany([
        {
            userId,
            type: "connections",
            name: "Sarah Smith",
            message: "sent you a connection request.",
            actionLabel: "Accept",
            secondaryAction: "Decline",
            unread: true,
            createdAt: new Date(now - 2 * 60 * 60 * 1000),
        },
        {
            userId,
            type: "skills",
            name: "John Doe",
            message: "endorsed you for React & TypeScript.",
            actionLabel: "View Profile",
            unread: true,
            createdAt: new Date(now - 5 * 60 * 60 * 1000),
        },
        {
            userId,
            type: "mentions",
            name: "Michael Chen",
            message: 'liked your post "10 Tips for Optimizing Next.js Performance".',
            actionLabel: "View Post",
            unread: false,
            createdAt: new Date(now - 26 * 60 * 60 * 1000),
        },
        {
            userId,
            type: "mentions",
            name: "Elena Rodriguez",
            message: '@alex_fullstack commented: "This is exactly the breakdown I needed..."',
            actionLabel: "View & Reply",
            unread: false,
            createdAt: new Date(now - 32 * 60 * 60 * 1000),
        },
    ]);
};
const toGroup = (date) => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(midnight.getTime() - 24 * 60 * 60 * 1000);
    if (date >= midnight)
        return "today";
    if (date >= yesterdayMidnight)
        return "yesterday";
    return "yesterday";
};
const toTimeLabel = (date) => {
    const diffMs = Date.now() - date.getTime();
    const hours = Math.floor(diffMs / (60 * 60 * 1000));
    if (hours < 24) {
        return `${Math.max(1, hours)} hour${hours === 1 ? "" : "s"} ago`;
    }
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
    })}`;
};
const getMyNotifications = async (userId, type) => {
    await seedDefaults(userId);
    const filter = { userId };
    if (type && type !== "all") {
        filter.type = type;
    }
    const notifications = await Notification_1.default.find(filter).sort({ createdAt: -1 }).lean();
    return notifications.map((item) => ({
        id: String(item._id),
        actorId: item.actorId ? String(item.actorId) : undefined,
        type: item.type,
        group: toGroup(new Date(item.createdAt)),
        name: item.name,
        message: item.message,
        actionLabel: item.actionLabel,
        secondaryAction: item.secondaryAction || "",
        unread: item.unread,
        time: toTimeLabel(new Date(item.createdAt)),
        createdAt: new Date(item.createdAt).toISOString(),
    }));
};
exports.getMyNotifications = getMyNotifications;
const markAllRead = async (userId) => {
    await Notification_1.default.updateMany({ userId, unread: true }, { unread: false });
    return (0, exports.getMyNotifications)(userId, "all");
};
exports.markAllRead = markAllRead;
const markRead = async (userId, notificationId) => {
    const updated = await Notification_1.default.findOneAndUpdate({ _id: notificationId, userId }, { unread: false }, { new: true });
    if (!updated) {
        throw new Error("Notification not found");
    }
    return { id: String(updated._id), unread: updated.unread };
};
exports.markRead = markRead;
const deleteNotification = async (userId, notificationId) => {
    const deleted = await Notification_1.default.findOneAndDelete({ _id: notificationId, userId });
    if (!deleted) {
        throw new Error("Notification not found");
    }
    return { id: String(deleted._id) };
};
exports.deleteNotification = deleteNotification;
