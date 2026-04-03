import api from "./api";
import type {
    ApiResponse,
    ChatContact,
    ChatConversation,
    ChatMessage,
} from "@/types/domain";

export const getChatContacts = async () => {
    return api.get<ApiResponse<ChatContact[]>>("/chat/contacts");
};

export const getChatConversations = async () => {
    return api.get<ApiResponse<ChatConversation[]>>("/chat/conversations");
};

export const startDirectConversation = async (userId: string) => {
    return api.post<ApiResponse<ChatConversation>>(`/chat/conversations/direct/${userId}`);
};

export const createGroupConversation = async (payload: {
    name: string;
    participantIds: string[];
}) => {
    return api.post<ApiResponse<ChatConversation>>("/chat/conversations/group", payload);
};

export const getConversationMessages = async (conversationId: string) => {
    return api.get<ApiResponse<ChatMessage[]>>(`/chat/conversations/${conversationId}/messages`);
};

export const addGroupMembers = async (conversationId: string, participantIds: string[]) => {
    return api.post<ApiResponse<ChatConversation>>(
        `/chat/conversations/${conversationId}/participants`,
        { participantIds }
    );
};

export const removeGroupMember = async (conversationId: string, participantId: string) => {
    return api.delete<ApiResponse<ChatConversation>>(
        `/chat/conversations/${conversationId}/participants/${participantId}`
    );
};

export const sendChatMessage = async (payload: { conversationId: string; content: string }) => {
    return api.post<
        ApiResponse<{
            conversation: ChatConversation;
            message: ChatMessage;
        }>
    >("/chat/messages", payload);
};

export const sendVoiceMessage = async (payload: {
    conversationId: string;
    audioUrl: string;
    durationSeconds?: number;
}) => {
    return api.post<
        ApiResponse<{
            conversation: ChatConversation;
            message: ChatMessage;
        }>
    >("/chat/voice-messages", payload);
};
