import ConnectionRequest from "../models/ConnectionRequest";
import Notification, { NotificationType } from "../models/Notification";
import User from "../models/User";

const syncConnectionRequestNotifications = async (userId: string) => {
    const pendingRequests = await ConnectionRequest.find({
        receiverId: userId,
        status: "pending",
    })
        .select("senderId createdAt")
        .sort({ createdAt: -1 })
        .lean();

    const pendingSenderIds = pendingRequests.map((item) => item.senderId.toString());

    await Notification.deleteMany({
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

    const senders = await User.find({ _id: { $in: pendingSenderIds } })
        .select("name email")
        .lean();

    const senderMap = new Map(senders.map((sender) => [sender._id.toString(), sender]));

    for (const request of pendingRequests) {
        const senderId = request.senderId.toString();
        const sender = senderMap.get(senderId);

        if (!sender) {
            continue;
        }

        await Notification.findOneAndUpdate(
            {
                userId,
                actorId: senderId,
                type: "connections",
                actionLabel: "Accept",
            },
            {
                $set: {
                    name: sender.name || sender.email,
                    message: "sent you a connection request.",
                    secondaryAction: "Decline",
                    createdAt: request.createdAt,
                },
                $setOnInsert: {
                    unread: true,
                },
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );
    }
};

const toGroup = (date: Date): "today" | "yesterday" => {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(midnight.getTime() - 24 * 60 * 60 * 1000);
    if (date >= midnight) return "today";
    if (date >= yesterdayMidnight) return "yesterday";
    return "yesterday";
};

const toTimeLabel = (date: Date): string => {
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

export const getMyNotifications = async (
    userId: string,
    type?: NotificationType | "all"
) => {
    await syncConnectionRequestNotifications(userId);

    const filter: Record<string, unknown> = { userId };
    if (type && type !== "all") {
        filter.type = type;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).lean();

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

export const markAllRead = async (userId: string) => {
    await Notification.updateMany({ userId, unread: true }, { unread: false });
    return getMyNotifications(userId, "all");
};

export const markRead = async (userId: string, notificationId: string) => {
    const updated = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { unread: false },
        { new: true }
    );
    if (!updated) {
        throw new Error("Notification not found");
    }
    return { id: String(updated._id), unread: updated.unread };
};

export const deleteNotification = async (userId: string, notificationId: string) => {
    const deleted = await Notification.findOneAndDelete({ _id: notificationId, userId });
    if (!deleted) {
        throw new Error("Notification not found");
    }
    return { id: String(deleted._id) };
};
