import mongoose from "mongoose";
import ChatMessage from "../models/ChatMessage";
import ConnectionRequest from "../models/ConnectionRequest";
import Conversation from "../models/Conversation";
import User from "../models/User";
import { isUserOnline } from "../realtime/presence";

const toObjectIdString = (value: unknown) => String(value);

const buildParticipantKey = (userA: string, userB: string) => {
    return [userA, userB].sort().join(":");
};

const mapUserToChatContact = (user: {
    _id: unknown;
    name?: string;
    email: string;
    professionalTitle?: string;
    profileImage?: string;
}) => ({
    id: toObjectIdString(user._id),
    name: user.name || "",
    email: user.email,
    professionalTitle: user.professionalTitle || "",
    profileImage: user.profileImage || "",
    isOnline: isUserOnline(toObjectIdString(user._id)),
});

export const getConnectedUserIds = async (userId: string) => {
    const requests = await ConnectionRequest.find({
        status: "accepted",
        $or: [{ senderId: userId }, { receiverId: userId }],
    })
        .select("senderId receiverId")
        .lean();

    return requests.map((item) =>
        item.senderId.toString() === userId
            ? item.receiverId.toString()
            : item.senderId.toString()
    );
};

const ensureUsersCanChat = async (userId: string, otherUserId: string) => {
    if (userId === otherUserId) {
        throw new Error("You cannot chat with yourself");
    }

    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        throw new Error("User not found");
    }

    const otherUser = await User.findById(otherUserId).select("_id");
    if (!otherUser) {
        throw new Error("User not found");
    }

    const isConnected = await ConnectionRequest.exists({
        status: "accepted",
        $or: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
        ],
    });

    if (!isConnected) {
        throw new Error("You can only chat with accepted connections");
    }
};

const mapConversationSummary = (
    conversation: {
        _id: unknown;
        isGroup?: boolean;
        name?: string;
        participantIds?: Array<{ toString(): string }>;
        lastMessageText?: string;
        lastMessageAt?: Date | string | null;
        createdAt?: Date | string;
    },
    users: Array<{
        _id: unknown;
        name?: string;
        email: string;
        professionalTitle?: string;
        profileImage?: string;
    }>,
    currentUserId: string
) => ({
    id: toObjectIdString(conversation._id),
    isGroup: Boolean(conversation.isGroup),
    name: conversation.name || "",
    adminId: "adminId" in conversation && conversation.adminId ? toObjectIdString(conversation.adminId) : "",
    lastMessageText: conversation.lastMessageText || "",
    lastMessageAt:
        conversation.lastMessageAt?.toString() ||
        conversation.createdAt?.toString() ||
        new Date().toISOString(),
    participant:
        users
            .filter((user) => toObjectIdString(user._id) !== currentUserId)
            .map(mapUserToChatContact)[0] || null,
    participants: users.map(mapUserToChatContact),
});

const mapMessage = (message: {
    _id: unknown;
    conversationId: unknown;
    senderId?: unknown;
    sender?: {
        _id: unknown;
        name?: string;
        email: string;
        profileImage?: string;
    } | null;
    content: string;
    createdAt: Date;
    type?: "text" | "call" | "voice";
    callMeta?: {
        callType?: "audio" | "video";
        status?: "completed" | "missed" | "declined";
        durationSeconds?: number;
    };
    voiceMeta?: {
        audioUrl?: string;
        durationSeconds?: number;
    };
}) => ({
    id: toObjectIdString(message._id),
    conversationId: toObjectIdString(message.conversationId),
    senderId: message.senderId ? toObjectIdString(message.senderId) : null,
    sender: message.sender
        ? {
              id: toObjectIdString(message.sender._id),
              name: message.sender.name || "",
              email: message.sender.email,
              profileImage: message.sender.profileImage || "",
          }
        : null,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    type: message.type || "text",
    callMeta:
        message.type === "call" && message.callMeta
            ? {
                  callType: message.callMeta.callType as "audio" | "video",
                  status: message.callMeta.status as "completed" | "missed" | "declined",
                  durationSeconds: message.callMeta.durationSeconds || 0,
              }
            : undefined,
    voiceMeta:
        message.type === "voice" && message.voiceMeta
            ? {
                  audioUrl: message.voiceMeta.audioUrl as string,
                  durationSeconds: message.voiceMeta.durationSeconds || 0,
              }
            : undefined,
});

export const getChatContacts = async (userId: string) => {
    const connectedIds = await getConnectedUserIds(userId);

    if (connectedIds.length === 0) {
        return [];
    }

    const users = await User.find({ _id: { $in: connectedIds } })
        .select("name email professionalTitle profileImage")
        .sort({ name: 1, email: 1 })
        .lean();

    return users.map((user) => ({
        ...mapUserToChatContact(user),
    }));
};

export const getOrCreateDirectConversation = async (userId: string, otherUserId: string) => {
    await ensureUsersCanChat(userId, otherUserId);

    const participantKey = buildParticipantKey(userId, otherUserId);

    const conversation = await Conversation.findOneAndUpdate(
        { participantKey },
        {
            $setOnInsert: {
                participantIds: [userId, otherUserId].sort(),
                participantKey,
                lastMessageText: "",
            },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const partner = await User.findById(otherUserId)
        .select("name email professionalTitle profileImage")
        .lean();

    if (!conversation || !partner) {
        throw new Error("Conversation could not be created");
    }

    return mapConversationSummary(conversation, [partner], userId);
};

export const createGroupConversation = async (
    userId: string,
    name: string,
    participantIds: string[]
) => {
    const trimmedName = name.trim();
    const uniqueParticipantIds = Array.from(
        new Set(participantIds.map((value) => value.trim()).filter(Boolean))
    ).filter((participantId) => participantId !== userId);

    if (!trimmedName) {
        throw new Error("Group name is required");
    }

    if (uniqueParticipantIds.length < 2) {
        throw new Error("Select at least two connected people");
    }

    const connectedIds = await getConnectedUserIds(userId);
    const connectedSet = new Set(connectedIds);
    const hasInvalidParticipant = uniqueParticipantIds.some(
        (participantId) =>
            !mongoose.Types.ObjectId.isValid(participantId) || !connectedSet.has(participantId)
    );

    if (hasInvalidParticipant) {
        throw new Error("You can only add accepted connections");
    }

    const allParticipantIds = [userId, ...uniqueParticipantIds];
    const users = await User.find({ _id: { $in: allParticipantIds } })
        .select("name email professionalTitle profileImage")
        .lean();

    if (users.length !== allParticipantIds.length) {
        throw new Error("Some selected users could not be found");
    }

    const conversation = await Conversation.create({
        isGroup: true,
        name: trimmedName,
        adminId: userId,
        participantIds: allParticipantIds,
        lastMessageText: "",
    });

    return mapConversationSummary(conversation.toObject(), users, userId);
};

const ensureGroupConversationAdmin = async (userId: string, conversationId: string) => {
    const { conversation, participants } = await getConversationByIdForUser(userId, conversationId);

    if (!conversation.isGroup) {
        throw new Error("Only group conversations can be managed");
    }

    if (!conversation.adminId || conversation.adminId.toString() !== userId) {
        throw new Error("Only the group admin can manage members");
    }

    return { conversation, participants };
};

export const addParticipantsToGroupConversation = async (
    userId: string,
    conversationId: string,
    participantIds: string[]
) => {
    const { conversation } = await ensureGroupConversationAdmin(userId, conversationId);
    const uniqueParticipantIds = Array.from(
        new Set(participantIds.map((value) => value.trim()).filter(Boolean))
    ).filter((participantId) => participantId !== userId);

    if (uniqueParticipantIds.length === 0) {
        throw new Error("Select at least one connected person");
    }

    const currentParticipantIds = new Set(conversation.participantIds.map((id) => id.toString()));
    const connectedIds = await getConnectedUserIds(userId);
    const connectedSet = new Set(connectedIds);

    const invalidParticipantId = uniqueParticipantIds.find(
        (participantId) =>
            !mongoose.Types.ObjectId.isValid(participantId) ||
            !connectedSet.has(participantId) ||
            currentParticipantIds.has(participantId)
    );

    if (invalidParticipantId) {
        throw new Error("You can only add new accepted connections");
    }

    const nextParticipantIds = [...currentParticipantIds, ...uniqueParticipantIds];

    await Conversation.findByIdAndUpdate(conversationId, {
        participantIds: nextParticipantIds,
    });

    const users = await User.find({ _id: { $in: nextParticipantIds } })
        .select("name email professionalTitle profileImage")
        .lean();

    return mapConversationSummary(
        {
            ...conversation,
            participantIds: nextParticipantIds as unknown as mongoose.Types.ObjectId[],
        },
        users,
        userId
    );
};

export const removeParticipantFromGroupConversation = async (
    userId: string,
    conversationId: string,
    participantId: string
) => {
    const { conversation } = await ensureGroupConversationAdmin(userId, conversationId);

    if (!mongoose.Types.ObjectId.isValid(participantId)) {
        throw new Error("User not found");
    }

    if (participantId === userId) {
        throw new Error("Group admin cannot remove themselves");
    }

    const currentParticipantIds = conversation.participantIds.map((id) => id.toString());
    if (!currentParticipantIds.includes(participantId)) {
        throw new Error("User is not in this group");
    }

    const nextParticipantIds = currentParticipantIds.filter((id) => id !== participantId);
    if (nextParticipantIds.length < 2) {
        throw new Error("A group must have at least two people");
    }

    await Conversation.findByIdAndUpdate(conversationId, {
        participantIds: nextParticipantIds,
    });

    const users = await User.find({ _id: { $in: nextParticipantIds } })
        .select("name email professionalTitle profileImage")
        .lean();

    return mapConversationSummary(
        {
            ...conversation,
            participantIds: nextParticipantIds as unknown as mongoose.Types.ObjectId[],
        },
        users,
        userId
    );
};

export const getConversationByIdForUser = async (userId: string, conversationId: string) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new Error("Conversation not found");
    }

    const conversation = await Conversation.findOne({
        _id: conversationId,
        participantIds: userId,
    }).lean();

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const participantIds = conversation.participantIds.map((id) => id.toString());
    const participants = await User.find({ _id: { $in: participantIds } })
        .select("name email professionalTitle profileImage")
        .lean();

    if (participants.length === 0) {
        throw new Error("Conversation not found");
    }

    return {
        conversation,
        participants,
    };
};

export const getConversations = async (userId: string) => {
    const conversations = await Conversation.find({ participantIds: userId })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean();

    if (conversations.length === 0) {
        return [];
    }

    const participantIds = Array.from(
        new Set(
            conversations.flatMap((conversation) =>
                conversation.participantIds.map((id) => id.toString())
            )
        )
    );

    const partners = await User.find({ _id: { $in: participantIds } })
        .select("name email professionalTitle profileImage")
        .lean();

    const partnerMap = new Map(partners.map((item) => [item._id.toString(), item]));

    return conversations
        .map((conversation) => {
            const users = conversation.participantIds
                .map((id) => partnerMap.get(id.toString()))
                .filter((value): value is NonNullable<typeof value> => Boolean(value));

            if (users.length === 0) {
                return null;
            }

            return mapConversationSummary(conversation, users, userId);
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value));
};

export const getConversationMessages = async (userId: string, conversationId: string) => {
    const { conversation } = await getConversationByIdForUser(userId, conversationId);

    const messages = await ChatMessage.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .lean();

    const senderIds = Array.from(
        new Set(
            messages
                .map((message) => (message.senderId ? message.senderId.toString() : null))
                .filter((value): value is string => Boolean(value))
        )
    );
    const senders = await User.find({ _id: { $in: senderIds } })
        .select("name email profileImage")
        .lean();
    const senderMap = new Map(senders.map((sender) => [sender._id.toString(), sender]));

    return messages.map((message) =>
        mapMessage({
            ...message,
            sender: message.senderId ? senderMap.get(message.senderId.toString()) || null : null,
        })
    );
};

export const createMessage = async (
    senderId: string,
    conversationId: string,
    content: string
) => {
    const trimmed = content.trim();
    if (!trimmed) {
        throw new Error("Message cannot be empty");
    }

    const { conversation, participants } = await getConversationByIdForUser(senderId, conversationId);
    const conversationSummary = mapConversationSummary(conversation, participants, senderId);
    const sender = participants.find((participant) => participant._id.toString() === senderId) || null;

    const message = await ChatMessage.create({
        conversationId: conversation._id,
        senderId,
        content: trimmed,
    });

    const lastMessageAt = message.createdAt || new Date();

    await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageText: trimmed,
        lastMessageAt,
    });

    return {
        conversation: {
            ...conversationSummary,
            lastMessageText: trimmed,
            lastMessageAt: lastMessageAt.toISOString(),
        },
        message: mapMessage({
            ...message.toObject(),
            conversationId: conversationSummary.id,
            senderId,
            sender,
            content: trimmed,
            createdAt: lastMessageAt,
            type: "text",
        }),
    };
};

const formatCallDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes === 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
};

export const createCallLogMessage = async (
    initiatorId: string,
    recipientId: string,
    callLog: {
        callType: "audio" | "video";
        status: "completed" | "missed" | "declined";
        durationSeconds?: number;
    }
) => {
    const conversationSummary = await getOrCreateDirectConversation(initiatorId, recipientId);
    const durationSeconds =
        callLog.status === "completed" ? Math.max(0, Math.round(callLog.durationSeconds || 0)) : 0;

    const content =
        callLog.status === "completed"
            ? `${callLog.callType === "video" ? "Video" : "Audio"} call · ${formatCallDuration(
                  durationSeconds
              )}`
            : `${callLog.status === "missed" ? "Missed" : "Declined"} ${
                  callLog.callType === "video" ? "video" : "audio"
              } call`;

    const message = await ChatMessage.create({
        conversationId: conversationSummary.id,
        senderId: initiatorId,
        content,
        type: "call",
        callMeta: {
            callType: callLog.callType,
            status: callLog.status,
            durationSeconds,
        },
    });

    const lastMessageAt = message.createdAt || new Date();

    await Conversation.findByIdAndUpdate(conversationSummary.id, {
        lastMessageText: content,
        lastMessageAt,
    });

    return {
        conversation: {
            ...conversationSummary,
            lastMessageText: content,
            lastMessageAt: lastMessageAt.toISOString(),
        },
        message: mapMessage({
            ...message.toObject(),
            conversationId: conversationSummary.id,
            senderId: initiatorId,
            content,
            createdAt: lastMessageAt,
            type: "call",
            callMeta: {
                callType: callLog.callType,
                status: callLog.status,
                durationSeconds,
            },
        }),
    };
};

export const createVoiceMessage = async (
    senderId: string,
    conversationId: string,
    audioUrl: string,
    durationSeconds?: number
) => {
    if (!audioUrl.trim()) {
        throw new Error("Voice note URL is required");
    }

    const { conversation, participants } = await getConversationByIdForUser(senderId, conversationId);
    const conversationSummary = mapConversationSummary(conversation, participants, senderId);
    const sender = participants.find((participant) => participant._id.toString() === senderId) || null;
    const safeDuration = Math.max(0, Math.round(durationSeconds || 0));
    const content = "Voice message";

    const message = await ChatMessage.create({
        conversationId: conversation._id,
        senderId,
        content,
        type: "voice",
        voiceMeta: {
            audioUrl: audioUrl.trim(),
            durationSeconds: safeDuration,
        },
    });

    const lastMessageAt = message.createdAt || new Date();

    await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessageText: content,
        lastMessageAt,
    });

    return {
        conversation: {
            ...conversationSummary,
            lastMessageText: content,
            lastMessageAt: lastMessageAt.toISOString(),
        },
        message: mapMessage({
            ...message.toObject(),
            conversationId: conversationSummary.id,
            senderId,
            sender,
            content,
            createdAt: lastMessageAt,
            type: "voice",
            voiceMeta: {
                audioUrl: audioUrl.trim(),
                durationSeconds: safeDuration,
            },
        }),
    };
};
