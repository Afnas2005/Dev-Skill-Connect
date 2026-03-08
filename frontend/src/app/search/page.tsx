"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Code2,
    Compass,
    House,
    MapPin,
    MessageSquare,
    Search,
    Settings,
    User,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/hooks/useDebounce";
import { searchSkills, sendConnectionRequest } from "@/services/searchServices";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import type { SkillLevel } from "@/types/domain";

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/skills", label: "My Skills", icon: Code2 },
    { href: "/search", label: "Explore", icon: Compass, active: true },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

const levelOptions: Array<{ value: SkillLevel | "all"; label: string }> = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
];

const pageSlots = [1, 2, 3, "...", 12];

export default function SearchPage() {
    const [skill, setSkill] = useState("");
    const [level, setLevel] = useState<SkillLevel | "all">("all");
    const debouncedSkill = useDebounce(skill, 350);
    const user = useAuthStore((state) => state.user);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();

    const searchParams = useMemo(
        () => ({ skill: debouncedSkill.trim(), level }),
        [debouncedSkill, level]
    );

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
            pushToast({
                type: "success",
                title: "Connection request sent",
            });
        },
        onError: (error: unknown) => {
            const message =
                typeof error === "object" && error && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Could not send request";
            pushToast({
                type: "error",
                title: message,
            });
        },
    });

    const results = query.data?.data || [];
    const activeSkillChips = [
        ...(debouncedSkill
            ? debouncedSkill
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, 3)
            : []),
        ...(level !== "all" ? [level] : []),
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

                    <main className="no-scrollbar h-screen w-full flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 md:p-6">
                        <div className="mx-auto w-full max-w-[900px]">
                            <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div className="relative w-full md:max-w-[520px]">
                                    <Search
                                        size={16}
                                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#617ca5]"
                                    />
                                    <input
                                        value={skill}
                                        onChange={(event) => setSkill(event.target.value)}
                                        placeholder="Search skills (e.g. React, Node.js)"
                                        className="h-10 w-full rounded-xl border border-[#1e2f4f] bg-[#0a1020] pl-9 pr-3 text-sm text-[#dbeafe] placeholder:text-[#7084a8] focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>
                                <select
                                    value={level}
                                    onChange={(event) => setLevel(event.target.value as SkillLevel | "all")}
                                    className="h-10 rounded-xl border border-[#1e2f4f] bg-[#0a1020] px-3 text-sm text-[#dbeafe] focus:border-[#2563eb] focus:outline-none"
                                >
                                    {levelOptions.map((item) => (
                                        <option key={item.value} value={item.value}>
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </header>

                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl font-semibold text-white">Full-stack Developers</h1>
                                    <p className="mt-1 text-sm text-[#8aa0c2]">
                                        Showing {results.length} experts matching your criteria
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-[#94a9c9]">
                                        Skills:
                                    </span>
                                    {activeSkillChips.length > 0 ? (
                                        activeSkillChips.map((chip) => (
                                            <span
                                                key={chip}
                                                className="rounded-full bg-[#0d3463] px-3 py-1 text-xs font-semibold text-[#67b0ff]"
                                            >
                                                {chip}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="rounded-full bg-[#0f1f3a] px-3 py-1 text-xs text-[#7f98be]">
                                            Any
                                        </span>
                                    )}
                                </div>
                            </div>

                            {query.isLoading ? (
                                <div className="flex items-center gap-2 py-8 text-[#9bb0cf]">
                                    <Spinner size={18} />
                                    Searching...
                                </div>
                            ) : query.isError ? (
                                <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                    Search failed. Please try again.
                                </div>
                            ) : results.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-[#2b4972] bg-[#061227] p-8 text-center text-[#7f98be]">
                                    No matching developers found.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {results.map((entry) => (
                                        <article
                                            key={entry.user.id}
                                            className="rounded-2xl border border-[#1a365f] bg-[#0b162e] p-4"
                                        >
                                            <div className="mb-3 flex items-start gap-3">
                                                <Avatar
                                                    name={entry.user.name || entry.user.email}
                                                    src={entry.user.profileImage}
                                                    className="h-14 w-14"
                                                />
                                                <div className="min-w-0">
                                                    <h2 className="truncate text-2xl font-semibold text-white">
                                                        {entry.user.name || "Unnamed developer"}
                                                    </h2>
                                                    <p className="truncate text-sm text-[#8aa0c2]">
                                                        {entry.skills[0]?.skillName || "Full-stack Developer"}
                                                    </p>
                                                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#7690b4]">
                                                        <MapPin size={12} />
                                                        {entry.user.location || "Location not added"}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="line-clamp-2 min-h-[48px] text-sm text-[#9eb2cf]">
                                                {entry.user.bio ||
                                                    "Passionate about building scalable cloud architectures and intuitive user experiences."}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {entry.skills.slice(0, 3).map((item) => (
                                                    <span
                                                        key={item._id}
                                                        className="rounded-md bg-[#122744] px-2 py-1 text-[11px] font-semibold uppercase text-[#9db8dd]"
                                                    >
                                                        {item.skillName}
                                                    </span>
                                                ))}
                                                {entry.skills.length === 0 ? (
                                                    <span className="rounded-md bg-[#122744] px-2 py-1 text-[11px] font-semibold uppercase text-[#9db8dd]">
                                                        NEW USER
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                                <Link
                                                    href={`/profile/${entry.user.id}`}
                                                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2280e7] text-base font-semibold text-white hover:bg-[#1b70cc]"
                                                >
                                                    View Profile
                                                </Link>
                                                <Button
                                                    type="button"
                                                    disabled={
                                                        connectMutation.isPending ||
                                                        entry.connectionStatus !== "none" ||
                                                        entry.user.id === user?.id
                                                    }
                                                    onClick={() =>
                                                        connectMutation.mutate(String(entry.user.id))
                                                    }
                                                    className={cn(
                                                        "h-10 rounded-xl text-base font-semibold",
                                                        entry.connectionStatus === "connected"
                                                            ? "bg-emerald-600 text-white hover:bg-emerald-600"
                                                            : entry.connectionStatus === "pending"
                                                              ? "bg-[#435a84] text-[#c7d7f3] hover:bg-[#435a84]"
                                                              : "bg-[#2f6df6] text-white hover:bg-[#2457c7]"
                                                    )}
                                                >
                                                    {entry.user.id === user?.id
                                                        ? "You"
                                                        : entry.connectionStatus === "connected"
                                                          ? "Connected"
                                                          : entry.connectionStatus === "pending"
                                                            ? "Requested"
                                                            : "Connect"}
                                                </Button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            <footer className="mt-8 border-t border-[#16355d] pt-6">
                                <div className="mb-5 flex items-center justify-center gap-2 text-sm text-[#9cb1cd]">
                                    <button
                                        type="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#274a7c] bg-[#091a33] hover:bg-[#112748]"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {pageSlots.map((page) => (
                                        <button
                                            key={String(page)}
                                            type="button"
                                            className={cn(
                                                "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2",
                                                page === 1
                                                    ? "bg-[#2484ea] font-semibold text-white"
                                                    : "text-[#b0c3de] hover:bg-[#0e2241]"
                                            )}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#274a7c] bg-[#091a33] hover:bg-[#112748]"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <p className="text-center text-sm text-[#6e86aa]">
                                    © 2024 DevSkill. Connecting technical talent with opportunities
                                    worldwide.
                                </p>
                                <div className="mt-3 flex items-center justify-center gap-5 text-xs text-[#6e86aa]">
                                    <span>Privacy Policy</span>
                                    <span>Terms of Service</span>
                                    <span>Contact Support</span>
                                </div>
                            </footer>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}


