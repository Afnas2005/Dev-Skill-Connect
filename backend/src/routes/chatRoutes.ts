import express from "express";
import {
    addGroupMembers,
    createGroupConversation,
    getContacts,
    getConversations,
    getMessages,
    removeGroupMember,
    sendMessage,
    sendVoiceMessage,
    startDirectConversation,
} from "../controllers/chatController";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/contacts", authMiddleware, getContacts);
router.get("/conversations", authMiddleware, getConversations);
router.post("/conversations/direct/:userId", authMiddleware, startDirectConversation);
router.post("/conversations/group", authMiddleware, createGroupConversation);
router.post("/conversations/:conversationId/participants", authMiddleware, addGroupMembers);
router.delete(
    "/conversations/:conversationId/participants/:participantId",
    authMiddleware,
    removeGroupMember
);
router.get("/conversations/:conversationId/messages", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);
router.post("/voice-messages", authMiddleware, sendVoiceMessage);

export default router;
