"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get("/contacts", auth_1.authMiddleware, chatController_1.getContacts);
router.get("/conversations", auth_1.authMiddleware, chatController_1.getConversations);
router.post("/conversations/direct/:userId", auth_1.authMiddleware, chatController_1.startDirectConversation);
router.post("/conversations/group", auth_1.authMiddleware, chatController_1.createGroupConversation);
router.post("/conversations/:conversationId/participants", auth_1.authMiddleware, chatController_1.addGroupMembers);
router.delete("/conversations/:conversationId/participants/:participantId", auth_1.authMiddleware, chatController_1.removeGroupMember);
router.get("/conversations/:conversationId/messages", auth_1.authMiddleware, chatController_1.getMessages);
router.post("/messages", auth_1.authMiddleware, chatController_1.sendMessage);
router.post("/voice-messages", auth_1.authMiddleware, chatController_1.sendVoiceMessage);
exports.default = router;
