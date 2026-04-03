import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { emitRealtimeMessage } from "../realtime/socket";
import { sendResponse } from "../utils/response";
import * as chatService from "../services/chatService";

export const getContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await chatService.getChatContacts(req.user!.userId);
        return sendResponse(res, 200, true, "Chat contacts fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const getConversations = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await chatService.getConversations(req.user!.userId);
        return sendResponse(res, 200, true, "Conversations fetched successfully", result);
    } catch (error) {
        return next(error);
    }
};

export const startDirectConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await chatService.getOrCreateDirectConversation(
            req.user!.userId,
            String(req.params.userId)
        );
        return sendResponse(res, 200, true, "Conversation ready", result);
    } catch (error: any) {
        if (
            error.message === "You cannot chat with yourself" ||
            error.message === "User not found" ||
            error.message === "You can only chat with accepted connections"
        ) {
            return sendResponse(res, 400, false, error.message);
        }

        return next(error);
    }
};

export const createGroupConversation = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await chatService.createGroupConversation(
            req.user!.userId,
            String(req.body.name || ""),
            Array.isArray(req.body.participantIds) ? req.body.participantIds.map(String) : []
        );
        return sendResponse(res, 201, true, "Group conversation created successfully", result);
    } catch (error: any) {
        if (
            error.message === "Group name is required" ||
            error.message === "Select at least two connected people" ||
            error.message === "You can only add accepted connections" ||
            error.message === "Some selected users could not be found"
        ) {
            return sendResponse(res, 400, false, error.message);
        }

        return next(error);
    }
};

export const addGroupMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await chatService.addParticipantsToGroupConversation(
            req.user!.userId,
            String(req.params.conversationId),
            Array.isArray(req.body.participantIds) ? req.body.participantIds.map(String) : []
        );
        return sendResponse(res, 200, true, "Group members added successfully", result);
    } catch (error: any) {
        if (
            error.message === "Conversation not found" ||
            error.message === "Only group conversations can be managed" ||
            error.message === "Only the group admin can manage members" ||
            error.message === "Select at least one connected person" ||
            error.message === "You can only add new accepted connections"
        ) {
            return sendResponse(
                res,
                error.message === "Conversation not found" ? 404 : 400,
                false,
                error.message
            );
        }

        return next(error);
    }
};

export const removeGroupMember = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await chatService.removeParticipantFromGroupConversation(
            req.user!.userId,
            String(req.params.conversationId),
            String(req.params.participantId)
        );
        return sendResponse(res, 200, true, "Group member removed successfully", result);
    } catch (error: any) {
        if (
            error.message === "Conversation not found" ||
            error.message === "Only group conversations can be managed" ||
            error.message === "Only the group admin can manage members" ||
            error.message === "User not found" ||
            error.message === "Group admin cannot remove themselves" ||
            error.message === "User is not in this group" ||
            error.message === "A group must have at least two people"
        ) {
            return sendResponse(
                res,
                error.message === "Conversation not found" ? 404 : 400,
                false,
                error.message
            );
        }

        return next(error);
    }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await chatService.getConversationMessages(
            req.user!.userId,
            String(req.params.conversationId)
        );
        return sendResponse(res, 200, true, "Messages fetched successfully", result);
    } catch (error: any) {
        if (error.message === "Conversation not found") {
            return sendResponse(res, 404, false, error.message);
        }

        return next(error);
    }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await chatService.createMessage(
            req.user!.userId,
            String(req.body.conversationId),
            String(req.body.content || "")
        );
        await emitRealtimeMessage(String(req.body.conversationId), result);
        return sendResponse(res, 201, true, "Message sent successfully", result);
    } catch (error: any) {
        if (
            error.message === "Message cannot be empty" ||
            error.message === "Conversation not found"
        ) {
            return sendResponse(
                res,
                error.message === "Conversation not found" ? 404 : 400,
                false,
                error.message
            );
        }

        return next(error);
    }
};

export const sendVoiceMessage = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await chatService.createVoiceMessage(
            req.user!.userId,
            String(req.body.conversationId),
            String(req.body.audioUrl || ""),
            Number(req.body.durationSeconds || 0)
        );
        await emitRealtimeMessage(String(req.body.conversationId), result);
        return sendResponse(res, 201, true, "Voice message sent successfully", result);
    } catch (error: any) {
        if (error.message === "Voice note URL is required" || error.message === "Conversation not found") {
            return sendResponse(
                res,
                error.message === "Conversation not found" ? 404 : 400,
                false,
                error.message
            );
        }

        return next(error);
    }
};
