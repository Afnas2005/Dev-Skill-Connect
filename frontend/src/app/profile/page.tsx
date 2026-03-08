"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    Bell,
    Code2,
    Compass,
    House,
    Mail,
    MessageSquare,
    Phone,
    Settings,
    User,
    UserRoundPen,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { getMyProfile } from "@/services/profileServices";

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House },
    { href: "/profile", label: "My Profile", icon: User, active: true },
    { href: "/skills", label: "My Skills", icon: Code2 },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

const tabs = ["Overview", "Projects", "Skills", "Experience", "Settings"];

const projects = [
    {
        name: "SaaS Analytics Dashboard",
        description: "Real-time data visualization platform for product and growth teams.",
        tags: ["NEXT.JS", "TAILWIND", "RECHARTS"],
        gradient: "from-slate-300/50 via-slate-200/30 to-slate-500/30",
    },
    {
        name: "Indigo Theme Engine",
        description: "A customizable CSS-in-JS theming engine for large scale design systems.",
        tags: ["TYPESCRIPT", "SCSS", "STORYBOOK"],
        gradient: "from-slate-700/70 via-slate-600/40 to-slate-800/70",
    },
];

const fallbackSkills = [
    { name: "React & Next.js", pct: 95 },
    { name: "TypeScript", pct: 90 },
    { name: "Node.js / Express", pct: 85 },
    { name: "PostgreSQL / MongoDB", pct: 80 },
    { name: "AWS & Docker", pct: 75 },
    { name: "UI Design (Figma)", pct: 70 },
];

function levelToPercent(level?: string) {
    if (level === "advanced") return 90;
    if (level === "intermediate") return 75;
    return 60;
}

export default function MyProfilePage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getMyProfile,
    });
    const user = useAuthStore((state) => state.user);
    const profile = data?.data?.profile;
    const skills = data?.data?.skills || [];
    const topSkills = skills.slice(0, 6);
    const skillRows =
        topSkills.length > 0
            ? topSkills.map((skill) => ({
                  id: skill._id,
                  name: skill.skillName,
                  pct: levelToPercent(skill.level),
              }))
            : fallbackSkills.map((skill) => ({
                  id: skill.name,
                  name: skill.name,
                  pct: skill.pct,
              }));
    const displayName = profile?.name || user?.name || "Alex Rivera";

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
                                <Avatar name={displayName} src={profile?.profileImage || user?.profileImage} />
                                <div>
                                    <p className="text-sm font-semibold">{displayName}</p>
                                    <p className="text-xs text-[#64748b]">
                                        @{(profile?.email || user?.email || "alex_fullstack").split("@")[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <main className="no-scrollbar h-screen w-full flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 md:p-6">
                        <div className="mx-auto w-full max-w-[900px]">
                        <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder="Search developers, projects..."
                                    className="h-10 w-full rounded-xl border border-[#1e2f4f] bg-[#0a1020] px-4 text-sm text-[#dbeafe] placeholder:text-[#7084a8] focus:border-[#2563eb] focus:outline-none md:max-w-[520px]"
                                />
                            </div>
                            <Link href="/posts/create">
                                <Button className="h-10 rounded-xl bg-[#1d4ed8] px-6 text-sm font-semibold text-white hover:bg-[#1e40af]">
                                    Post a project
                                </Button>
                            </Link>
                        </header>

                        {isLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-56 w-full bg-[#0f172a]" />
                                <Skeleton className="h-64 w-full bg-[#0f172a]" />
                            </div>
                        ) : isError || !profile ? (
                            <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                Failed to load profile.
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <section className="rounded-2xl border border-[#d6deea] bg-[#f3f5f8] p-3 shadow-[0_10px_30px_rgba(15,23,42,0.25)]">
                                    <div
                                        className="relative h-[260px] overflow-hidden rounded-xl border border-[#b8c5d8] bg-cover bg-center"
                                        style={
                                            profile.backgroundImage
                                                ? { backgroundImage: `url(${profile.backgroundImage})` }
                                                : {
                                                      backgroundImage:
                                                          "linear-gradient(135deg,#0f172a 0%,#1d4ed8 45%,#22d3ee 100%)",
                                                  }
                                        }
                                    >
                                        <div className="absolute inset-0 bg-black/20" />
                                        {!profile.backgroundImage ? (
                                            <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/85">
                                                No cover image yet. Add one from Edit Profile.
                                            </div>
                                        ) : null}
                                        <Link
                                            href="/profile/edit"
                                            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#111827] transition hover:bg-white"
                                            aria-label="Edit profile cover"
                                        >
                                            <UserRoundPen size={16} />
                                        </Link>
                                    </div>

                                    <div className="relative px-4 pb-4 pt-3 md:px-6">
                                        <div className="-mt-24 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                            <div className="flex items-end gap-4">
                                                <Avatar
                                                    name={displayName}
                                                    src={profile.profileImage}
                                                    className="h-44 w-44 border-4 border-white shadow-lg"
                                                />
                                                <div className="pb-2">
                                                    <h1 className="text-5xl font-semibold leading-none text-[#0f172a]">
                                                        {displayName}
                                                    </h1>
                                                    <p className="mt-2 text-base leading-tight text-[#334155]">
                                                        {profile.professionalTitle || "Full Stack Developer"}
                                                    </p>
                                                    <p className="mt-1 text-sm text-[#64748b]">
                                                        {profile.bio ||
                                                            "Software Engineer focused on modern full stack applications."}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/profile/edit">
                                                <Button
                                                    variant="outline"
                                                    className="h-10 rounded-lg border-[#94a3b8] bg-white px-5 text-sm font-semibold text-[#0f172a] hover:bg-[#e2e8f0]"
                                                >
                                                    <UserRoundPen size={15} className="mr-2" />
                                                    Edit Profile
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </section>

                                <div className="rounded-2xl border border-[#1a365f] bg-[#1d2a43] px-4 pt-3">
                                    <div className="no-scrollbar flex gap-4 overflow-x-auto border-b border-[#1e2f4f] pb-3 text-sm">
                                        {tabs.map((tab, index) => (
                                            <button
                                                key={tab}
                                                type="button"
                                                className={cn(
                                                    "!rounded-none !bg-transparent !shadow-none whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors",
                                                    index === 0
                                                        ? "border-[#2563eb] text-[#60a5fa]"
                                                        : "border-transparent text-[#7b93b9] hover:text-[#dbeafe]"
                                                )}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <section className="grid gap-4 xl:grid-cols-[300px_1fr]">
                                    <div className="space-y-4">
                                        <article className="rounded-2xl border border-[#132849] bg-[#060f23] p-5">
                                            <h2 className="mb-3 text-3xl font-semibold text-white">Personal Bio</h2>
                                            <p className="text-sm leading-8 text-[#9bb0cf]">
                                                {profile.bio ||
                                                    "Passionate software engineer with experience building scalable web applications and cloud-first products."}
                                            </p>
                                        </article>

                                        <article className="rounded-2xl border border-[#132849] bg-[#060f23] p-5">
                                            <h2 className="mb-4 text-3xl font-semibold text-white">
                                                Contact Information
                                            </h2>
                                            <div className="space-y-4 text-sm text-[#aac0dd]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-[#0f1f3a] p-1.5">
                                                        <Mail size={13} className="text-[#3b82f6]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-[#5b78a3]">Email</p>
                                                        <p>{profile.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 rounded-md bg-[#0f1f3a] p-1.5">
                                                        <Phone size={13} className="text-[#3b82f6]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-widest text-[#5b78a3]">Phone</p>
                                                        <p>+1 (555) 000-1234</p>
                                                    </div>
                                                </div>
                                                <div className="pl-10">
                                                    <p className="text-[10px] uppercase tracking-widest text-[#5b78a3]">Timezone</p>
                                                    <p className="text-[#c8d5ec]">{profile.location || "PST (UTC-8)"}</p>
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    <div className="space-y-4">
                                        <article className="rounded-2xl border border-[#132849] bg-[#060f23] p-5">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h2 className="text-xl font-semibold text-white">
                                                    My Technical Skills
                                                </h2>
                                                <Link
                                                    href="/skills"
                                                    className="text-sm text-[#3b82f6] hover:text-[#60a5fa]"
                                                >
                                                    Add New
                                                </Link>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {skillRows.map((skill) => (
                                                    <div key={skill.id}>
                                                        <div className="mb-2 flex items-center justify-between text-sm">
                                                            <span className="text-[#dbeafe]">{skill.name}</span>
                                                            <span className="text-[#3b82f6]">{skill.pct}%</span>
                                                        </div>
                                                        <div className="h-1.5 rounded-full bg-[#1e293b]">
                                                            <div
                                                                style={{ width: `${skill.pct}%` }}
                                                                className="h-1.5 rounded-full bg-[#1d4ed8]"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </article>

                                        <article className="rounded-2xl border border-[#132849] bg-[#060f23] p-5">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h2 className="text-xl font-semibold text-white">
                                                    Recent Projects
                                                </h2>
                                                <button
                                                    type="button"
                                                    className="text-sm text-[#3b82f6] hover:text-[#60a5fa]"
                                                >
                                                    View All
                                                </button>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {projects.map((project) => (
                                                    <div
                                                        key={project.name}
                                                        className="rounded-xl border border-[#1d2f50] bg-[#091327] p-3"
                                                    >
                                                        <div
                                                            className={cn(
                                                                "mb-3 h-28 rounded-lg bg-gradient-to-br",
                                                                project.gradient
                                                            )}
                                                        />
                                                        <h3 className="text-lg font-semibold text-[#e2e8f0]">
                                                            {project.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-[#8aa0c2]">
                                                            {project.description}
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {project.tags.map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded-md bg-[#0f1b33] px-2 py-1 text-[11px] text-[#b3c5e4]"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </article>
                                    </div>
                                </section>

                                <footer className="mt-10 flex items-center justify-between border-t border-[#132849] py-4 text-xs text-[#5f7698]">
                                    <p>© 2024 DevConnect Inc.</p>
                                    <div className="flex gap-5">
                                        <span>Privacy Policy</span>
                                        <span>Terms of Service</span>
                                        <span>Support</span>
                                    </div>
                                </footer>
                            </div>
                        )}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
