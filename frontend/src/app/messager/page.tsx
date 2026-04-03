"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
    Code2,
    Loader2,
    Mic,
    MicOff,
    MoreVertical,
    Phone,
    Search,
    SendHorizontal,
    Square,
    SquarePen,
    Users,
    Video,
    VideoOff,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar } from "@/components/ui/avatar";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { createChatSocket } from "@/lib/chatSocket";
import { cn } from "@/lib/utils";
import {
    addGroupMembers,
    createGroupConversation,
    getChatContacts,
    getChatConversations,
    getConversationMessages,
    removeGroupMember,
    sendChatMessage,
    sendVoiceMessage,
    startDirectConversation,
} from "@/services/chatServices";
import { uploadVoiceNote } from "@/services/uploadServices";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import type { ChatContact, ChatConversation, ChatMessage } from "@/types/domain";

type SignalData = RTCIceCandidateInit | RTCSessionDescriptionInit;

type IncomingCall = {
    callId: string;
    conversationId: string;
    fromUser: ChatContact;
    callType: "audio" | "video";
};

type ActiveCall = {
    callId: string;
    conversationId: string;
    otherUser: ChatContact;
    callType: "audio" | "video";
    direction: "incoming" | "outgoing";
    status: "ringing" | "connecting" | "connected";
    connectedAt?: number;
};

const EMPTY_CONTACTS: ChatContact[] = [];
const EMPTY_CONVERSATIONS: ChatConversation[] = [];
const EMPTY_MESSAGES: ChatMessage[] = [];
const ACTIVE_CONVERSATION_STORAGE_KEY = "messager-active-conversation";
const UNREAD_CONVERSATIONS_STORAGE_KEY = "messager-unread-conversations";

const getConversationDisplayName = (conversation: ChatConversation | null) => {
    if (!conversation) return "Choose a conversation";
    if (conversation.isGroup) {
        return conversation.name || "Untitled group";
    }

    return conversation.participant?.name || conversation.participant?.email || "Direct conversation";
};

const getConversationSubtitle = (conversation: ChatConversation | null) => {
    if (!conversation) return "";
    if (conversation.isGroup) {
        const otherMembers = Math.max(0, conversation.participants.length - 1);
        return `${otherMembers} member${otherMembers === 1 ? "" : "s"}`;
    }

    return conversation.participant?.isOnline ? "online" : "offline";
};

const getGroupAdminName = (conversation: ChatConversation | null) => {
    if (!conversation?.isGroup || !conversation.adminId) {
        return "";
    }

    const admin = conversation.participants.find((participant) => participant.id === conversation.adminId);
    if (!admin) {
        return "";
    }

    return admin.name || admin.email;
};

const findMessageSender = (
    conversation: ChatConversation | null,
    message: ChatMessage,
    currentUserId?: string
) => {
    if (message.sender) {
        return {
            ...message.sender,
            isOnline: false,
            professionalTitle: "",
        };
    }

    if (!conversation || !message.senderId) return null;
    if (message.senderId === currentUserId) {
        return null;
    }

    return conversation.participants.find((participant) => participant.id === message.senderId) || null;
};

const formatClock = (value?: string) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const formatMessageDate = (value?: string) => {
    if (!value) return "";

    const date = new Date(value);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return "Today";
    }

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
};

const formatCallDuration = (durationSeconds?: number) => {
    const safeDuration = Math.max(0, Math.round(durationSeconds || 0));
    const minutes = Math.floor(safeDuration / 60);
    const seconds = safeDuration % 60;

    if (minutes === 0) {
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
};

const getCallStatusLabel = (message: ChatMessage) => {
    const callType = message.callMeta?.callType === "video" ? "Video" : "Audio";

    if (message.callMeta?.status === "completed") {
        return `${callType} call`;
    }

    if (message.callMeta?.status === "declined") {
        return `Declined ${callType.toLowerCase()} call`;
    }

    return `Missed ${callType.toLowerCase()} call`;
};

const formatLiveCallDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const formatVoiceDuration = (durationSeconds?: number) => {
    const safeDuration = Math.max(0, Math.round(durationSeconds || 0));
    const minutes = Math.floor(safeDuration / 60);
    const seconds = safeDuration % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const isDescription = (signal: SignalData): signal is RTCSessionDescriptionInit => "type" in signal;

import type { Variants } from "framer-motion";

const staggerList: Variants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.045,
        },
    },
};

const fadeItem: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" as const } },
};

export default function MessagerPage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    useUnreadNotificationsCount();

    const [query, setQuery] = useState("");
    const [text, setText] = useState("");
    const [isGroupComposerOpen, setIsGroupComposerOpen] = useState(false);
    const [isManageGroupOpen, setIsManageGroupOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<string[]>([]);
    const [isUpdatingGroupMembers, setIsUpdatingGroupMembers] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(() => {
        if (typeof window === "undefined") {
            return null;
        }

        return window.localStorage.getItem(ACTIVE_CONVERSATION_STORAGE_KEY);
    });
    const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
    const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>(() => {
        if (typeof window === "undefined") {
            return {};
        }

        try {
            const rawValue = window.localStorage.getItem(UNREAD_CONVERSATIONS_STORAGE_KEY);
            return rawValue ? (JSON.parse(rawValue) as Record<string, number>) : {};
        } catch {
            return {};
        }
    });
    const [isMicEnabled, setIsMicEnabled] = useState(true);
    const [isCameraEnabled, setIsCameraEnabled] = useState(true);
    const [callElapsedSeconds, setCallElapsedSeconds] = useState(0);
    const [isRemoteVideoEnabled, setIsRemoteVideoEnabled] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [isUploadingVoice, setIsUploadingVoice] = useState(false);
    const [voiceRecordingSeconds, setVoiceRecordingSeconds] = useState(0);

    const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const pendingSignalsRef = useRef<Map<string, SignalData[]>>(new Map());
    const activeCallRef = useRef<ActiveCall | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const contactsRef = useRef<ChatContact[]>([]);
    const conversationsRef = useRef<ChatConversation[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingChunksRef = useRef<Blob[]>([]);
    const recordingStreamRef = useRef<MediaStream | null>(null);

    const contactsQuery = useQuery({
        queryKey: ["chat", "contacts"],
        queryFn: getChatContacts,
    });
    const conversationsQuery = useQuery({
        queryKey: ["chat", "conversations"],
        queryFn: getChatConversations,
    });
    const contacts = contactsQuery.data?.data ?? EMPTY_CONTACTS;
    const conversations = conversationsQuery.data?.data ?? EMPTY_CONVERSATIONS;
    const selectedConversationId =
        activeId &&
        (conversations.length === 0 || conversations.some((item) => item.id === activeId))
            ? activeId
            : conversations[0]?.id || null;
    const messagesQuery = useQuery({
        queryKey: ["chat", "messages", selectedConversationId],
        queryFn: () => getConversationMessages(selectedConversationId as string),
        enabled: Boolean(selectedConversationId),
    });
    const messages = messagesQuery.data?.data ?? EMPTY_MESSAGES;
    const activeConversation =
        conversations.find((item) => item.id === selectedConversationId) || null;
    const selectConversation = (conversationId: string) => {
        setActiveId(conversationId);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(ACTIVE_CONVERSATION_STORAGE_KEY, conversationId);
        }
        setUnreadByConversation((current) => ({
            ...current,
            [conversationId]: 0,
        }));
    };

    const isGroupAdmin = Boolean(
        activeConversation?.isGroup && activeConversation.adminId && activeConversation.adminId === user?.id
    );
    const availableContactsToAdd = contacts.filter(
        (contact) => !activeConversation?.participants.some((participant) => participant.id === contact.id)
    );

    useEffect(() => {
        activeCallRef.current = activeCall;
    }, [activeCall]);

    useEffect(() => {
        if (!activeCall || activeCall.status !== "connected" || !activeCall.connectedAt) {
            return;
        }

        const updateDuration = () => {
            setCallElapsedSeconds(
                Math.max(0, Math.floor((Date.now() - activeCall.connectedAt!) / 1000))
            );
        };

        updateDuration();
        const intervalId = window.setInterval(updateDuration, 1000);

        return () => window.clearInterval(intervalId);
    }, [activeCall]);

    useEffect(() => {
        if (!isRecordingVoice) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setVoiceRecordingSeconds((current) => current + 1);
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [isRecordingVoice]);

    useEffect(() => {
        contactsRef.current = contacts;
        conversationsRef.current = conversations;
    }, [contacts, conversations]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(
            UNREAD_CONVERSATIONS_STORAGE_KEY,
            JSON.stringify(unreadByConversation)
        );
    }, [unreadByConversation]);

    useEffect(() => {
        if (typeof window === "undefined" || !activeId || conversations.length === 0) {
            return;
        }

        const hasActiveConversation = conversations.some((item) => item.id === activeId);
        if (hasActiveConversation) {
            return;
        }

        const fallbackConversationId = conversations[0]?.id || null;
        if (fallbackConversationId) {
            window.localStorage.setItem(
                ACTIVE_CONVERSATION_STORAGE_KEY,
                fallbackConversationId
            );
        } else {
            window.localStorage.removeItem(ACTIVE_CONVERSATION_STORAGE_KEY);
        }
    }, [activeId, conversations]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, selectedConversationId]);

    useEffect(() => {
        attachStreamToVideo(localVideoRef.current, localStreamRef.current, true);
        attachStreamToVideo(remoteVideoRef.current, remoteStreamRef.current);
    }, [activeCall]);

    useEffect(() => {
        setIsManageGroupOpen(false);
        setSelectedMembersToAdd([]);
    }, [selectedConversationId]);

    useEffect(() => {
        return () => {
            recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    const stopMedia = () => {
        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
        remoteStreamRef.current = null;
        setIsMicEnabled(true);
        setIsCameraEnabled(true);
        setCallElapsedSeconds(0);
        setIsRemoteVideoEnabled(false);

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
    };

    const endCall = (notifyPeer = true) => {
        const currentCall = activeCallRef.current;

        if (notifyPeer && currentCall && socketRef.current) {
            socketRef.current.emit("call:end", {
                callId: currentCall.callId,
                toUserId: currentCall.otherUser.id,
            });
        }

        peerRef.current?.close();
        peerRef.current = null;
        if (currentCall) {
            pendingSignalsRef.current.delete(currentCall.callId);
        }
        stopMedia();
        setIncomingCall(null);
        setActiveCall(null);
        activeCallRef.current = null;
    };

    const queueSignal = (callId: string, signal: SignalData) => {
        const current = pendingSignalsRef.current.get(callId) || [];
        current.push(signal);
        pendingSignalsRef.current.set(callId, current);
    };

    const ensureMedia = async (callType: "audio" | "video") => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video",
        });

        localStreamRef.current = stream;
        setIsMicEnabled(true);
        setIsCameraEnabled(callType === "video");
        attachStreamToVideo(localVideoRef.current, stream, true);
    };

    const attachStreamToVideo = (
        element: HTMLVideoElement | null,
        stream: MediaStream | null,
        muted = false
    ) => {
        if (!element) {
            return;
        }

        element.srcObject = stream;
        element.muted = muted;

        if (stream) {
            void element.play().catch(() => undefined);
        }
    };

    const createPeer = (call: ActiveCall) => {
        const peer = new RTCPeerConnection({
            iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        });

        remoteStreamRef.current = new MediaStream();
        setIsRemoteVideoEnabled(false);
        attachStreamToVideo(remoteVideoRef.current, remoteStreamRef.current);

        peer.onicecandidate = (event) => {
            if (!event.candidate || !socketRef.current) {
                return;
            }

            socketRef.current.emit("call:signal", {
                callId: call.callId,
                toUserId: call.otherUser.id,
                signal: event.candidate.toJSON(),
            });
        };

        peer.ontrack = (event) => {
            const remoteStream =
                event.streams[0] || remoteStreamRef.current || new MediaStream();

            const trackAlreadyAdded = remoteStream
                .getTracks()
                .some((track) => track.id === event.track.id);

            if (!trackAlreadyAdded && !event.streams[0]) {
                remoteStream.addTrack(event.track);
            }

            remoteStreamRef.current = remoteStream;
            attachStreamToVideo(remoteVideoRef.current, remoteStream);

            if (event.track.kind === "video") {
                const syncRemoteVideoState = () => {
                    setIsRemoteVideoEnabled(
                        event.track.readyState === "live" && !event.track.muted
                    );
                };

                syncRemoteVideoState();
                event.track.onunmute = syncRemoteVideoState;
                event.track.onmute = syncRemoteVideoState;
                event.track.onended = () => setIsRemoteVideoEnabled(false);
            }
        };

        peer.onconnectionstatechange = () => {
            if (peer.connectionState === "connected") {
                setActiveCall((current) =>
                    current
                        ? { ...current, status: "connected", connectedAt: Date.now() }
                        : current
                );
            }

            if (["failed", "closed"].includes(peer.connectionState)) {
                endCall(false);
            }
        };

        localStreamRef.current?.getTracks().forEach((track) => {
            peer.addTrack(track, localStreamRef.current as MediaStream);
        });

        peerRef.current = peer;
        return peer;
    };

    const flushSignals = async (callId: string) => {
        const currentCall = activeCallRef.current;
        const peer = peerRef.current;
        const queued = pendingSignalsRef.current.get(callId) || [];

        if (!currentCall || currentCall.callId !== callId || !peer || queued.length === 0) {
            return;
        }

        pendingSignalsRef.current.set(callId, []);

        const descriptions = queued.filter(isDescription);
        const candidates = queued.filter((signal) => !isDescription(signal));

        for (const description of descriptions) {
            if (description.type === "offer" && !peer.currentRemoteDescription) {
                await peer.setRemoteDescription(new RTCSessionDescription(description));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socketRef.current?.emit("call:signal", {
                    callId,
                    toUserId: currentCall.otherUser.id,
                    signal: answer,
                });
            }

            if (description.type === "answer" && !peer.currentRemoteDescription) {
                await peer.setRemoteDescription(new RTCSessionDescription(description));
            }
        }

        for (const candidate of candidates) {
            if (peer.remoteDescription) {
                await peer.addIceCandidate(
                    new RTCIceCandidate(candidate as RTCIceCandidateInit)
                );
            } else {
                queueSignal(callId, candidate);
            }
        }
    };

    const filteredConversations = conversations.filter((item) => {
        const term = query.trim().toLowerCase();
        if (!term) {
            return true;
        }

        return (
            getConversationDisplayName(item).toLowerCase().includes(term) ||
            item.participants.some(
                (participant) =>
                    participant.name.toLowerCase().includes(term) ||
                    participant.email.toLowerCase().includes(term)
            ) ||
            item.lastMessageText.toLowerCase().includes(term)
        );
    });

    const filteredContacts = contacts.filter((item) => {
        const term = query.trim().toLowerCase();
        if (!term) {
            return true;
        }

        return (
            item.name.toLowerCase().includes(term) ||
            item.email.toLowerCase().includes(term) ||
            (item.professionalTitle || "").toLowerCase().includes(term)
        );
    });

    const endCallEvent = useEffectEvent((notifyPeer = false) => {
        endCall(notifyPeer);
    });

    const flushSignalsEvent = useEffectEvent(async (callId: string) => {
        await flushSignals(callId);
    });

    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const socket = createChatSocket();
        socketRef.current = socket;

        const upsertConversation = (conversation: ChatConversation) => {
            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => {
                    const next = [conversation, ...((current?.data || []).filter((item) => item.id !== conversation.id))]
                        .sort(
                            (a, b) =>
                                new Date(b.lastMessageAt).getTime() -
                                new Date(a.lastMessageAt).getTime()
                        );

                    return {
                        ...(current || {}),
                        data: next,
                    };
                }
            );
        };

        const addMessage = (message: ChatMessage) => {
            queryClient.setQueryData(
                ["chat", "messages", message.conversationId],
                (current: { data?: ChatMessage[] } | undefined) => ({
                    ...(current || {}),
                    data: (current?.data || []).some((item) => item.id === message.id)
                        ? current?.data || []
                        : [...(current?.data || []), message],
                })
            );
        };

        socket.on(
            "chat:message:new",
            (payload: { conversation: ChatConversation; message: ChatMessage }) => {
                upsertConversation(payload.conversation);
                addMessage(payload.message);
                const isIncomingMessage = payload.message.senderId !== user?.id;
                const isInactiveConversation = payload.conversation.id !== selectedConversationId;

                if (isIncomingMessage && isInactiveConversation) {
                    setUnreadByConversation((current) => ({
                        ...current,
                        [payload.conversation.id]: (current[payload.conversation.id] || 0) + 1,
                    }));
                }
            }
        );

        socket.on("chat:typing", (payload: { conversationId: string; isTyping: boolean }) => {
            setTypingConversationId(payload.isTyping ? payload.conversationId : null);
        });

        socket.on("presence:update", (payload: { userId: string; isOnline: boolean }) => {
            queryClient.setQueryData(
                ["chat", "contacts"],
                (current: { data?: ChatContact[] } | undefined) => ({
                    ...(current || {}),
                    data: (current?.data || []).map((item) =>
                        item.id === payload.userId ? { ...item, isOnline: payload.isOnline } : item
                    ),
                })
            );

            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => ({
                    ...(current || {}),
                    data: (current?.data || []).map((item) => ({
                        ...item,
                        participant:
                            item.participant?.id === payload.userId
                                ? { ...item.participant, isOnline: payload.isOnline }
                                : item.participant,
                        participants: item.participants.map((participant) =>
                            participant.id === payload.userId
                                ? { ...participant, isOnline: payload.isOnline }
                                : participant
                        ),
                    })),
                })
            );
        });

        socket.on("chat:error", (payload: { message: string }) => {
            pushToast({
                type: "error",
                title: payload.message,
            });
        });

        socket.on("connect_error", () => {
            pushToast({
                type: "error",
                title: "Realtime chat connection failed",
                description: "Messages will use API fallback when possible.",
            });
        });

        socket.on(
            "call:incoming",
            (payload: {
                callId: string;
                conversationId: string;
                callType: "audio" | "video";
                fromUser: { id: string; email: string };
            }) => {
                if (activeCallRef.current) {
                    socket.emit("call:decline", {
                        callId: payload.callId,
                        toUserId: payload.fromUser.id,
                    });
                    return;
                }

                const knownUser =
                    contactsRef.current.find((item) => item.id === payload.fromUser.id) ||
                    conversationsRef.current.find(
                        (item) => item.participant?.id === payload.fromUser.id
                    )?.participant;

                setIncomingCall({
                    callId: payload.callId,
                    conversationId: payload.conversationId,
                    callType: payload.callType,
                    fromUser:
                        knownUser ||
                        ({
                            id: payload.fromUser.id,
                            email: payload.fromUser.email,
                            name: payload.fromUser.email.split("@")[0],
                            isOnline: true,
                        } as ChatContact),
                });
            }
        );

        socket.on("call:accepted", () => {
            setActiveCall((current) =>
                current ? { ...current, status: "connecting" } : current
            );
        });

        socket.on("call:declined", () => {
            pushToast({
                type: "info",
                title: "Call declined",
            });
            endCallEvent(false);
        });

        socket.on("call:ended", () => {
            endCallEvent(false);
        });

        socket.on(
            "call:signal",
            async (payload: { callId: string; signal: SignalData }) => {
                queueSignal(payload.callId, payload.signal);
                try {
                    await flushSignalsEvent(payload.callId);
                } catch {
                    pushToast({
                        type: "error",
                        title: "Call negotiation failed",
                    });
                    endCallEvent(false);
                }
            }
        );

        socket.on("call:error", (payload: { message: string }) => {
            pushToast({
                type: "error",
                title: payload.message,
            });
        });

        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            socket.disconnect();
            socketRef.current = null;
        };
    }, [pushToast, queryClient, selectedConversationId, user?.id]);

    const openConversation = async (contact: ChatContact) => {
        try {
            const response = await startDirectConversation(contact.id);

            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => ({
                    ...(current || {}),
                    data: [
                        response.data,
                        ...((current?.data || []).filter((item) => item.id !== response.data.id)),
                    ],
                })
            );

            selectConversation(response.data.id);
        } catch {
            pushToast({
                type: "error",
                title: "Could not open conversation",
            });
        }
    };

    const toggleGroupMember = (memberId: string) => {
        setSelectedGroupMemberIds((current) =>
            current.includes(memberId)
                ? current.filter((value) => value !== memberId)
                : [...current, memberId]
        );
    };

    const handleCreateGroupConversation = async () => {
        if (isCreatingGroup) {
            return;
        }

        try {
            setIsCreatingGroup(true);
            const response = await createGroupConversation({
                name: groupName,
                participantIds: selectedGroupMemberIds,
            });

            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => ({
                    ...(current || {}),
                    data: [
                        response.data,
                        ...((current?.data || []).filter((item) => item.id !== response.data.id)),
                    ],
                })
            );

            setGroupName("");
            setSelectedGroupMemberIds([]);
            setIsGroupComposerOpen(false);
            selectConversation(response.data.id);
        } catch (error) {
            const apiError =
                typeof error === "object" && error
                    ? (error as { message?: string; error?: string })
                    : null;

            pushToast({
                type: "error",
                title: apiError?.message || apiError?.error || "Could not create group chat",
            });
        } finally {
            setIsCreatingGroup(false);
        }
    };

    const toggleMemberToAdd = (memberId: string) => {
        setSelectedMembersToAdd((current) =>
            current.includes(memberId)
                ? current.filter((value) => value !== memberId)
                : [...current, memberId]
        );
    };

    const handleAddGroupMembers = async () => {
        if (!activeConversation || !activeConversation.isGroup || isUpdatingGroupMembers) {
            return;
        }

        try {
            setIsUpdatingGroupMembers(true);
            const response = await addGroupMembers(activeConversation.id, selectedMembersToAdd);
            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => ({
                    ...(current || {}),
                    data: (current?.data || []).map((item) =>
                        item.id === response.data.id ? response.data : item
                    ),
                })
            );
            setSelectedMembersToAdd([]);
            pushToast({ type: "success", title: "People added to the group" });
        } catch (error) {
            const apiError =
                typeof error === "object" && error
                    ? (error as { message?: string; error?: string })
                    : null;
            pushToast({
                type: "error",
                title: apiError?.message || apiError?.error || "Could not add group members",
            });
        } finally {
            setIsUpdatingGroupMembers(false);
        }
    };

    const handleRemoveGroupMember = async (participantId: string) => {
        if (!activeConversation || !activeConversation.isGroup || isUpdatingGroupMembers) {
            return;
        }

        try {
            setIsUpdatingGroupMembers(true);
            const response = await removeGroupMember(activeConversation.id, participantId);
            queryClient.setQueryData(
                ["chat", "conversations"],
                (current: { data?: ChatConversation[] } | undefined) => ({
                    ...(current || {}),
                    data: (current?.data || []).map((item) =>
                        item.id === response.data.id ? response.data : item
                    ),
                })
            );
            pushToast({ type: "success", title: "Person removed from the group" });
        } catch (error) {
            const apiError =
                typeof error === "object" && error
                    ? (error as { message?: string; error?: string })
                    : null;
            pushToast({
                type: "error",
                title: apiError?.message || apiError?.error || "Could not remove group member",
            });
        } finally {
            setIsUpdatingGroupMembers(false);
        }
    };

    const emitTyping = () => {
        if (!activeConversation || !socketRef.current) {
            return;
        }

        socketRef.current.emit("chat:typing", {
            conversationId: activeConversation.id,
            isTyping: true,
        });

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit("chat:typing", {
                conversationId: activeConversation.id,
                isTyping: false,
            });
        }, 1000);
    };

    const appendLocalMessage = (conversation: ChatConversation, message: ChatMessage) => {
        queryClient.setQueryData(
            ["chat", "conversations"],
            (current: { data?: ChatConversation[] } | undefined) => {
                const next = [
                    conversation,
                    ...((current?.data || []).filter((item) => item.id !== conversation.id)),
                ];

                return {
                    ...(current || {}),
                    data: next,
                };
            }
        );

        queryClient.setQueryData(
            ["chat", "messages", message.conversationId],
            (current: { data?: ChatMessage[] } | undefined) => ({
                ...(current || {}),
                data: [...(current?.data || []).filter((item) => item.id !== message.id), message],
            })
        );
    };

    const toggleMicrophone = () => {
        const audioTracks = localStreamRef.current?.getAudioTracks() || [];
        if (audioTracks.length === 0) {
            return;
        }

        const nextEnabled = !audioTracks.every((track) => track.enabled);
        audioTracks.forEach((track) => {
            track.enabled = nextEnabled;
        });
        setIsMicEnabled(nextEnabled);
    };

    const toggleCamera = () => {
        const videoTracks = localStreamRef.current?.getVideoTracks() || [];
        if (videoTracks.length === 0) {
            return;
        }

        const nextEnabled = !videoTracks.every((track) => track.enabled);
        videoTracks.forEach((track) => {
            track.enabled = nextEnabled;
        });
        setIsCameraEnabled(nextEnabled);
    };

    const stopVoiceRecording = () => {
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
            return;
        }

        mediaRecorderRef.current.stop();
        recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        setIsRecordingVoice(false);
    };

    const startVoiceRecording = async () => {
        if (!activeConversation || isUploadingVoice || isRecordingVoice) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            recordingStreamRef.current = stream;
            recordingChunksRef.current = [];

            const recorderOptions = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? { mimeType: "audio/webm;codecs=opus" }
                : undefined;
            const mediaRecorder = new MediaRecorder(stream, recorderOptions);

            mediaRecorderRef.current = mediaRecorder;
            setVoiceRecordingSeconds(0);
            setIsRecordingVoice(true);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordingChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(recordingChunksRef.current, {
                    type: mediaRecorder.mimeType || "audio/webm",
                });
                recordingChunksRef.current = [];

                if (audioBlob.size === 0 || !activeConversation) {
                    setVoiceRecordingSeconds(0);
                    return;
                }

                try {
                    setIsUploadingVoice(true);
                    const extension = mediaRecorder.mimeType.includes("ogg") ? "ogg" : "webm";
                    const audioFile = new File([audioBlob], `voice-note.${extension}`, {
                        type: mediaRecorder.mimeType || "audio/webm",
                    });
                    const upload = await uploadVoiceNote(audioFile);
                    const response = await sendVoiceMessage({
                        conversationId: activeConversation.id,
                        audioUrl: upload.data.url,
                        durationSeconds: voiceRecordingSeconds,
                    });

                    appendLocalMessage(response.data.conversation, response.data.message);
                    selectConversation(response.data.conversation.id);
                } catch {
                    pushToast({
                        type: "error",
                        title: "Could not send voice message",
                    });
                } finally {
                    setIsUploadingVoice(false);
                    setVoiceRecordingSeconds(0);
                }
            };

            mediaRecorder.start();
        } catch {
            pushToast({
                type: "error",
                title: "Microphone access is required for voice messages",
            });
        }
    };

    const sendMessage = async () => {
        const content = text.trim();
        if (!content || !activeConversation) {
            return;
        }

        try {
            const response = await sendChatMessage({
                conversationId: activeConversation.id,
                content,
            });

            appendLocalMessage(response.data.conversation, response.data.message);

            setText("");
            selectConversation(response.data.conversation.id);
        } catch (error) {
            const apiError =
                typeof error === "object" && error
                    ? (error as { message?: string; error?: string })
                    : null;
            const message = apiError?.message || apiError?.error || "Could not send message";

            if (apiError?.error === "Route not found" && socketRef.current && activeConversation) {
                const optimisticMessage: ChatMessage = {
                    id: `temp-${Date.now()}`,
                    conversationId: activeConversation.id,
                    senderId: String(user?.id || ""),
                    content,
                    createdAt: new Date().toISOString(),
                };

                const optimisticConversation: ChatConversation = {
                    ...activeConversation,
                    lastMessageText: content,
                    lastMessageAt: optimisticMessage.createdAt,
                };

                appendLocalMessage(optimisticConversation, optimisticMessage);
                socketRef.current.emit("chat:message", {
                    conversationId: activeConversation.id,
                    content,
                });
                setText("");
                return;
            }

            pushToast({
                type: "error",
                title: message,
            });
        }
    };

    const startCall = async (callType: "audio" | "video") => {
        if (
            !activeConversation ||
            activeConversation.isGroup ||
            !activeConversation.participant ||
            activeCallRef.current
        ) {
            return;
        }

        try {
            await ensureMedia(callType);

            const nextCall: ActiveCall = {
                callId: Date.now().toString(),
                conversationId: activeConversation.id,
                otherUser: activeConversation.participant,
                callType,
                direction: "outgoing",
                status: "ringing",
            };

            setActiveCall(nextCall);
            activeCallRef.current = nextCall;
            const peer = createPeer(nextCall);

            socketRef.current?.emit("call:start", {
                callId: nextCall.callId,
                toUserId: nextCall.otherUser.id,
                conversationId: nextCall.conversationId,
                callType: nextCall.callType,
            });

            const offer = await peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: callType === "video",
            });

            await peer.setLocalDescription(offer);

            socketRef.current?.emit("call:signal", {
                callId: nextCall.callId,
                toUserId: nextCall.otherUser.id,
                signal: offer,
            });
        } catch {
            endCall(false);
            pushToast({
                type: "error",
                title: "Could not start call. Check mic/camera permissions.",
            });
        }
    };

    const acceptIncomingCall = async () => {
        if (!incomingCall || activeCallRef.current) {
            return;
        }

        try {
            await ensureMedia(incomingCall.callType);

            const nextCall: ActiveCall = {
                callId: incomingCall.callId,
                conversationId: incomingCall.conversationId,
                otherUser: incomingCall.fromUser,
                callType: incomingCall.callType,
                direction: "incoming",
                status: "connecting",
            };

            setActiveCall(nextCall);
            activeCallRef.current = nextCall;
            setIncomingCall(null);
            createPeer(nextCall);

            socketRef.current?.emit("call:accept", {
                callId: nextCall.callId,
                toUserId: nextCall.otherUser.id,
            });

            await flushSignals(nextCall.callId);
            selectConversation(nextCall.conversationId);
        } catch {
            endCall(false);
            pushToast({
                type: "error",
                title: "Could not answer call",
            });
        }
    };

    const declineIncomingCall = () => {
        if (!incomingCall) {
            return;
        }

        socketRef.current?.emit("call:decline", {
            callId: incomingCall.callId,
            toUserId: incomingCall.fromUser.id,
        });
        pendingSignalsRef.current.delete(incomingCall.callId);
        setIncomingCall(null);
    };

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-7xl">
                <div className="flex h-[calc(100vh-120px)] w-full overflow-hidden rounded-[28px] border border-[var(--app-line)] shadow-glow app-card">
                        <div className="flex h-full min-w-0 w-full">
                            <aside className="flex h-full w-[320px] flex-col border-r border-[var(--app-line)] app-glass">
                                <div className="border-b border-[var(--app-line)] px-4 py-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h1 className="text-3xl font-semibold text-white">Chats</h1>
                                        <div className="flex items-center gap-2 z-10 relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsGroupComposerOpen((current) => !current)}
                                                title="Create group"
                                                aria-label="Create group"
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-surface-soft)] text-[var(--app-primary)]"
                                            >
                                                <Users size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsGroupComposerOpen((current) => !current)}
                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--app-primary)] to-[#38bdf8] text-white shadow-glow text-white"
                                            >
                                                <SquarePen size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <Search
                                            size={15}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--app-text-soft)]"
                                        />
                                        <input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Search your realtime chats..."
                                            className="h-10 w-full rounded-xl border border-[var(--app-line-strong)] bg-black/20 pl-9 pr-3 text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                                    <motion.div variants={staggerList} initial="hidden" animate="show">
                                    {filteredConversations.map((item) => {
                                        const isActive = item.id === activeId;
                                        const unreadMessages =
                                            item.id === selectedConversationId
                                                ? 0
                                                : unreadByConversation[item.id] || 0;
                                        return (
                                            <motion.button
                                                key={item.id}
                                                variants={fadeItem}
                                                type="button"
                                                onClick={() => selectConversation(item.id)}
                                                className={cn(
                                                    "mb-1 w-full rounded-xl px-3 py-3 text-left transition-colors",
                                                    isActive
                                                        ? "bg-[#102151] ring-1 ring-[#264bff]"
                                                        : "hover:bg-[#0d183a]"
                                                )}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {item.isGroup ? (
                                                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#142448] text-[#d8e4ff]">
                                                            <Users size={18} />
                                                        </div>
                                                    ) : (
                                                        <Avatar
                                                            name={
                                                                item.participant?.name ||
                                                                item.participant?.email
                                                            }
                                                            src={item.participant?.profileImage}
                                                            className="h-10 w-10"
                                                        />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate text-base font-semibold text-white">
                                                                {getConversationDisplayName(item)}
                                                            </p>
                                                            <div className="flex items-center gap-2 z-10 relative">
                                                                {unreadMessages > 0 ? (
                                                                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5865f2] px-1 text-[10px] font-semibold text-white">
                                                                        {unreadMessages}
                                                                    </span>
                                                                ) : null}
                                                                <span className="text-xs text-[#6f86b2]">
                                                                    {formatClock(item.lastMessageAt)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p
                                                            className={cn(
                                                                "truncate text-sm",
                                                                unreadMessages > 0
                                                                    ? "font-semibold text-[#d8e4ff]"
                                                                    : "text-[#8ba2cc]"
                                                            )}
                                                        >
                                                            {item.lastMessageText ||
                                                                "Start the conversation"}
                                                        </p>
                                                        {item.isGroup ? (
                                                            <p className="mt-1 truncate text-[11px] text-[#6f86b2]">
                                                                {getConversationSubtitle(item)}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                    {!item.isGroup && unreadMessages === 0 ? (
                                                        <span
                                                            className={cn(
                                                                "mt-1 inline-flex h-2.5 w-2.5 rounded-full",
                                                                item.participant?.isOnline
                                                                    ? "bg-emerald-400"
                                                                    : "bg-[#31415e]"
                                                            )}
                                                        />
                                                    ) : null}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                    </motion.div>

                                    {filteredConversations.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-[var(--app-line-strong)] p-4 text-sm text-[#8ba2cc]">
                                            No chats yet. Start with one of your accepted connections.
                                        </div>
                                    ) : null}

                                    <div className="mt-4 border-t border-[var(--app-line)] px-2 pt-4">
                                        {isGroupComposerOpen ? (
                                            <div className="mb-4 rounded-2xl border border-[#1a2c57] bg-[#0c1734] p-4">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            New group chat
                                                        </p>
                                                        <p className="text-xs text-[#8ba2cc]">
                                                            Pick at least two connected people.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsGroupComposerOpen(false);
                                                            setGroupName("");
                                                            setSelectedGroupMemberIds([]);
                                                        }}
                                                        className="text-xs font-semibold text-[#8ba2cc] transition hover:text-white"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <input
                                                    value={groupName}
                                                    onChange={(event) => setGroupName(event.target.value)}
                                                    placeholder="Group name"
                                                    className="mb-3 h-10 w-full rounded-xl border border-[#1a2c57] bg-[#081227] px-3 text-sm text-white placeholder:text-[#6f86b2] focus:border-[#2d3dff] focus:outline-none"
                                                />
                                                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                                                    {contacts.map((contact) => {
                                                        const isSelected = selectedGroupMemberIds.includes(
                                                            contact.id
                                                        );

                                                        return (
                                                            <button
                                                                key={contact.id}
                                                                type="button"
                                                                onClick={() => toggleGroupMember(contact.id)}
                                                                className={cn(
                                                                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition",
                                                                    isSelected
                                                                        ? "border-[#2d3dff] bg-[#12204a]"
                                                                        : "border-[#1a2c57] bg-[#081227] hover:bg-[#0d183a]"
                                                                )}
                                                            >
                                                                <Avatar
                                                                    name={contact.name || contact.email}
                                                                    src={contact.profileImage}
                                                                    className="h-9 w-9"
                                                                />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="truncate text-sm font-semibold text-white">
                                                                        {contact.name || contact.email}
                                                                    </p>
                                                                    <p className="truncate text-xs text-[#8ba2cc]">
                                                                        {contact.professionalTitle ||
                                                                            contact.email}
                                                                    </p>
                                                                </div>
                                                                <span
                                                                    className={cn(
                                                                        "inline-flex h-5 min-w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                                                                        isSelected
                                                                            ? "border-[#2d3dff] bg-[#2d3dff] text-white"
                                                                            : "border-[#345086] text-[#8ba2cc]"
                                                                    )}
                                                                >
                                                                    {isSelected ? "OK" : "+"}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleCreateGroupConversation()}
                                                    disabled={isCreatingGroup}
                                                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#2d3dff] px-4 text-sm font-semibold text-white transition hover:bg-[#2634e7] disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isCreatingGroup ? "Creating..." : "Create group"}
                                                </button>
                                            </div>
                                        ) : null}
                                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#6f86b2]">
                                            Connected Developers
                                        </p>
                                        <motion.div className="space-y-2" variants={staggerList} initial="hidden" animate="show">
                                            {filteredContacts.map((contact) => (
                                                <motion.button
                                                    key={contact.id}
                                                    variants={fadeItem}
                                                    type="button"
                                                    onClick={() => void openConversation(contact)}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#0d183a]"
                                                    whileHover={{ x: 4 }}
                                                    whileTap={{ scale: 0.99 }}
                                                >
                                                    <Avatar
                                                        name={contact.name || contact.email}
                                                        src={contact.profileImage}
                                                        className="h-10 w-10"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-white">
                                                            {contact.name || contact.email}
                                                        </p>
                                                        <p className="truncate text-xs text-[#8ba2cc]">
                                                            {contact.professionalTitle || contact.email}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            "inline-flex h-2.5 w-2.5 rounded-full",
                                                            contact.isOnline
                                                                ? "bg-emerald-400"
                                                                : "bg-[#31415e]"
                                                        )}
                                                    />
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    </div>
                                </div>
                            </aside>

                            <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#060b20]">
                                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--app-line)] bg-[#060b20]/95 px-5 backdrop-blur">
                                    <div className="flex items-center gap-3">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#3c4cff] text-white">
                                            {activeConversation?.isGroup ? (
                                                <Users size={16} />
                                            ) : (
                                                <Code2 size={16} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">
                                                {getConversationDisplayName(activeConversation)}
                                            </p>
                                            <p
                                                className={cn(
                                                    "text-xs",
                                                    activeConversation?.isGroup
                                                        ? "text-[#7d94bf]"
                                                        : activeConversation?.participant?.isOnline
                                                        ? "text-[#34d399]"
                                                        : "text-[#7d94bf]"
                                                )}
                                            >
                                                {typingConversationId === activeConversation?.id
                                                    ? "typing..."
                                                    : getConversationSubtitle(activeConversation)}
                                            </p>
                                            {activeConversation?.isGroup ? (
                                                <p className="mt-1 text-[11px] font-semibold text-[#9fb0ff]">
                                                    Admin: {getGroupAdminName(activeConversation) || "Unknown"}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-[#738bbc]">
                                        <button
                                            type="button"
                                            disabled={
                                                !activeConversation ||
                                                !!activeCall ||
                                                activeConversation.isGroup
                                            }
                                            onClick={() => void startCall("video")}
                                            className="disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Video size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={
                                                !activeConversation ||
                                                !!activeCall ||
                                                activeConversation.isGroup
                                            }
                                            onClick={() => void startCall("audio")}
                                            className="disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Phone size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!activeConversation?.isGroup}
                                            onClick={() => setIsManageGroupOpen((current) => !current)}
                                            className="rounded-lg p-1.5 transition hover:bg-[#101b3b] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <MoreVertical size={17} />
                                        </button>
                                    </div>
                                </header>

                                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                                    <div className="mx-auto max-w-[900px]">
                                        {activeConversation?.isGroup && isManageGroupOpen ? (
                                            <div className="sticky top-4 z-10 mb-6 rounded-3xl border border-[#1a2c57] bg-[#0e1733]/95 p-5 backdrop-blur">
                                                <div className="mb-4 flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-base font-semibold text-white">
                                                            Manage group members
                                                        </p>
                                                        <p className="text-sm text-[#8ba2cc]">
                                                            Add connected people or remove current members.
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsManageGroupOpen(false)}
                                                        className="text-xs font-semibold text-[#8ba2cc] transition hover:text-white"
                                                    >
                                                        Close
                                                    </button>
                                                </div>

                                                <div className="grid gap-5 md:grid-cols-2">
                                                    <div>
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f86b2]">
                                                                Members
                                                            </p>
                                                            {!isGroupAdmin ? (
                                                                <span className="text-[11px] font-semibold text-[#8ba2cc]">
                                                                    Only the group admin can edit members
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <div className="space-y-2">
                                                            {activeConversation.participants.map((participant) => (
                                                                <div
                                                                    key={participant.id}
                                                                    className="flex items-center gap-3 rounded-2xl border border-[#1a2c57] bg-[#0a1228] px-3 py-2"
                                                                >
                                                                    <Avatar
                                                                        name={participant.name || participant.email}
                                                                        src={participant.profileImage}
                                                                        className="h-9 w-9"
                                                                    />
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-semibold text-white">
                                                                            {participant.name || participant.email}
                                                                        </p>
                                                                        <p className="truncate text-xs text-[#8ba2cc]">
                                                                            {participant.email}
                                                                        </p>
                                                                    </div>
                                                                    {participant.id === activeConversation.adminId ? (
                                                                        <span className="rounded-full bg-[#2d3dff]/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9fb0ff]">
                                                                            Admin
                                                                        </span>
                                                                    ) : isGroupAdmin ? (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                void handleRemoveGroupMember(
                                                                                    participant.id
                                                                                )
                                                                            }
                                                                            disabled={isUpdatingGroupMembers}
                                                                            className="rounded-lg border border-red-500/30 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    ) : null}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f86b2]">
                                                                Add people
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={() => void handleAddGroupMembers()}
                                                                disabled={
                                                                    !isGroupAdmin ||
                                                                    isUpdatingGroupMembers ||
                                                                    selectedMembersToAdd.length === 0
                                                                }
                                                                className="rounded-lg bg-[#2d3dff] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2634e7] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                Add selected
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {availableContactsToAdd.length === 0 ? (
                                                                <div className="rounded-2xl border border-dashed border-[#1a2c57] bg-[#0a1228] px-4 py-5 text-sm text-[#8ba2cc]">
                                                                    No more connected people are available to add.
                                                                </div>
                                                            ) : (
                                                                availableContactsToAdd.map((contact) => {
                                                                    const isSelected = selectedMembersToAdd.includes(
                                                                        contact.id
                                                                    );

                                                                    return (
                                                                        <button
                                                                            key={contact.id}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                isGroupAdmin &&
                                                                                toggleMemberToAdd(contact.id)
                                                                            }
                                                                            disabled={!isGroupAdmin}
                                                                            className={cn(
                                                                                "flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition",
                                                                                isSelected
                                                                                    ? "border-[#2d3dff] bg-[#12204a]"
                                                                                    : "border-[#1a2c57] bg-[#0a1228] hover:bg-[#101b3b]",
                                                                                !isGroupAdmin &&
                                                                                    "cursor-not-allowed opacity-60"
                                                                            )}
                                                                        >
                                                                            <Avatar
                                                                                name={contact.name || contact.email}
                                                                                src={contact.profileImage}
                                                                                className="h-9 w-9"
                                                                            />
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-semibold text-white">
                                                                                    {contact.name || contact.email}
                                                                                </p>
                                                                                <p className="truncate text-xs text-[#8ba2cc]">
                                                                                    {contact.professionalTitle ||
                                                                                        contact.email}
                                                                                </p>
                                                                            </div>
                                                                            <span className="text-xs font-semibold text-[#c7d5f3]">
                                                                                {isSelected ? "Selected" : "Add"}
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                        {!activeConversation ? (
                                            <div className="rounded-3xl border border-dashed border-[#1a2c57] bg-[#101b3b] p-8 text-center text-[#8ba2cc]">
                                                Pick a connected developer to start a realtime chat.
                                            </div>
                                        ) : messagesQuery.isLoading ? (
                                            <div className="text-center text-sm text-[#8ba2cc]">
                                                Loading messages...
                                            </div>
                                        ) : (
                                            <motion.div className="space-y-4" variants={staggerList} initial="hidden" animate="show">
                                                {messages.map((message, index) => {
                                                    const fromMe =
                                                        message.senderId === user?.id ||
                                                        message.sender?.id === user?.id;
                                                    const previousMessage = messages[index - 1];
                                                    const sender = findMessageSender(
                                                        activeConversation,
                                                        message,
                                                        user?.id
                                                    );
                                                    const showDateLabel =
                                                        !previousMessage ||
                                                        formatMessageDate(previousMessage.createdAt) !==
                                                            formatMessageDate(message.createdAt);
                                                    const isCallLog = message.type === "call";
                                                    const isVoiceMessage = message.type === "voice";

                                                    return (
                                                        <motion.div
                                                            key={message.id}
                                                            variants={fadeItem}
                                                            initial={{ opacity: 0, y: 12 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.22, ease: "easeOut" }}
                                                        >
                                                            {showDateLabel ? (
                                                                <div className="mb-4 flex justify-center">
                                                                    <span className="rounded-full bg-[#12244d] px-3 py-1 text-xs font-semibold text-[#7f9ccf]">
                                                                        {formatMessageDate(message.createdAt)}
                                                                    </span>
                                                                </div>
                                                            ) : null}
                                                            {isCallLog ? (
                                                                <div className="flex justify-center">
                                                                    <div className="inline-flex min-w-[220px] max-w-[340px] flex-col items-center rounded-2xl border border-[#28406c] bg-[#0f1d3c] px-4 py-3 text-center text-[#d6e4ff]">
                                                                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-white">
                                                                            {message.callMeta?.callType === "video" ? (
                                                                                <Video size={15} />
                                                                            ) : (
                                                                                <Phone size={15} />
                                                                            )}
                                                                            {getCallStatusLabel(message)}
                                                                        </div>
                                                                        {message.callMeta?.status === "completed" ? (
                                                                            <p className="text-xs text-[#8fb0e8]">
                                                                                Connected for{" "}
                                                                                {formatCallDuration(
                                                                                    message.callMeta.durationSeconds
                                                                                )}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-xs text-[#8fb0e8]">
                                                                                Not connected
                                                                            </p>
                                                                        )}
                                                                        <p className="mt-1 text-[11px] text-[#6e86b4]">
                                                                            {formatClock(message.createdAt)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className={
                                                                        fromMe
                                                                            ? "ml-auto flex max-w-[84%] justify-end"
                                                                            : "flex max-w-[84%] justify-start"
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            fromMe
                                                                                ? "inline-flex max-w-full flex-col items-end"
                                                                                : "inline-flex max-w-full flex-col items-start"
                                                                        }
                                                                    >
                                                                        {!fromMe ? (
                                                                            <p className="mb-1 text-xs text-[#7d94bf]">
                                                                                {sender?.name ||
                                                                                    sender?.email ||
                                                                                    getConversationDisplayName(
                                                                                        activeConversation
                                                                                    )}{" "}
                                                                                · {formatClock(message.createdAt)}
                                                                            </p>
                                                                        ) : null}
                                                                        <div
                                                                            className={
                                                                                fromMe
                                                                                    ? "inline-block max-w-full rounded-2xl bg-gradient-to-br from-[var(--app-primary)] to-[#38bdf8] px-4 py-3 text-black shadow-glow"
                                                                                    : "inline-block max-w-full rounded-2xl bg-[var(--app-surface-strong)] border border-[var(--app-line)] px-4 py-3 text-[var(--app-text)]"
                                                                            }
                                                                        >
                                                                            {isVoiceMessage && message.voiceMeta ? (
                                                                                <div className="min-w-[220px] max-w-[280px]">
                                                                                    <div className="mb-2 flex items-center justify-between text-xs">
                                                                                        <span className="font-semibold">
                                                                                            Voice message
                                                                                        </span>
                                                                                        <span>
                                                                                            {formatVoiceDuration(
                                                                                                message.voiceMeta
                                                                                                    .durationSeconds
                                                                                            )}
                                                                                        </span>
                                                                                    </div>
                                                                                    <audio
                                                                                        controls
                                                                                        preload="none"
                                                                                        src={message.voiceMeta.audioUrl}
                                                                                        className="w-full"
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <p className={cn(
                                                                                    "whitespace-pre-wrap break-words leading-7",
                                                                                    fromMe ? "text-black" : "text-[var(--app-text)]"
                                                                                )}>
                                                                                    {message.content}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {fromMe ? (
                                                                            <p className="mt-1 text-right text-xs text-[var(--app-muted)]">
                                                                                You · {formatClock(message.createdAt)}
                                                                            </p>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    );
                                                })}
                                                {messages.length === 0 ? (
                                                    <div className="rounded-3xl border border-dashed border-[#1a2c57] bg-[#101b3b] p-6 text-center text-sm text-[#8ba2cc]">
                                                        This conversation is ready. Send the first message.
                                                    </div>
                                                ) : null}
                                                <div ref={messagesEndRef} />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <footer className="sticky bottom-0 z-10 border-t border-[var(--app-line)] bg-[#060b20]/95 p-4 backdrop-blur">
                                    <div className="mx-auto max-w-[900px] rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] p-3 shadow-[0_-10px_30px_rgba(3,8,24,0.25)]">
                                        <input
                                            value={text}
                                            onChange={(event) => {
                                                setText(event.target.value);
                                                emitTyping();
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" && !event.shiftKey) {
                                                    event.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                            placeholder="Type a message..."
                                            disabled={!activeConversation}
                                            className="h-10 w-full bg-transparent px-2 text-sm text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:outline-none disabled:cursor-not-allowed"
                                        />
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-xs text-[#6f88b8]">
                                                {isRecordingVoice
                                                    ? `Recording voice note · ${formatVoiceDuration(
                                                          voiceRecordingSeconds
                                                      )}`
                                                    : isUploadingVoice
                                                    ? "Uploading voice note..."
                                                    : "Live via Socket.IO and WebRTC signaling"}
                                            </div>
                                            <div className="flex items-center gap-2 z-10 relative">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        isRecordingVoice
                                                            ? stopVoiceRecording
                                                            : () => void startVoiceRecording()
                                                    }
                                                    disabled={!activeConversation || isUploadingVoice}
                                                    className={cn(
                                                        "inline-flex h-10 w-10 items-center justify-center rounded-xl text-white disabled:cursor-not-allowed disabled:opacity-50",
                                                        isRecordingVoice
                                                            ? "bg-red-500 hover:bg-red-600"
                                                            : "bg-[#142448] hover:bg-[#1c315f]"
                                                    )}
                                                >
                                                    {isUploadingVoice ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : isRecordingVoice ? (
                                                        <Square size={16} />
                                                    ) : (
                                                        <Mic size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={sendMessage}
                                                    disabled={
                                                        !activeConversation ||
                                                        !text.trim() ||
                                                        isRecordingVoice ||
                                                        isUploadingVoice
                                                    }
                                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2d3dff] px-4 text-sm font-semibold text-white hover:bg-[#2634e7] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Send
                                                    <SendHorizontal size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </footer>
                            </section>
                        </div>

                        <AnimatePresence>
                        {incomingCall ? (
                            <motion.div
                                className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/72 p-4 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                            >
                                <motion.div
                                    className="w-full max-w-md rounded-[28px] border border-[#1a2c57] bg-[#0a1228] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.5)]"
                                    initial={{ scale: 0.96, y: 12 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.96, y: 12 }}
                                >
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#132341] text-[#9fb0ff]">
                                            {incomingCall.callType === "video" ? (
                                                <Video size={28} />
                                            ) : (
                                                <Phone size={28} />
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8ba2cc]">
                                            Incoming {incomingCall.callType} call
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold text-white">
                                            {incomingCall.fromUser.name || incomingCall.fromUser.email}
                                        </p>
                                        <p className="mt-2 text-sm text-[#7f94bc]">
                                            Choose whether to accept or reject this call.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={declineIncomingCall}
                                            className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => void acceptIncomingCall()}
                                            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : null}
                        </AnimatePresence>

                        <AnimatePresence>
                        {activeCall ? (
                            <motion.div
                                className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center bg-[#020617]/86 p-4 backdrop-blur-md"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.24, ease: "easeOut" }}
                            >
                                <motion.div
                                    className="relative flex h-full max-h-[760px] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#1a2c57] bg-[#08101f] shadow-[0_32px_90px_rgba(2,6,23,0.55)]"
                                    initial={{ scale: 0.98, y: 16 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.98, y: 16 }}
                                >
                                    <div className="flex items-center justify-between gap-4 border-b border-[#1a2c57] bg-[#0b1226]/95 px-5 py-4">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-[#8ba2cc]">
                                                {activeCall.callType === "video" ? "Video call" : "Audio call"}
                                            </p>
                                            <p className="truncate font-semibold text-white">
                                                {activeCall.otherUser.name || activeCall.otherUser.email}
                                            </p>
                                            <p className="min-h-[20px] min-w-[170px] text-xs tabular-nums text-[#6f86b2]">
                                                {activeCall.status === "ringing"
                                                    ? "Ringing..."
                                                    : activeCall.status === "connecting"
                                                    ? "Connecting..."
                                                    : `Connected · ${formatLiveCallDuration(callElapsedSeconds)}`}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={toggleMicrophone}
                                                disabled={!activeCall}
                                                className={cn(
                                                    "inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                                    isMicEnabled
                                                        ? "border-[#29406d] bg-[#142448] hover:bg-[#1a2e59]"
                                                        : "border-[#7f1d1d] bg-[#3f131c] hover:bg-[#531927]"
                                                )}
                                            >
                                                {isMicEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                                            </button>
                                            {activeCall.callType === "video" ? (
                                                <button
                                                    type="button"
                                                    onClick={toggleCamera}
                                                    disabled={!activeCall}
                                                    className={cn(
                                                        "inline-flex h-11 w-11 items-center justify-center rounded-2xl border text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                                                        isCameraEnabled
                                                            ? "border-[#29406d] bg-[#142448] hover:bg-[#1a2e59]"
                                                            : "border-[#7f1d1d] bg-[#3f131c] hover:bg-[#531927]"
                                                    )}
                                                >
                                                    {isCameraEnabled ? (
                                                        <Video size={18} />
                                                    ) : (
                                                        <VideoOff size={18} />
                                                    )}
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={() => endCall(true)}
                                                className="rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                                            >
                                                End
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative min-h-0 flex-1 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_34%),linear-gradient(180deg,_#091224_0%,_#040914_100%)]">
                                        <div className="absolute inset-0 p-4 sm:p-5">
                                            <div className="relative h-full overflow-hidden rounded-[28px] border border-[#163056] bg-[#050b16]">
                                                <video
                                                    ref={remoteVideoRef}
                                                    autoPlay
                                                    playsInline
                                                    className="h-full w-full object-cover"
                                                />
                                                {activeCall.callType === "video" && !isRemoteVideoEnabled ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040914]/82 px-6 text-center">
                                                        <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#132341] text-[#9fb0ff]">
                                                            <VideoOff size={28} />
                                                        </div>
                                                        <p className="text-base font-semibold text-white">
                                                            Waiting for remote camera
                                                        </p>
                                                        <p className="mt-1 text-sm text-[#8ba2cc]">
                                                            Their video will appear here when the stream is received.
                                                        </p>
                                                    </div>
                                                ) : null}
                                                {activeCall.callType === "audio" ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#040914]/70 px-6 text-center">
                                                        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#132341] text-[#9fb0ff]">
                                                            <Phone size={30} />
                                                        </div>
                                                        <p className="text-lg font-semibold text-white">
                                                            {activeCall.otherUser.name || activeCall.otherUser.email}
                                                        </p>
                                                        <p className="mt-1 text-sm text-[#8ba2cc]">Audio call in progress</p>
                                                    </div>
                                                ) : null}
                                                <div className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-white">
                                                    Remote
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 right-4 w-[140px] overflow-hidden rounded-3xl border border-[#29406d] bg-[#0d1731] shadow-2xl sm:w-[220px]">
                                            <div className="relative">
                                                <video
                                                    ref={localVideoRef}
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    className="aspect-[4/5] w-full bg-[#142448] object-cover"
                                                />
                                                <div className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                                                    You
                                                </div>
                                                {activeCall.callType === "video" && !isCameraEnabled ? (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-[#040914]/88 text-xs font-semibold text-[#dbe7ff]">
                                                        Camera off
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : null}
                        </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
