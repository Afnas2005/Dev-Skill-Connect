import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { allowedOrigins } from "../config/http";
import Conversation from "../models/Conversation";
import { verifyAccessToken } from "../services/authService";
import {
    createCallLogMessage,
    createMessage,
    getConnectedUserIds,
    getConversationByIdForUser,
    getOrCreateDirectConversation,
} from "../services/chatService";
import { addUserSocket, removeUserSocket } from "./presence";

type SocketUser = {
    userId: string;
    email: string;
};

type SignalPayload = {
    callId: string;
    toUserId: string;
    signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
};

type CreatedChatMessage = {
    conversation: {
        id: string;
        isGroup?: boolean;
        name?: string;
        lastMessageText: string;
        lastMessageAt: string;
        participant: {
            id: string;
            name: string;
            email: string;
            professionalTitle: string;
            profileImage: string;
            isOnline: boolean;
        } | null;
        participants: Array<{
            id: string;
            name: string;
            email: string;
            professionalTitle: string;
            profileImage: string;
            isOnline: boolean;
        }>;
    };
    message: {
        id: string;
        conversationId: string;
        senderId?: string | null;
        content: string;
        createdAt: string;
        type?: "text" | "call" | "voice";
        callMeta?: {
            callType: "audio" | "video";
            status: "completed" | "missed" | "declined";
            durationSeconds?: number;
        };
        voiceMeta?: {
            audioUrl: string;
            durationSeconds?: number;
        };
    };
};

type CallSession = {
    callId: string;
    initiatorId: string;
    recipientId: string;
    conversationId: string;
    callType: "audio" | "video";
    startedAt: number;
    answeredAt?: number;
};

let ioInstance: Server | null = null;
const callSessions = new Map<string, CallSession>();

const parseCookie = (rawCookieHeader?: string) => {
    const parsed: Record<string, string> = {};

    if (!rawCookieHeader) {
        return parsed;
    }

    for (const pair of rawCookieHeader.split(";")) {
        const [key, ...rest] = pair.trim().split("=");
        if (!key) {
            continue;
        }
        parsed[key] = decodeURIComponent(rest.join("="));
    }

    return parsed;
};

export const createSocketServer = (httpServer: HttpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    ioInstance = io;

    io.use((socket, next) => {
        try {
            const cookies = parseCookie(socket.handshake.headers.cookie);
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error("Not authenticated"));
            }

            const decoded = verifyAccessToken(token) as SocketUser & { type?: string };
            if (decoded.type !== "access") {
                return next(new Error("Invalid token"));
            }
            socket.data.user = decoded;
            return next();
        } catch (error) {
            return next(new Error("Invalid token"));
        }
    });

    const emitPresence = async (userId: string, isOnline: boolean) => {
        const connectedIds = await getConnectedUserIds(userId);
        connectedIds.forEach((contactId) => {
            io.to(`user:${contactId}`).emit("presence:update", { userId, isOnline });
        });
    };

    io.on("connection", (socket) => {
        const user = socket.data.user as SocketUser;
        const userRoom = `user:${user.userId}`;

        socket.join(userRoom);
        addUserSocket(user.userId, socket.id);
        void emitPresence(user.userId, true);

        socket.on("chat:message", async (payload: { conversationId: string; content: string }) => {
            try {
                const created = await createMessage(user.userId, payload.conversationId, payload.content);
                await emitRealtimeMessage(payload.conversationId, created);
            } catch (error: any) {
                socket.emit("chat:error", {
                    message: error?.message || "Could not send message",
                });
            }
        });

        socket.on(
            "chat:typing",
            async (payload: { conversationId: string; isTyping: boolean }) => {
                try {
                    const { conversation } = await getConversationByIdForUser(
                        user.userId,
                        payload.conversationId
                    );

                    conversation.participantIds
                        .map((participantId) => participantId.toString())
                        .filter((participantId) => participantId !== user.userId)
                        .forEach((participantId) => {
                            io.to(`user:${participantId}`).emit("chat:typing", {
                                conversationId: payload.conversationId,
                                userId: user.userId,
                                isTyping: payload.isTyping,
                            });
                        });
                } catch {
                    socket.emit("chat:error", {
                        message: "Could not update typing state",
                    });
                }
            }
        );

        socket.on(
            "call:start",
            async (payload: {
                callId: string;
                toUserId: string;
                conversationId?: string;
                callType: "audio" | "video";
            }) => {
                try {
                const conversation = payload.conversationId
                    ? await getConversationByIdForUser(user.userId, payload.conversationId)
                    : await getOrCreateDirectConversation(user.userId, payload.toUserId);
                const conversationId =
                    "conversation" in conversation
                        ? String(conversation.conversation._id)
                        : conversation.id;

                callSessions.set(payload.callId, {
                    callId: payload.callId,
                    initiatorId: user.userId,
                    recipientId: payload.toUserId,
                    conversationId,
                    callType: payload.callType,
                    startedAt: Date.now(),
                });

                io.to(`user:${payload.toUserId}`).emit("call:incoming", {
                    callId: payload.callId,
                    conversationId,
                    callType: payload.callType,
                    fromUser: {
                        id: user.userId,
                            email: user.email,
                        },
                    });

                    socket.emit("call:outgoing", {
                        callId: payload.callId,
                    });
                } catch (error: any) {
                    socket.emit("call:error", {
                        message: error?.message || "Could not start call",
                    });
                }
            }
        );

        socket.on("call:accept", (payload: { callId: string; toUserId: string }) => {
            const session = callSessions.get(payload.callId);
            if (session) {
                session.answeredAt = Date.now();
                callSessions.set(payload.callId, session);
            }

            io.to(`user:${payload.toUserId}`).emit("call:accepted", {
                callId: payload.callId,
                fromUserId: user.userId,
            });
        });

        socket.on("call:decline", async (payload: { callId: string; toUserId: string }) => {
            io.to(`user:${payload.toUserId}`).emit("call:declined", {
                callId: payload.callId,
                fromUserId: user.userId,
            });

            const session = callSessions.get(payload.callId);
            if (!session) {
                return;
            }

            callSessions.delete(payload.callId);

            try {
                const callLog = await createCallLogMessage(session.initiatorId, session.recipientId, {
                    callType: session.callType,
                    status: "declined",
                });
                await emitRealtimeMessage(session.conversationId, callLog);
            } catch {
                socket.emit("call:error", {
                    message: "Could not save call log",
                });
            }
        });

        socket.on("call:end", async (payload: { callId: string; toUserId: string }) => {
            io.to(`user:${payload.toUserId}`).emit("call:ended", {
                callId: payload.callId,
                fromUserId: user.userId,
            });

            const session = callSessions.get(payload.callId);
            if (!session) {
                return;
            }

            callSessions.delete(payload.callId);

            try {
                const durationSeconds = session.answeredAt
                    ? Math.max(0, Math.round((Date.now() - session.answeredAt) / 1000))
                    : 0;
                const callLog = await createCallLogMessage(session.initiatorId, session.recipientId, {
                    callType: session.callType,
                    status: session.answeredAt ? "completed" : "missed",
                    durationSeconds,
                });
                await emitRealtimeMessage(session.conversationId, callLog);
            } catch {
                socket.emit("call:error", {
                    message: "Could not save call log",
                });
            }
        });

        socket.on("call:signal", async (payload: SignalPayload) => {
            try {
                await getOrCreateDirectConversation(user.userId, payload.toUserId);
                io.to(`user:${payload.toUserId}`).emit("call:signal", {
                    callId: payload.callId,
                    fromUserId: user.userId,
                    signal: payload.signal,
                });
            } catch (error: any) {
                socket.emit("call:error", {
                    message: error?.message || "Could not relay call signal",
                });
            }
        });

        socket.on("disconnect", () => {
            removeUserSocket(user.userId, socket.id);
            void emitPresence(user.userId, false);
        });
    });

    return io;
};

export const emitRealtimeMessage = async (conversationId: string, created: CreatedChatMessage) => {
    if (!ioInstance) {
        return;
    }

    const conversation = await Conversation.findById(conversationId)
        .select("participantIds")
        .lean();

    if (!conversation) {
        return;
    }

    conversation.participantIds
        .map((participantId) => participantId.toString())
        .forEach((participantId) => {
            ioInstance?.to(`user:${participantId}`).emit("chat:message:new", created);
        });
};
