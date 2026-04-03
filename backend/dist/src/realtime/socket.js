"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitRealtimeMessage = exports.createSocketServer = void 0;
const socket_io_1 = require("socket.io");
const http_1 = require("../config/http");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const authService_1 = require("../services/authService");
const chatService_1 = require("../services/chatService");
const presence_1 = require("./presence");
let ioInstance = null;
const callSessions = new Map();
const parseCookie = (rawCookieHeader) => {
    const parsed = {};
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
const createSocketServer = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: http_1.allowedOrigins,
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
            const decoded = (0, authService_1.verifyAccessToken)(token);
            if (decoded.type !== "access") {
                return next(new Error("Invalid token"));
            }
            socket.data.user = decoded;
            return next();
        }
        catch (error) {
            return next(new Error("Invalid token"));
        }
    });
    const emitPresence = async (userId, isOnline) => {
        const connectedIds = await (0, chatService_1.getConnectedUserIds)(userId);
        connectedIds.forEach((contactId) => {
            io.to(`user:${contactId}`).emit("presence:update", { userId, isOnline });
        });
    };
    io.on("connection", (socket) => {
        const user = socket.data.user;
        const userRoom = `user:${user.userId}`;
        socket.join(userRoom);
        (0, presence_1.addUserSocket)(user.userId, socket.id);
        void emitPresence(user.userId, true);
        socket.on("chat:message", async (payload) => {
            try {
                const created = await (0, chatService_1.createMessage)(user.userId, payload.conversationId, payload.content);
                await (0, exports.emitRealtimeMessage)(payload.conversationId, created);
            }
            catch (error) {
                socket.emit("chat:error", {
                    message: error?.message || "Could not send message",
                });
            }
        });
        socket.on("chat:typing", async (payload) => {
            try {
                const { conversation } = await (0, chatService_1.getConversationByIdForUser)(user.userId, payload.conversationId);
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
            }
            catch {
                socket.emit("chat:error", {
                    message: "Could not update typing state",
                });
            }
        });
        socket.on("call:start", async (payload) => {
            try {
                const conversation = payload.conversationId
                    ? await (0, chatService_1.getConversationByIdForUser)(user.userId, payload.conversationId)
                    : await (0, chatService_1.getOrCreateDirectConversation)(user.userId, payload.toUserId);
                const conversationId = "conversation" in conversation
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
            }
            catch (error) {
                socket.emit("call:error", {
                    message: error?.message || "Could not start call",
                });
            }
        });
        socket.on("call:accept", (payload) => {
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
        socket.on("call:decline", async (payload) => {
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
                const callLog = await (0, chatService_1.createCallLogMessage)(session.initiatorId, session.recipientId, {
                    callType: session.callType,
                    status: "declined",
                });
                await (0, exports.emitRealtimeMessage)(session.conversationId, callLog);
            }
            catch {
                socket.emit("call:error", {
                    message: "Could not save call log",
                });
            }
        });
        socket.on("call:end", async (payload) => {
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
                const callLog = await (0, chatService_1.createCallLogMessage)(session.initiatorId, session.recipientId, {
                    callType: session.callType,
                    status: session.answeredAt ? "completed" : "missed",
                    durationSeconds,
                });
                await (0, exports.emitRealtimeMessage)(session.conversationId, callLog);
            }
            catch {
                socket.emit("call:error", {
                    message: "Could not save call log",
                });
            }
        });
        socket.on("call:signal", async (payload) => {
            try {
                await (0, chatService_1.getOrCreateDirectConversation)(user.userId, payload.toUserId);
                io.to(`user:${payload.toUserId}`).emit("call:signal", {
                    callId: payload.callId,
                    fromUserId: user.userId,
                    signal: payload.signal,
                });
            }
            catch (error) {
                socket.emit("call:error", {
                    message: error?.message || "Could not relay call signal",
                });
            }
        });
        socket.on("disconnect", () => {
            (0, presence_1.removeUserSocket)(user.userId, socket.id);
            void emitPresence(user.userId, false);
        });
    });
    return io;
};
exports.createSocketServer = createSocketServer;
const emitRealtimeMessage = async (conversationId, created) => {
    if (!ioInstance) {
        return;
    }
    const conversation = await Conversation_1.default.findById(conversationId)
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
exports.emitRealtimeMessage = emitRealtimeMessage;
