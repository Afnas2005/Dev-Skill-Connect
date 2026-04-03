"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, UserRoundPen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { getMyProfile } from "@/services/profileServices";
import { motion } from "framer-motion";

const projects = [
    {
        name: "SaaS Analytics Engine",
        description: "Real-time telemetry and data visualization platform for high-scale products.",
        tags: ["NEXT.JS", "TAILWIND", "WEBGL"],
        gradient: "from-[var(--app-primary-strong)] to-[#0ea5e9]",
    },
    {
        name: "Quantum UI System",
        description: "A highly intricate, glassmorphic design system tailored for modern web apps.",
        tags: ["TYPESCRIPT", "FRAMER-MOTION", "STORYBOOK"],
        gradient: "from-[var(--app-secondary)] to-[#a855f7]",
    },
];

const fallbackSkills = [
    { name: "React & Next.js Ecosystem", pct: 95 },
    { name: "TypeScript Mastery", pct: 90 },
    { name: "Node.js / Express Backend", pct: 85 },
    { name: "PostgreSQL Architecture", pct: 80 },
    { name: "Docker & Cloud Deployments", pct: 75 },
    { name: "UI/UX Aesthetic Design", pct: 70 },
];

function levelToPercent(level?: string) {
    if (level === "advanced") return 90;
    if (level === "intermediate") return 75;
    return 60;
}

const staggerList = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

export default function MyProfilePage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["profile", "me"],
        queryFn: getMyProfile,
    });
    const user = useAuthStore((state) => state.user);
    const profile = data?.data?.profile;
    const skills = data?.data?.skills || [];
    const topSkills = skills.slice(0, 6);
    
    const skillRows = topSkills.length > 0
        ? topSkills.map((s) => ({ id: s._id, name: s.skillName, pct: levelToPercent(s.level) }))
        : fallbackSkills.map((s) => ({ id: s.name, name: s.name, pct: s.pct }));
        
    const displayName = profile?.name || user?.name || "Senior Engineer";

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-5xl">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[var(--app-text)]">Command Center</h1>
                        <p className="text-sm font-medium text-[var(--app-muted)] mt-1">Your public identity and capabilities matrix.</p>
                    </div>
                    <Link href="/posts/create">
                        <Button className="h-10 px-6 shadow-glow font-bold">Transmit Project</Button>
                    </Link>
                </header>

                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-[250px] w-full rounded-3xl" />
                        <Skeleton className="h-[300px] w-full rounded-3xl" />
                    </div>
                ) : isError || !profile ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm font-medium text-red-400">
                        System Failure: Profile module offline.
                    </div>
                ) : (
                    <motion.div variants={staggerList} initial="hidden" animate="show" className="space-y-6">
                        {/* Profile Banner */}
                        <motion.section variants={fadeUp} className="overflow-hidden rounded-[28px] app-card relative isolate border-[var(--app-line)]">
                            <div
                                className="relative h-[220px] bg-cover bg-center"
                                style={
                                    profile.backgroundImage
                                        ? { backgroundImage: `url(${profile.backgroundImage})` }
                                        : { backgroundImage: "linear-gradient(135deg, var(--app-primary-strong) 0%, #1e1b4b 50%, var(--app-secondary-strong) 100%)" }
                                }
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-surface)] to-transparent" />
                            </div>
                            
                            <div className="relative border-t border-[var(--app-line)] bg-[var(--app-surface)] p-6 pt-0 backdrop-blur-3xl">
                                <div className="-mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex items-end gap-5">
                                        <motion.div whileHover={{ scale: 1.05, rotate: 2 }} className="rounded-2xl border-[6px] border-[var(--app-surface)] bg-black shadow-glow overflow-hidden z-20">
                                            <Avatar
                                                name={displayName}
                                                src={profile.profileImage}
                                                className="h-[120px] w-[120px] rounded-none"
                                            />
                                        </motion.div>
                                        <div className="pb-2">
                                            <h1 className="text-3xl font-extrabold text-[var(--app-text)] drop-shadow-lg">{displayName}</h1>
                                            <p className="mt-1 text-sm font-bold tracking-wide text-gradient-primary uppercase">
                                                {profile.professionalTitle || "Full Stack Architect"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pb-2 pt-4 sm:pt-0">
                                        <Link href="/profile/edit">
                                            <Button variant="outline" className="rounded-xl px-5 border-[var(--app-line)] app-glass text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]">
                                                <UserRoundPen size={16} className="mr-2 text-[var(--app-primary)]" /> Configure
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
                            {/* Left Column: Bio & Contact */}
                            <div className="space-y-6">
                                <motion.article variants={fadeUp} className="app-card p-6 border-[var(--app-line)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--app-primary-soft)] rounded-bl-full pointer-events-none blur-[20px] opacity-30 group-hover:opacity-70 transition-opacity" />
                                    <h2 className="mb-4 text-xl font-extrabold text-[var(--app-text)]">System Bio</h2>
                                    <p className="text-[0.95rem] leading-relaxed text-[var(--app-text-soft)] relative z-10">
                                        {profile.bio || "Engineer operating at the edge of the web. Specialized in building high-performance, resilient, and beautifully crafted software systems."}
                                    </p>
                                </motion.article>

                                <motion.article variants={fadeUp} className="app-card p-6 border-[var(--app-line)]">
                                    <h2 className="mb-6 text-xl font-extrabold text-[var(--app-text)]">Comm Links</h2>
                                    <div className="space-y-5 text-sm">
                                        <div className="flex items-center gap-4 group cursor-pointer hover:bg-[var(--app-surface-soft)] p-2 rounded-xl transition-colors -ml-2">
                                            <div className="app-glass rounded-lg border border-[var(--app-line)] p-2 text-[var(--app-primary)] group-hover:scale-110 transition-transform shadow-sm">
                                                <Mail size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">Encrypted Mail</p>
                                                <p className="font-medium text-[var(--app-text)]">{profile.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group cursor-pointer hover:bg-[var(--app-surface-soft)] p-2 rounded-xl transition-colors -ml-2">
                                            <div className="app-glass rounded-lg border border-[var(--app-line)] p-2 text-[var(--app-secondary)] group-hover:scale-110 transition-transform shadow-sm">
                                                <Phone size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">Voice Comm</p>
                                                <p className="font-medium text-[var(--app-text)]">+1 (555) 000-0000</p>
                                            </div>
                                        </div>
                                        <div className="ml-14">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--app-muted)]">Origin</p>
                                            <p className="font-medium text-[var(--app-text)]">{profile.location || "Earth (Sector 4)"}</p>
                                        </div>
                                    </div>
                                </motion.article>
                            </div>

                            {/* Right Column: Skills & Projects */}
                            <div className="space-y-6">
                                <motion.article variants={fadeUp} className="app-card p-6 border-[var(--app-line)] overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--app-primary-soft)_0%,transparent_70%)] opacity-20 pointer-events-none rounded-full blur-[50px] translate-x-1/2 -translate-y-1/2" />
                                    <div className="mb-6 flex items-center justify-between relative z-10">
                                        <h2 className="text-xl font-extrabold text-[var(--app-text)]">Capability Matrix</h2>
                                        <Link href="/skills">
                                            <Button variant="outline" size="sm" className="h-8 rounded-[8px] border-[var(--app-primary-soft)] text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)] gap-2">
                                                Upgrade
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="space-y-4 relative z-10">
                                        {skillRows.map((skill, i) => (
                                            <div key={skill.id} className="relative">
                                                <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                                                    <span className="text-[var(--app-text)] uppercase tracking-wider">{skill.name}</span>
                                                    <span className="text-[var(--app-primary)]">{skill.pct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-[var(--app-surface-soft)] border border-[var(--app-line)] p-[1px] overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#38bdf8] shadow-[0_0_10px_var(--app-primary-glow)]"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${skill.pct}%` }}
                                                        transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.article>

                                <motion.article variants={fadeUp} className="app-card p-6 border-[var(--app-line)]">
                                    <div className="mb-6 flex items-center justify-between">
                                        <h2 className="text-xl font-extrabold text-[var(--app-text)] flex items-center gap-2">
                                            Recent Deployments
                                        </h2>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-[var(--app-muted)] hover:text-[var(--app-text)]">View All Log</Button>
                                    </div>
                                    <div className="grid gap-5 md:grid-cols-2">
                                        {projects.map((project, i) => (
                                            <motion.div
                                                key={project.name}
                                                whileHover={{ y: -5 }}
                                                className="group rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] p-4 shadow-sm hover:shadow-glow transition-all hover:border-[var(--app-primary-soft)] cursor-pointer"
                                            >
                                                <div className={cn("mb-4 h-32 rounded-xl bg-gradient-to-br shadow-inner border border-white/10 opacity-80 group-hover:opacity-100 transition-opacity", project.gradient)} />
                                                <h3 className="text-base font-extrabold text-[var(--app-text)] group-hover:text-gradient-primary">{project.name}</h3>
                                                <p className="mt-2 text-[0.85rem] text-[var(--app-text-soft)] line-clamp-2">
                                                    {project.description}
                                                </p>
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {project.tags.map((tag) => (
                                                        <span key={tag} className="rounded-md border border-[var(--app-line)] bg-[var(--app-surface-strong)] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--app-muted)] group-hover:text-[var(--app-primary)] group-hover:border-[var(--app-primary-soft)] transition-colors">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.article>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
}
