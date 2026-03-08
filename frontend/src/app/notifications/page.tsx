"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Bell,
    Check,
    CheckCheck,
    Code2,
    Compass,
    House,
    MessageSquare,
    Settings,
    User,
    X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    deleteNotification,
    getMyNotifications,
    markAllNotificationsRead,
    markNotificationRead,
} from "@/services/notificationServices";
import { respondToConnectionRequest } from "@/services/searchServices";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/types/domain";

type TabType = "all" | NotificationType;

const tabs: Array<{ id: TabType; label: string }> = [
    { id: "all", label: "All" },
    { id: "connections", label: "Connections" },
    { id: "mentions", label: "Mentions" },
    { id: "skills", label: "Skills" },
];

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["notifications", activeTab],
        queryFn: () => getMyNotifications(activeTab),
    });

    const markAllMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            pushToast({ type: "success", title: "All notifications marked as read" });
        },
        onError: () => {
            pushToast({ type: "error", title: "Could not mark notifications as read" });
        },
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
        onError: () => {
            pushToast({ type: "error", title: "Could not update notification" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            pushToast({ type: "success", title: "Notification removed" });
        },
        onError: () => {
            pushToast({ type: "error", title: "Could not delete notification" });
        },
    });

    const respondConnectionMutation = useMutation({
        mutationFn: async ({
            notificationId,
            actorId,
            action,
        }: {
            notificationId: string;
            actorId: string;
            action: "accepted" | "rejected";
        }) => {
            await respondToConnectionRequest(actorId, action);
            await deleteNotification(notificationId);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["suggestions"] });
            queryClient.invalidateQueries({ queryKey: ["search"] });
            pushToast({
                type: "success",
                title:
                    variables.action === "accepted"
                        ? "Connection request accepted"
                        : "Connection request declined",
            });
        },
        onError: () => {
            pushToast({ type: "error", title: "Could not update connection request" });
        },
    });

    const handlePrimaryAction = (item: (typeof items)[number]) => {
        if (item.type === "connections" && item.actionLabel === "Accept") {
            if (!item.actorId) {
                pushToast({ type: "error", title: "Missing sender reference for this request" });
                return;
            }
            respondConnectionMutation.mutate({
                notificationId: item.id,
                actorId: item.actorId,
                action: "accepted",
            });
            return;
        }

        markReadMutation.mutate(item.id);
        pushToast({
            type: "success",
            title: `${item.actionLabel} completed`,
        });
    };

    const handleSecondaryAction = (item: (typeof items)[number]) => {
        if (item.type === "connections" && item.secondaryAction === "Decline") {
            if (!item.actorId) {
                pushToast({ type: "error", title: "Missing sender reference for this request" });
                return;
            }
            respondConnectionMutation.mutate({
                notificationId: item.id,
                actorId: item.actorId,
                action: "rejected",
            });
            return;
        }

        deleteMutation.mutate(item.id);
    };

    const items = query.data?.data || [];
    const today = items.filter((item) => item.group === "today");
    const yesterday = items.filter((item) => item.group === "yesterday");
    const unreadCount = items.filter((item) => item.unread).length;

    const leftNav = [
        { href: "/dashboard", label: "Feed", icon: House },
        { href: "/profile", label: "My Profile", icon: User },
        { href: "/skills", label: "My Skills", icon: Code2 },
        { href: "/search", label: "Explore", icon: Compass },
        { href: "/messager", label: "Messager", icon: MessageSquare },
        {
            href: "/notifications",
            label: "Notifications",
            icon: Bell,
            active: true,
            count: unreadCount,
        },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <ProtectedRoute>
            <div className="h-screen overflow-hidden bg-[#020617] text-[#e2e8f0]">
                <div className="flex h-screen w-full">
                    <aside className="sticky top-0 hidden h-screen w-[250px] flex-col border-r border-[#1d3557] bg-[#0a172c] p-4 lg:flex">
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563eb] text-white">
                                <Code2 size={18} />
                            </div>
                            <p className="text-xl font-semibold text-white">DevConnect</p>
                        </div>

                        <nav className="space-y-1">
                            {leftNav.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                                            item.active
                                                ? "bg-[#27324f] text-[#7f8cff]"
                                                : "text-[#8aa0c2] hover:bg-[#122541] hover:text-[#d7e7ff]"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon size={18} />
                                            {item.label}
                                        </span>
                                        {item.count ? (
                                            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#5865f2] px-1 text-xs text-white">
                                                {item.count}
                                            </span>
                                        ) : null}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto flex items-center gap-3">
                            <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                            <div>
                                <p className="text-sm font-semibold text-white">{user?.name || "Alex Dev"}</p>
                                <p className="text-xs text-[#8aa0c2]">
                                    @{(user?.email || "alex_fullstack").split("@")[0]}
                                </p>
                            </div>
                        </div>
                    </aside>

                    <main className="no-scrollbar h-screen flex-1 overflow-y-auto border-r border-[#132849] p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0">
                        <div className="mx-auto w-full max-w-[900px]">
                            <header className="mb-4 flex items-start justify-between gap-3 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-4">
                                <div>
                                    <h1 className="text-3xl font-semibold text-white">Notifications</h1>
                                    <p className="mt-1 text-sm text-[#8aa0c2]">
                                        Stay updated with your network and skill endorsements.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => markAllMutation.mutate()}
                                    disabled={markAllMutation.isPending}
                                    className="mt-1 inline-flex items-center gap-2 text-sm text-[#7f8cff] hover:text-[#9aa5ff]"
                                >
                                    <CheckCheck size={16} />
                                    <span>Mark all as read</span>
                                </button>
                            </header>

                            <div className="mb-4 flex gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "rounded-full px-4 py-1.5 text-sm font-medium",
                                            activeTab === tab.id
                                                ? "bg-[#6f72ff] text-white"
                                                : "bg-[#162745] text-[#9bb0cf] hover:bg-[#1d3156]"
                                        )}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {query.isLoading ? (
                                <div className="py-6 text-[#8aa0c2]">Loading notifications...</div>
                            ) : query.isError ? (
                                <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                    Failed to load notifications.
                                </div>
                            ) : (
                                <>
                                    <section className="space-y-2.5">
                                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7f98be]">
                                            Today
                                        </h2>
                                        {today.map((item) => (
                                            <article
                                                key={item.id}
                                                className="rounded-2xl border border-[#1a365f] bg-[#1a2942] p-3"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="relative">
                                                            <Avatar name={item.name} className="h-12 w-12" />
                                                            {item.unread ? (
                                                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#34d399]" />
                                                            ) : null}
                                                        </div>
                                                        <div>
                                                            <p className="text-base leading-6 text-[#dce8fa]">
                                                                <span className="font-semibold text-white">
                                                                    {item.name}{" "}
                                                                </span>
                                                                {item.message}
                                                            </p>
                                                            <div className="mt-2 flex gap-2">
                                                                <Button
                                                                    className="h-7 rounded-lg bg-[#5d6bff] px-3 text-xs font-semibold hover:bg-[#4f5be0]"
                                                                    disabled={respondConnectionMutation.isPending}
                                                                    onClick={() => handlePrimaryAction(item)}
                                                                >
                                                                    {item.actionLabel}
                                                                </Button>
                                                                {item.secondaryAction ? (
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="h-7 rounded-lg px-2 text-xs text-[#9bb0cf] hover:bg-[#243958] hover:text-white"
                                                                        disabled={respondConnectionMutation.isPending}
                                                                        onClick={() => handleSecondaryAction(item)}
                                                                    >
                                                                        {item.secondaryAction}
                                                                    </Button>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[#8aa0c2]">
                                                        {item.time}
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteMutation.mutate(item.id)}
                                                            className="text-[#607da7] hover:text-white"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </section>

                                    <section className="mt-6 space-y-2.5">
                                        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7f98be]">
                                            Yesterday
                                        </h2>
                                        {yesterday.map((item) => (
                                            <article
                                                key={item.id}
                                                className="rounded-2xl border border-[#1a365f] bg-[#1a2942] p-3"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar name={item.name} className="h-12 w-12" />
                                                        <div>
                                                            <p className="text-base leading-6 text-[#dce8fa]">
                                                                <span className="font-semibold text-white">
                                                                    {item.name}{" "}
                                                                </span>
                                                                {item.message}
                                                            </p>
                                                            <Button
                                                                className="mt-2 h-7 rounded-lg bg-[#263753] px-3 text-xs font-semibold text-[#8fb0de] hover:bg-[#31466b]"
                                                                variant="ghost"
                                                                disabled={respondConnectionMutation.isPending}
                                                                onClick={() => handlePrimaryAction(item)}
                                                            >
                                                                {item.actionLabel}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-[#8aa0c2]">
                                                        {item.time}
                                                        <button
                                                            type="button"
                                                            onClick={() => deleteMutation.mutate(item.id)}
                                                            className="text-[#607da7] hover:text-white"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </section>

                                    {items.length === 0 ? (
                                        <div className="mt-8 flex flex-col items-center justify-center py-6 text-[#6f88ad]">
                                            <span className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#1b2f4d]">
                                                <Check size={26} />
                                            </span>
                                            <p className="text-xl text-[#b6c9e6]">
                                                You&apos;re all caught up!
                                            </p>
                                            <p className="text-sm">Check back later for more updates.</p>
                                        </div>
                                    ) : null}
                                </>
                            )}
                        </div>
                    </main>

                    <aside className="hidden w-[280px] border-l border-[#132849] bg-[#0a172c] p-4 xl:block">
                        <section className="rounded-2xl border border-[#1a365f] bg-[#1f2e46] p-4">
                            <h3 className="text-xl font-semibold text-white">Networking Stats</h3>
                            <div className="mt-3 space-y-2 text-sm">
                                <div className="flex items-center justify-between text-[#9fb4d2]">
                                    <span>Profile Views</span>
                                    <span className="font-semibold text-[#7f8cff]">+12%</span>
                                </div>
                                <div className="flex items-center justify-between text-[#9fb4d2]">
                                    <span>New Endorsements</span>
                                    <span className="font-semibold text-[#34d399]">5</span>
                                </div>
                                <div className="flex items-center justify-between text-[#9fb4d2]">
                                    <span>Post Reach</span>
                                    <span className="font-semibold text-white">1.2k</span>
                                </div>
                            </div>
                        </section>

                        <section className="mt-4 rounded-2xl border border-[#2d3d80] bg-[#17274a] p-4">
                            <h3 className="text-2xl font-semibold text-[#7f8cff]">Pro Tip</h3>
                            <p className="mt-2 text-sm leading-6 text-[#a6b9d7]">
                                Endorsing your peers for their skills increases your profile
                                visibility by 40% in the recruiter search.
                            </p>
                            <Button className="mt-4 h-10 w-full rounded-xl bg-[#6366f1] text-sm font-semibold hover:bg-[#5558dc]">
                                Start Endorsing
                            </Button>
                        </section>

                        <section className="mt-4 rounded-2xl border border-dashed border-[#2b4972] bg-[#0a162b] p-6 text-center">
                            <p className="text-2xl text-[#607da7]">+</p>
                            <p className="mt-2 text-sm text-[#6f88ad]">
                                Upgrade to Premium to see who viewed your skills
                            </p>
                        </section>
                    </aside>
                </div>
            </div>
        </ProtectedRoute>
    );
}
