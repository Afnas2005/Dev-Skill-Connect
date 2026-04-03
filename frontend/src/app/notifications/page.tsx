"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deleteNotification, getMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/notificationServices";
import { respondToConnectionRequest } from "@/services/searchServices";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types/domain";
import { CheckCheck, X, Bell } from "lucide-react";

type TabType = "all" | NotificationType;
const tabs: Array<{ id: TabType; label: string }> = [
    { id: "all", label: "All Relays" },
    { id: "connections", label: "Network Links" },
    { id: "mentions", label: "Pings" },
    { id: "skills", label: "Endorsements" },
];

const staggerList = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.2 } } };

export default function NotificationsPage() {
    const [activeTab, setActiveTab] = useState<TabType>("all");
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
            pushToast({ type: "success", title: "All relays acknowledged" });
        },
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteNotification(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const respondConnectionMutation = useMutation({
        mutationFn: async ({ actorId, action }: { actorId: string; action: "accepted" | "rejected" }) => {
            await respondToConnectionRequest(actorId, action);
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["search"] });
            pushToast({ type: "success", title: vars.action === "accepted" ? "Link established" : "Link denied" });
        },
    });

    const handlePrimaryAction = (item: AppNotification) => {
        if (item.type === "connections" && item.actionLabel === "Accept") {
            if (item.actorId) respondConnectionMutation.mutate({ actorId: item.actorId, action: "accepted" });
            return;
        }
        markReadMutation.mutate(item.id);
    };

    const handleSecondaryAction = (item: AppNotification) => {
        if (item.type === "connections" && item.secondaryAction === "Decline") {
            if (item.actorId) respondConnectionMutation.mutate({ actorId: item.actorId, action: "rejected" });
            return;
        }
        deleteMutation.mutate(item.id);
    };

    const handleDismiss = (item: AppNotification) => {
        if (item.type === "connections" && item.actionLabel === "Accept" && item.secondaryAction === "Decline") {
            handleSecondaryAction(item);
            return;
        }
        deleteMutation.mutate(item.id);
    };

    const items = query.data?.data || [];
    const today = items.filter((i) => i.group === "today");
    const yesterday = items.filter((i) => i.group === "yesterday");

    return (
        <DashboardLayout>
            <div className="mx-auto flex w-full max-w-6xl gap-8">
                <div className="flex-1 w-full min-w-0">
                    <header className="mb-6 rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(circle,var(--app-success-soft)_0%,transparent_70%)] opacity-20 pointer-events-none rounded-full blur-[30px] translate-x-1/4 -translate-y-1/4" />
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold text-[var(--app-text)] flex items-center gap-3">
                                Comms Relay
                            </h1>
                            <p className="mt-1 text-sm font-medium text-[var(--app-muted)]">
                                Mission critical updates and network pings
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => markAllMutation.mutate()}
                            disabled={markAllMutation.isPending || items.length === 0}
                            className="relative z-10 font-bold border-[var(--app-line)] text-[var(--app-muted)] hover:text-white hover:bg-[var(--app-surface-soft)] gap-2 shadow-sm"
                        >
                            <CheckCheck size={16} className="text-[var(--app-success)]" /> Ack All
                        </Button>
                    </header>

                    <div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn("shrink-0 rounded-[12px] px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all", activeTab === tab.id ? "bg-[var(--app-primary)] text-white shadow-glow" : "app-glass border border-[var(--app-line)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-text-soft)]")}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {query.isLoading ? (
                        <div className="flex justify-center py-20"><Spinner size={32} className="text-[var(--app-primary)]" /></div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[var(--app-line)] bg-[var(--app-surface-soft)] mb-6 shadow-sm">
                                <Bell size={32} className="text-[var(--app-muted)]" />
                            </div>
                            <h3 className="text-xl font-extrabold text-[var(--app-text)]">Silence on the network</h3>
                            <p className="text-sm font-medium text-[var(--app-muted)] mt-2">All incoming transmissions have been processed.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {[ { label: "Current Cycle", data: today }, { label: "Previous Cycle", data: yesterday } ].map((section) => section.data.length > 0 && (
                                <section key={section.label}>
                                    <h2 className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--app-muted)] pl-2">{section.label}</h2>
                                    <motion.div variants={staggerList} initial="hidden" animate="show" className="space-y-3">
                                        {section.data.map((item) => (
                                            <motion.article
                                                key={item.id}
                                                variants={fadeUp}
                                                className={cn(
                                                    "rounded-[20px] border p-4 transition-all group flex flex-col sm:flex-row gap-4",
                                                    item.unread
                                                        ? "border-[var(--app-primary-soft)] bg-[var(--app-primary)]/5 shadow-[0_0_15px_var(--app-primary-soft)]"
                                                        : "border-[var(--app-line)] bg-[var(--app-surface)] opacity-80"
                                                )}
                                            >
                                                <div className="flex flex-1 items-start gap-4">
                                                    <div className="relative shrink-0 pt-1">
                                                        <Avatar name={item.name} className="h-10 w-10 border-2 border-[var(--app-surface)] shadow-md" />
                                                        {item.unread && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[var(--app-primary)] border-2 border-[var(--app-surface)]" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em]",
                                                                    item.unread
                                                                        ? "bg-[var(--app-primary)]/15 text-[var(--app-primary)]"
                                                                        : "bg-[var(--app-surface-soft)] text-[var(--app-muted)]"
                                                                )}
                                                            >
                                                                {item.unread ? "Unread" : "Read"}
                                                            </span>
                                                            {!item.unread ? (
                                                                <span className="text-[11px] font-semibold text-[var(--app-muted)]">
                                                                    Already seen
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <p className="text-[0.95rem] leading-relaxed text-[var(--app-text-soft)]">
                                                            <span className="font-extrabold text-[var(--app-text)] block sm:inline">{item.name}</span> {item.message}
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            <Button size="sm" onClick={() => handlePrimaryAction(item)} disabled={respondConnectionMutation.isPending} className="h-8 rounded-lg text-xs font-bold shadow-sm">
                                                                {item.actionLabel}
                                                            </Button>
                                                            {item.secondaryAction && (
                                                                <Button size="sm" variant="outline" onClick={() => handleSecondaryAction(item)} disabled={respondConnectionMutation.isPending} className="h-8 rounded-lg text-xs font-bold border-[var(--app-line)] text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]">
                                                                    {item.secondaryAction}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-start sm:items-center justify-between sm:justify-end sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-[var(--app-line)] pt-3 sm:pt-0 sm:pl-4">
                                                    <span className="text-[10px] font-bold tracking-widest text-[var(--app-muted)] uppercase">{item.time}</span>
                                                    <button onClick={() => handleDismiss(item)} className="p-1.5 rounded-md text-[var(--app-muted)] hover:text-white hover:bg-[var(--app-surface-soft)] transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </motion.article>
                                        ))}
                                    </motion.div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                <aside className="hidden w-[360px] xl:block space-y-6">
                    <div className="app-card border-[var(--app-line)] p-6 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--app-primary)]/10 rounded-full blur-[30px]" />
                        <h3 className="text-sm font-extrabold uppercase tracking-widest text-[var(--app-text)] relative z-10">Network Analytics</h3>
                        <div className="mt-5 space-y-4 relative z-10 relative">
                            {[
                                { l: "Profile Impressions", v: "+15%", c: "text-[var(--app-success)]" },
                                { l: "New Endorsements", v: "3 Nodes", c: "text-[var(--app-primary)]" },
                                { l: "Signal Reach", v: "1.4k Units", c: "text-[var(--app-text)]" }
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center bg-[var(--app-surface-soft)] rounded-xl p-3 border border-[var(--app-line)]">
                                    <span className="text-xs font-bold text-[var(--app-muted)] uppercase tracking-wider">{stat.l}</span>
                                    <span className={cn("text-sm font-extrabold", stat.c)}>{stat.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="app-card border border-[var(--app-secondary)]/30 bg-gradient-to-br from-[var(--app-secondary-strong)]/40 to-[var(--app-surface)] p-6 shadow-glow relative overflow-hidden">
                        <h3 className="text-xl font-extrabold text-[#e879f9] flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#f0abfc] shadow-[0_0_10px_#f0abfc] animate-pulse" />
                            Tactical Advice
                        </h3>
                        <p className="mt-3 text-[0.85rem] leading-relaxed text-[var(--app-text-soft)] font-medium">
                            Endorsing peer capabilities increases inbound traffic to your profile by approx 42% per standard cycle. Maintain network activity.
                        </p>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
