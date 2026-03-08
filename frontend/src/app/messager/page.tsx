"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    Bell,
    Code2,
    Compass,
    House,
    Image as ImageIcon,
    MoreVertical,
    MessageSquare,
    Paperclip,
    Phone,
    Search,
    SendHorizontal,
    Settings,
    Smile,
    SquarePen,
    User,
    Users,
    Video,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type ChatMessage = {
    id: string;
    sender: string;
    fromMe: boolean;
    time: string;
    text?: string;
    code?: string;
};

type Conversation = {
    id: string;
    name: string;
    subtitle: string;
    onlineCount?: number;
    avatar?: string;
    preview: string;
    previewTime: string;
    unread?: boolean;
    messages: ChatMessage[];
};

const baseConversations: Conversation[] = [
    {
        id: "react-team",
        name: "React Team",
        subtitle: "Sarah: Fixed the hydration error in the ...",
        onlineCount: 12,
        preview: "Sarah: Fixed the hydration error in the ...",
        previewTime: "12:45 PM",
        messages: [
            {
                id: "m1",
                sender: "Sarah Mitchell",
                fromMe: false,
                time: "12:30 PM",
                text: "Hey everyone! I've finally tracked down that pesky hydration error in the SSR build. It was a mismatch in the date formatting between client and server.",
            },
            {
                id: "m2",
                sender: "Sarah Mitchell",
                fromMe: false,
                time: "12:34 PM",
                text: "Here is the fix I'm pushing:",
                code: `export const FormattedDate = ({ date }) => {\n  const [isMounted, setIsMounted] = useState(false);\n\n  useEffect(() => setIsMounted(true), []);\n\n  if (!isMounted) return null;\n\n  return <span>{new Intl.DateTimeFormat().format(date)}</span>;\n};`,
            },
            {
                id: "m3",
                sender: "You",
                fromMe: true,
                time: "12:45 PM",
                text: "Nice catch, Sarah! This explains why it only failed on specific locales in production. I'll review the PR right away.",
            },
        ],
    },
    {
        id: "frontend-leads",
        name: "Frontend Leads",
        subtitle: "Marco: Any thoughts on the Tailwind...",
        preview: "Marco: Any thoughts on the Tailwind...",
        previewTime: "11:20 AM",
        unread: true,
        messages: [
            {
                id: "m4",
                sender: "Marco",
                fromMe: false,
                time: "11:20 AM",
                text: "Any thoughts on the Tailwind v4 migration timeline?",
            },
        ],
    },
    {
        id: "david",
        name: "David Chen",
        subtitle: "The PR for the auth service has been m...",
        preview: "The PR for the auth service has been merged.",
        previewTime: "Yesterday",
        messages: [
            {
                id: "m5",
                sender: "David Chen",
                fromMe: false,
                time: "Yesterday",
                text: "The PR for the auth service has been merged.",
            },
        ],
    },
    {
        id: "backend-sync",
        name: "Backend Sync",
        subtitle: "System: Meeting scheduled for next Fri...",
        preview: "System: Meeting scheduled for next Friday.",
        previewTime: "Tue",
        messages: [
            {
                id: "m6",
                sender: "System",
                fromMe: false,
                time: "Tue",
                text: "Meeting scheduled for next Friday at 6:30 PM IST.",
            },
        ],
    },
];

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/skills", label: "My Skills", icon: Code2 },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/messager", label: "Messager", icon: MessageSquare, active: true },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function MessagerPage() {
    const [conversations, setConversations] = useState(baseConversations);
    const [activeId, setActiveId] = useState("react-team");
    const [query, setQuery] = useState("");
    const [text, setText] = useState("");
    const user = useAuthStore((state) => state.user);

    const activeConversation = conversations.find((item) => item.id === activeId) || conversations[0];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return conversations;
        return conversations.filter(
            (item) =>
                item.name.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)
        );
    }, [conversations, query]);

    const send = () => {
        const value = text.trim();
        if (!value || !activeConversation) return;

        setConversations((prev) =>
            prev.map((item) =>
                item.id === activeConversation.id
                    ? {
                          ...item,
                          subtitle: `You: ${value}`,
                          preview: value,
                          previewTime: "Now",
                          unread: false,
                          messages: [
                              ...item.messages,
                              {
                                  id: `${Date.now()}`,
                                  sender: "You",
                                  fromMe: true,
                                  time: "Now",
                                  text: value,
                              },
                          ],
                      }
                    : item
            )
        );
        setText("");
    };

    return (
        <ProtectedRoute>
            <div className="h-screen overflow-hidden bg-[#020617] text-[#d8e2ff]">
                <div className="flex h-screen w-full">
                    <aside className="sticky top-0 hidden h-screen w-[250px] flex-col border-r border-[#1d3557] bg-[#0a172c] p-4 lg:flex">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white">
                                <Code2 size={18} />
                            </div>
                            <p className="text-2xl font-semibold text-white">DevConnect</p>
                        </div>

                        <nav className="space-y-1">
                            {leftNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                                            item.active
                                                ? "bg-[#1e293b] text-white"
                                                : "text-[#8aa0c2] hover:bg-[#122541] hover:text-[#d7e7ff]"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto w-full max-w-[220px] self-center rounded-2xl bg-[#f8fafc] p-3 text-[#0f172a]">
                            <div className="flex items-center gap-3">
                                <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                                <div>
                                    <p className="text-sm font-semibold">{user?.name || "Alex Dev"}</p>
                                    <p className="text-xs text-[#64748b]">
                                        @{(user?.email || "alex_fullstack").split("@")[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="h-screen w-full flex-1 overflow-hidden">
                        <div className="flex h-full min-w-0">
                            <aside className="flex h-full w-[280px] flex-col border-r border-[#16203e] bg-[#080d24]">
                        <div className="border-b border-[#16203e] px-4 py-4">
                            <div className="mb-4 flex items-center justify-between">
                                <h1 className="text-3xl font-semibold text-white">Chats</h1>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f1a3b] text-[#74a6ff]"
                                    >
                                        <Users size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#2135ff] text-white"
                                    >
                                        <SquarePen size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6780ad]"
                                />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search developers or groups..."
                                    className="h-10 w-full rounded-xl border border-[#1b2d57] bg-[#0d1736] pl-9 pr-3 text-sm text-[#d7e6ff] placeholder:text-[#5e75a4] focus:border-[#2f62ff] focus:outline-none"
                                />
                            </div>
                            <div className="mt-4 flex items-center gap-3 border-b border-[#16203e] pb-3 text-sm">
                                <span className="rounded-full bg-[#2447ff] px-3 py-1 font-semibold text-white">
                                    All
                                </span>
                                <span className="text-[#7d94bf]">Direct</span>
                                <span className="text-[#7d94bf]">Groups</span>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-2">
                            {filtered.map((item) => {
                                const isActive = item.id === activeConversation?.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveId(item.id)}
                                        className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition-colors ${
                                            isActive
                                                ? "bg-[#102151] ring-1 ring-[#264bff]"
                                                : "hover:bg-[#0d183a]"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar name={item.name} src={item.avatar} className="h-10 w-10" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-base font-semibold text-white">
                                                        {item.name}
                                                    </p>
                                                    <span className="text-xs text-[#6f86b2]">
                                                        {item.previewTime}
                                                    </span>
                                                </div>
                                                <p className="truncate text-sm text-[#8ba2cc]">{item.subtitle}</p>
                                            </div>
                                            {item.unread ? (
                                                <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#2f62ff]" />
                                            ) : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                            </aside>

                            <section className="flex min-h-0 flex-1 flex-col bg-[#060b20]">
                        <header className="flex h-16 items-center justify-between border-b border-[#16203e] px-5">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#3c4cff] text-white">
                                    <Code2 size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{activeConversation.name}</p>
                                    <p className="text-xs text-[#34d399]">
                                        {activeConversation.onlineCount
                                            ? `${activeConversation.onlineCount} members online`
                                            : "online"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[#738bbc]">
                                <Video size={17} />
                                <Phone size={17} />
                                <MoreVertical size={17} />
                            </div>
                        </header>

                        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                            <div className="mx-auto max-w-[900px]">
                                <div className="mb-5 text-center">
                                    <span className="rounded-full bg-[#12244d] px-3 py-1 text-xs font-semibold text-[#7f9ccf]">
                                        TODAY
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    {activeConversation.messages.map((msg) => (
                                        <div key={msg.id} className={msg.fromMe ? "ml-auto max-w-[84%]" : "max-w-[84%]"}>
                                            {!msg.fromMe ? (
                                                <p className="mb-1 text-xs text-[#7d94bf]">
                                                    {msg.sender} · {msg.time}
                                                </p>
                                            ) : null}
                                            <div
                                                className={
                                                    msg.fromMe
                                                        ? "rounded-2xl bg-[#2a39ff] px-4 py-3 text-white"
                                                        : "rounded-2xl bg-[#142448] px-4 py-3 text-[#d6e4ff]"
                                                }
                                            >
                                                {msg.text ? <p className="leading-7">{msg.text}</p> : null}
                                                {msg.code ? (
                                                    <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0a1434] p-4 text-xs text-[#9ec4ff]">
                                                        <code>{msg.code}</code>
                                                    </pre>
                                                ) : null}
                                            </div>
                                            {msg.fromMe ? (
                                                <p className="mt-1 text-right text-xs text-[#6e86b4]">You · {msg.time}</p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <footer className="border-t border-[#16203e] p-4">
                            <div className="mx-auto max-w-[900px] rounded-2xl border border-[#1a2c57] bg-[#101b3b] p-3">
                                <input
                                    value={text}
                                    onChange={(event) => setText(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" && !event.shiftKey) {
                                            event.preventDefault();
                                            send();
                                        }
                                    }}
                                    placeholder="Type a message or paste code..."
                                    className="h-10 w-full bg-transparent px-2 text-sm text-[#d8e4ff] placeholder:text-[#5f76a2] focus:outline-none"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[#6f88b8]">
                                        <Paperclip size={16} />
                                        <ImageIcon size={16} />
                                        <Smile size={16} />
                                        <Code2 size={16} />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={send}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2d3dff] px-4 text-sm font-semibold text-white hover:bg-[#2634e7]"
                                    >
                                        Send
                                        <SendHorizontal size={15} />
                                    </button>
                                </div>
                            </div>
                        </footer>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
