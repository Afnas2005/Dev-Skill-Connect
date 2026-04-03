"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { searchSkills, sendConnectionRequest, startDirectConversation } from "@/services/searchServices";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/types/domain";

const levelOptions: Array<{ value: SkillLevel | "all"; label: string }> = [
    { value: "all", label: "All Masteries" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const pageSlots = [1, 2, 3, "...", 12];

const staggerList = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function SearchPage() {
    const [skill, setSkill] = useState("");
    const [level, setLevel] = useState<SkillLevel | "all">("all");
    const debouncedSkill = useDebounce(skill, 400);
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();

    const searchParams = useMemo(() => ({ skill: debouncedSkill.trim(), level }), [debouncedSkill, level]);

    const query = useQuery({
        queryKey: ["search", user?.id || "anonymous", searchParams.skill, searchParams.level],
        queryFn: () => searchSkills(searchParams),
        staleTime: 0,
        refetchOnMount: "always",
    });

    const connectMutation = useMutation({
        mutationFn: sendConnectionRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            pushToast({ type: "success", title: "Connection request transmitted" });
        },
        onError: (e: any) => pushToast({ type: "error", title: e?.message || "Could not send request" }),
    });

    const openChatMutation = useMutation({
        mutationFn: startDirectConversation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chat"] });
            pushToast({ type: "success", title: "Comm channel opened" });
        },
        onError: () => pushToast({ type: "error", title: "Could not open channel" }),
    });

    const results = query.data?.data || [];
    const activeSkillChips = [
        ...(debouncedSkill ? debouncedSkill.split(",").map((i) => i.trim()).filter(Boolean).slice(0, 3) : []),
        ...(level !== "all" ? [level] : []),
    ];

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-8 p-6 app-card border-[var(--app-line)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,var(--app-primary-soft)_0%,transparent_70%)] opacity-20 pointer-events-none rounded-full blur-[40px] translate-x-1/4 -translate-y-1/4" />
                    
                    <div className="relative z-10 w-full md:max-w-[480px]">
                        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-primary)]" />
                        <input
                            value={skill}
                            onChange={(e) => setSkill(e.target.value)}
                            placeholder="Query network (e.g. React, Node.js)"
                            className="h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] pl-12 pr-4 text-[0.95rem] font-medium text-[var(--app-text)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_var(--app-primary-soft)] focus:outline-none transition-all"
                        />
                    </div>
                    <div className="relative z-10 shrink-0">
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value as SkillLevel | "all")}
                            className="h-12 rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] px-4 text-sm font-medium text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none transition-all cursor-pointer appearance-none pr-10"
                        >
                            {levelOptions.map((item) => (
                                <option key={item.value} value={item.value} className="bg-[var(--app-surface)]">{item.label}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--app-muted)]">
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </header>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--app-text)]">Network Directory</h1>
                        <p className="mt-1 text-sm font-medium text-[var(--app-muted)]">
                            Found <span className="text-[var(--app-primary)] font-bold">{results.length}</span> operatives matching criteria
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">Filters:</span>
                        {activeSkillChips.length > 0 ? (
                            activeSkillChips.map((chip) => (
                                <span key={chip} className="rounded-lg bg-[var(--app-primary-soft)] border border-[var(--app-primary-glow)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--app-primary)]">
                                    {chip}
                                </span>
                            ))
                        ) : (
                            <span className="rounded-lg bg-[var(--app-surface-strong)] border border-[var(--app-line)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--app-text-soft)]">
                                Any
                            </span>
                        )}
                    </div>
                </div>

                {query.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Spinner size={32} className="text-[var(--app-primary)]" />
                        <span className="text-sm font-bold text-[var(--app-primary)] animate-pulse uppercase tracking-widest">Scanning Network...</span>
                    </div>
                ) : query.isError ? (
                    <div className="app-card border-red-500/30 bg-red-500/10 p-6 text-center text-red-400 font-bold tracking-wider uppercase text-sm">
                        Search query failed. Please retry.
                    </div>
                ) : results.length === 0 ? (
                    <div className="app-card py-20 text-center border-dashed border-2 flex flex-col items-center justify-center">
                        <Search size={48} className="text-[var(--app-muted)] mb-4 opacity-50" />
                        <p className="text-lg font-bold text-[var(--app-text-soft)]">No operatives found matching criteria.</p>
                        <p className="text-sm text-[var(--app-muted)] mt-1">Try broadening your search parameters.</p>
                    </div>
                ) : (
                    <motion.div variants={staggerList} initial="hidden" animate="show" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {results.map((entry) => (
                            <motion.article key={entry.user.id} variants={fadeUp} className="app-card p-5 group hover:border-[var(--app-primary-soft)] hover:shadow-glow transition-all">
                                <div className="mb-4 flex items-start gap-3">
                                    <Avatar name={entry.user.name || entry.user.email} src={entry.user.profileImage} className="h-12 w-12 border-2 border-[var(--app-surface)] shadow-lg" />
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-extrabold text-[var(--app-text)] group-hover:text-gradient-primary transition-all">
                                            {entry.user.name || "Operative"}
                                        </h2>
                                        <p className="truncate text-xs font-medium text-[var(--app-primary)] tracking-wide">
                                            {entry.skills[0]?.skillName || "Engineer"}
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--app-muted)]">
                                            <MapPin size={10} /> {entry.user.location || "Unknown Origin"}
                                        </p>
                                    </div>
                                </div>

                                <p className="line-clamp-2 min-h-[40px] text-[0.85rem] leading-relaxed text-[var(--app-text-soft)]">
                                    {entry.user.bio || "Systems engineer passionate about scalable architecture."}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-2 min-h-[50px] content-start">
                                    {entry.skills.slice(0, 3).map((item) => (
                                        <span key={item._id} className="rounded-md bg-[var(--app-surface-strong)] border border-[var(--app-line)] px-2 py-1 flex items-center text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)] group-hover:border-[var(--app-primary-soft)] transition-colors">
                                            {item.skillName}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-[var(--app-line)]">
                                    <Link href={`/profile/${entry.user.id}`}>
                                        <Button variant="outline" className="w-full text-xs font-bold border-[var(--app-line)] hover:bg-[var(--app-surface-soft)] text-[var(--app-text)]">
                                            View Data
                                        </Button>
                                    </Link>
                                    {entry.connectionStatus === "connected" ? (
                                        <Button disabled={openChatMutation.isPending} onClick={() => openChatMutation.mutate(String(entry.user.id))} className="w-full text-xs font-bold border border-[var(--app-success)] text-[var(--app-success)] bg-[var(--app-success)]/10 hover:bg-[var(--app-success)]/20 shadow-[0_0_10px_var(--app-success)]/20">
                                            Comm Link
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled={connectMutation.isPending || entry.connectionStatus !== "none" || entry.user.id === user?.id}
                                            onClick={() => connectMutation.mutate(String(entry.user.id))}
                                            variant={entry.connectionStatus === "pending" ? "outline" : "default"}
                                            className={cn("w-full text-xs font-bold", entry.connectionStatus === "pending" ? "border-dashed text-[var(--app-muted)]" : "")}
                                        >
                                            {entry.user.id === user?.id ? "Self" : entry.connectionStatus === "pending" ? "Requested" : "Connect"}
                                        </Button>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}

                {!query.isLoading && results.length > 0 && (
                    <footer className="mt-10 border-t border-[var(--app-line)] pt-8 pb-4">
                        <div className="mb-6 flex items-center justify-center gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-xl app-glass border border-[var(--app-line)] text-[var(--app-muted)] hover:text-[var(--app-primary)] hover:border-[var(--app-primary-soft)] transition-all">
                                <ChevronLeft size={16} />
                            </button>
                            {pageSlots.map((page, idx) => (
                                <button key={idx} className={cn("flex h-10 items-center justify-center rounded-xl px-4 text-xs font-bold transition-all", page === 1 ? "bg-[var(--app-primary)] text-white shadow-glow" : "app-glass border border-[var(--app-line)] text-[var(--app-muted)] hover:text-[var(--app-text)] hover:border-[var(--app-text-soft)]")}>
                                    {page}
                                </button>
                            ))}
                            <button className="flex h-10 w-10 items-center justify-center rounded-xl app-glass border border-[var(--app-line)] text-[var(--app-muted)] hover:text-[var(--app-primary)] hover:border-[var(--app-primary-soft)] transition-all">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </DashboardLayout>
    );
}

function ChevronDown({ size, className }: { size: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
}
