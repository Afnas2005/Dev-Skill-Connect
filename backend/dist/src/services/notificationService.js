"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markRead = exports.markAllRead = exports.getMyNotifications = void 0;
const ConnectionRequest_1 = __importDefault(require("../models/ConnectionRequest"));
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
const syncConnectionRequestNotifications = async (userId) => {
    const pendingRequests = await ConnectionRequest_1.default.find({
        receiverId: userId,
        status: "pending",
    })
        .select("senderId createdAt")
        .sort({ createdAt: -1 })
        .lean();
    const pendingSenderIds = pendingRequests.map((item) => item.senderId.toString());
    await Notification_1.default.deleteMany({
        userId,
        type: "connections",
        actionLabel: "Accept",
        ...(pendingSenderIds.length > 0
            ? { actorId: { $nin: pendingSenderIds } }
            : {}),
    });
    if (pendingSenderIds.length === 0) {
        return;
    }
    const senders = await User_1.default.find({ _id: { $in: pendingSenderIds } })
        .select("name email")
        .lean();
    const senderMap = new Map(senders.map((sender) => [sender._id.toString(), sender]));
    for (const request of pendingRequests) {
        const senderId = request.senderId.toString();
        const sender = senderMap.get(senderId);
        if (!sender) {
            continue;
        }
        await Notification_1.default.findOneAndUpdate({
            userId,
            actorId: senderId,
            type: "connections",
            actionLabel: "Accept",
        }, {
            $set: {
                name: sender.name || sender.email,
                message: "sent you a connection request.",
                secondaryAction: "Decline",
                createdAt: request.createdAt,
            },
            $setOnInsert: {
                unread: true,
            },
        }, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
    }
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
    await syncConnectionRequestNotifications(userId);
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
