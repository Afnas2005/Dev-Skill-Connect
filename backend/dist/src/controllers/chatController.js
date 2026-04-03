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
exports.sendVoiceMessage = exports.sendMessage = exports.getMessages = exports.removeGroupMember = exports.addGroupMembers = exports.createGroupConversation = exports.startDirectConversation = exports.getConversations = exports.getContacts = void 0;
const socket_1 = require("../realtime/socket");
const response_1 = require("../utils/response");
const chatService = __importStar(require("../services/chatService"));
const getContacts = async (req, res, next) => {
    try {
        const result = await chatService.getChatContacts(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Chat contacts fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getContacts = getContacts;
const getConversations = async (req, res, next) => {
    try {
        const result = await chatService.getConversations(req.user.userId);
        return (0, response_1.sendResponse)(res, 200, true, "Conversations fetched successfully", result);
    }
    catch (error) {
        return next(error);
    }
};
exports.getConversations = getConversations;
const startDirectConversation = async (req, res, next) => {
    try {
        const result = await chatService.getOrCreateDirectConversation(req.user.userId, String(req.params.userId));
        return (0, response_1.sendResponse)(res, 200, true, "Conversation ready", result);
    }
    catch (error) {
        if (error.message === "You cannot chat with yourself" ||
            error.message === "User not found" ||
            error.message === "You can only chat with accepted connections") {
            return (0, response_1.sendResponse)(res, 400, false, error.message);
        }
        return next(error);
    }
};
exports.startDirectConversation = startDirectConversation;
const createGroupConversation = async (req, res, next) => {
    try {
        const result = await chatService.createGroupConversation(req.user.userId, String(req.body.name || ""), Array.isArray(req.body.participantIds) ? req.body.participantIds.map(String) : []);
        return (0, response_1.sendResponse)(res, 201, true, "Group conversation created successfully", result);
    }
    catch (error) {
        if (error.message === "Group name is required" ||
            error.message === "Select at least two connected people" ||
            error.message === "You can only add accepted connections" ||
            error.message === "Some selected users could not be found") {
            return (0, response_1.sendResponse)(res, 400, false, error.message);
        }
        return next(error);
    }
};
exports.createGroupConversation = createGroupConversation;
const addGroupMembers = async (req, res, next) => {
    try {
        const result = await chatService.addParticipantsToGroupConversation(req.user.userId, String(req.params.conversationId), Array.isArray(req.body.participantIds) ? req.body.participantIds.map(String) : []);
        return (0, response_1.sendResponse)(res, 200, true, "Group members added successfully", result);
    }
    catch (error) {
        if (error.message === "Conversation not found" ||
            error.message === "Only group conversations can be managed" ||
            error.message === "Only the group admin can manage members" ||
            error.message === "Select at least one connected person" ||
            error.message === "You can only add new accepted connections") {
            return (0, response_1.sendResponse)(res, error.message === "Conversation not found" ? 404 : 400, false, error.message);
        }
        return next(error);
    }
};
exports.addGroupMembers = addGroupMembers;
const removeGroupMember = async (req, res, next) => {
    try {
        const result = await chatService.removeParticipantFromGroupConversation(req.user.userId, String(req.params.conversationId), String(req.params.participantId));
        return (0, response_1.sendResponse)(res, 200, true, "Group member removed successfully", result);
    }
    catch (error) {
        if (error.message === "Conversation not found" ||
            error.message === "Only group conversations can be managed" ||
            error.message === "Only the group admin can manage members" ||
            error.message === "User not found" ||
            error.message === "Group admin cannot remove themselves" ||
            error.message === "User is not in this group" ||
            error.message === "A group must have at least two people") {
            return (0, response_1.sendResponse)(res, error.message === "Conversation not found" ? 404 : 400, false, error.message);
        }
        return next(error);
    }
};
exports.removeGroupMember = removeGroupMember;
const getMessages = async (req, res, next) => {
    try {
        const result = await chatService.getConversationMessages(req.user.userId, String(req.params.conversationId));
        return (0, response_1.sendResponse)(res, 200, true, "Messages fetched successfully", result);
    }
    catch (error) {
        if (error.message === "Conversation not found") {
            return (0, response_1.sendResponse)(res, 404, false, error.message);
        }
        return next(error);
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res, next) => {
    try {
        const result = await chatService.createMessage(req.user.userId, String(req.body.conversationId), String(req.body.content || ""));
        await (0, socket_1.emitRealtimeMessage)(String(req.body.conversationId), result);
        return (0, response_1.sendResponse)(res, 201, true, "Message sent successfully", result);
    }
    catch (error) {
        if (error.message === "Message cannot be empty" ||
            error.message === "Conversation not found") {
            return (0, response_1.sendResponse)(res, error.message === "Conversation not found" ? 404 : 400, false, error.message);
        }
        return next(error);
    }
};
exports.sendMessage = sendMessage;
const sendVoiceMessage = async (req, res, next) => {
    try {
        const result = await chatService.createVoiceMessage(req.user.userId, String(req.body.conversationId), String(req.body.audioUrl || ""), Number(req.body.durationSeconds || 0));
        await (0, socket_1.emitRealtimeMessage)(String(req.body.conversationId), result);
        return (0, response_1.sendResponse)(res, 201, true, "Voice message sent successfully", result);
    }
    catch (error) {
        if (error.message === "Voice note URL is required" || error.message === "Conversation not found") {
            return (0, response_1.sendResponse)(res, error.message === "Conversation not found" ? 404 : 400, false, error.message);
        }
        return next(error);
    }
};
exports.sendVoiceMessage = sendVoiceMessage;
