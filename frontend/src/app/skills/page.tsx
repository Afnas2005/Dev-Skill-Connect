"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
    Bell,
    ChevronDown,
    Code2,
    Compass,
    Download,
    FileText,
    Grid3X3,
    House,
    MessageSquare,
    Plus,
    Search,
    Settings,
    Share2,
    UploadCloud,
    User,
    X,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EditSkillModal } from "@/components/skills/edit-skill-modal";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { createSkill, deleteSkill, getMySkills, updateSkill } from "@/services/skillServices";
import { uploadSkillAttachments } from "@/services/uploadServices";
import type { Skill, SkillPayload } from "@/types/domain";

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/skills", label: "My Skills", icon: Code2, active: true },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

const filters = ["All Skills", "Frontend", "Backend", "DevOps", "Systems Design"];

function levelToPercent(level: Skill["level"]) {
    if (level === "advanced") return 92;
    if (level === "intermediate") return 76;
    return 62;
}

export default function SkillsPage() {
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addSkillName, setAddSkillName] = useState("");
    const [addProficiency, setAddProficiency] = useState(7);
    const [addDescription, setAddDescription] = useState("");
    const [addFiles, setAddFiles] = useState<File[]>([]);
    const queryClient = useQueryClient();
    const pushToast = useToastStore((state) => state.pushToast);
    const user = useAuthStore((state) => state.user);

    const skillsQuery = useQuery({
        queryKey: ["skills", "me"],
        queryFn: getMySkills,
    });

    const addMutation = useMutation({
        mutationFn: async ({
            payload,
            files,
        }: {
            payload: SkillPayload;
            files: File[];
        }) => {
            let attachments = payload.attachments || [];
            if (files.length > 0) {
                const upload = await uploadSkillAttachments(files);
                attachments = upload.data.urls;
            }

            return createSkill({
                ...payload,
                attachments,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", "me"] });
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
            setShowAddForm(false);
            resetAddForm();
            pushToast({
                type: "success",
                title: "Skill added",
            });
        },
        onError: () =>
            pushToast({
                type: "error",
                title: "Unable to add skill",
            }),
    });

    const editMutation = useMutation({
        mutationFn: async ({
            id,
            payload,
            files,
        }: {
            id: string;
            payload: SkillPayload;
            files: File[];
        }) => {
            let attachments = payload.attachments || [];
            if (files.length > 0) {
                const upload = await uploadSkillAttachments(files);
                attachments = [...attachments, ...upload.data.urls];
            }
            return updateSkill(id, { ...payload, attachments });
        },
        onSuccess: () => {
            setEditingSkill(null);
            queryClient.invalidateQueries({ queryKey: ["skills", "me"] });
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
            pushToast({
                type: "success",
                title: "Skill updated",
            });
        },
        onError: () =>
            pushToast({
                type: "error",
                title: "Unable to update skill",
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills", "me"] });
            queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
            pushToast({
                type: "success",
                title: "Skill deleted",
            });
        },
        onError: () =>
            pushToast({
                type: "error",
                title: "Unable to delete skill",
            }),
    });

    const skills = skillsQuery.data?.data || [];
    const mastery = skills.length
        ? Math.round(skills.reduce((acc, skill) => acc + levelToPercent(skill.level), 0) / skills.length)
        : 75;
    const frontendPct = skills.length ? Math.min(95, mastery + 8) : 85;
    const architecturePct = skills.length ? Math.max(65, mastery + 1) : 78;
    const infraPct = skills.length ? Math.max(55, mastery - 13) : 62;

    const proficiencyToLevel = (value: number): Skill["level"] => {
        if (value <= 3) return "beginner";
        if (value <= 7) return "intermediate";
        return "advanced";
    };

    const resetAddForm = () => {
        setAddSkillName("");
        setAddProficiency(7);
        setAddDescription("");
        setAddFiles([]);
    };

    const submitAddSkill = () => {
        const trimmedName = addSkillName.trim();
        if (!trimmedName) {
            pushToast({
                type: "error",
                title: "Skill name is required",
            });
            return;
        }

        addMutation.mutate({
            payload: {
                skillName: trimmedName,
                level: proficiencyToLevel(addProficiency),
                description: addDescription.trim(),
            },
            files: addFiles,
        });
    };

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

                    <main className="no-scrollbar h-screen w-full flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0">
                        <header className="sticky top-0 z-20 border-b border-[#132849] bg-[#040b1d]/95 px-6 py-3 backdrop-blur">
                            <div className="mx-auto flex w-full max-w-[900px] items-center justify-between gap-4">
                                <div className="relative w-full max-w-[540px]">
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#617ca5]"
                                    />
                                    <input
                                        placeholder="Search skills or colleagues..."
                                        className="h-10 w-full rounded-xl border border-[#1e2f4f] bg-[#0a1020] pl-9 pr-3 text-sm text-[#dbeafe] placeholder:text-[#7084a8] focus:border-[#2563eb] focus:outline-none"
                                    />
                                </div>
                                <div className="hidden items-center gap-4 md:flex">
                                    <button type="button" className="text-[#88a2c9] hover:text-white">
                                        <Share2 size={18} />
                                    </button>
                                    <button type="button" className="text-[#88a2c9] hover:text-white">
                                        <Settings size={18} />
                                    </button>
                                </div>
                            </div>
                        </header>

                        <div className="mx-auto w-full max-w-[900px] px-4 py-8 md:px-6">
                            <section className="mb-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-4">
                                <div>
                                    <h1 className="text-5xl font-semibold text-white">Technical Arsenal</h1>
                                    <p className="mt-2 text-xl text-[#8aa0c2]">
                                        Manage and showcase your professional technical proficiency.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="h-10 rounded-xl border-[#1d3b66] bg-[#0f1f39] text-[#a8c3e8] hover:bg-[#142b4d] hover:text-white"
                                    >
                                        <Share2 size={14} className="mr-2" />
                                        Share Profile
                                    </Button>
                                    <Button className="h-10 rounded-xl bg-[#2563eb] px-5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                                        <Download size={14} className="mr-2" />
                                        Export Resume
                                    </Button>
                                </div>
                            </section>

                            <div className="mb-6 flex flex-wrap gap-3">
                                {filters.map((label, index) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className={cn(
                                            "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium",
                                            index === 0
                                                ? "border-[#2563eb] bg-[#1d4ed8] text-white"
                                                : "border-[#1d3b66] bg-[#0c1730] text-[#9bb0cf] hover:border-[#2d4a73] hover:text-[#dce8fa]"
                                        )}
                                    >
                                        {index === 0 ? <Grid3X3 size={14} /> : null}
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {skillsQuery.isLoading ? (
                                <div className="flex items-center gap-2 text-[#9bb0cf]">
                                    <Spinner size={18} />
                                    Loading skills...
                                </div>
                            ) : skillsQuery.isError ? (
                                <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                    Failed to load skills.
                                </div>
                            ) : (
                                <>
                                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(true)}
                                            className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#274a7c] bg-[#040c1f] text-center hover:bg-[#08142a]"
                                        >
                                            <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0f2242] text-[#3b82f6]">
                                                <Plus size={30} />
                                            </span>
                                            <p className="text-3xl font-semibold text-white">Add New Skill</p>
                                            <p className="mt-2 text-sm text-[#728aaf]">Scale your profile</p>
                                        </button>

                                        {skills.map((skill) => {
                                            const pct = levelToPercent(skill.level);
                                            return (
                                                <article
                                                    key={skill._id}
                                                    className="rounded-2xl border border-[#1a365f] bg-[#0b162e] p-5"
                                                >
                                                    <div className="mb-4 flex items-start justify-between gap-3">
                                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[#0f2242] text-sm font-bold text-[#9fc2f8]">
                                                            {skill.skillName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingSkill(skill)}
                                                                className="rounded-md bg-[#122744] px-2 py-1 text-xs text-[#a9c6ec] hover:bg-[#1a365f]"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteMutation.mutate(skill._id)}
                                                                className="rounded-md bg-[#331726] px-2 py-1 text-xs text-[#f2b8c8] hover:bg-[#4b1f33]"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-3xl font-semibold text-white">
                                                        {skill.skillName}
                                                    </p>
                                                    <span className="mt-2 inline-flex rounded-md bg-[#0d3a30] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3ad09c]">
                                                        {skill.level}
                                                    </span>
                                                    <div className="mt-5">
                                                        <div className="mb-1 flex items-center justify-between text-sm">
                                                            <span className="text-[#7d95bb]">Proficiency</span>
                                                            <span className="text-[#53a2ff]">{pct}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-[#1c2e4e]">
                                                            <div
                                                                style={{ width: `${pct}%` }}
                                                                className="h-2 rounded-full bg-[#2f6df6]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <p className="mt-4 text-sm text-[#7d95bb]">
                                                        {skill.description || "Used in production projects."}
                                                    </p>
                                                </article>
                                            );
                                        })}
                                    </section>

                                    <section className="mt-6 rounded-2xl border border-[#1a365f] bg-[#0b162e] p-6">
                                        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
                                            <div>
                                                <h2 className="text-4xl font-semibold text-white">
                                                    Overall Proficiency
                                                </h2>
                                                <p className="mt-2 text-lg text-[#7f98be]">
                                                    Based on your current skill set, your full-stack
                                                    readiness is above average for current market trends.
                                                </p>
                                                <div className="mt-6 space-y-4">
                                                    <div>
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="text-[#c5d6ee]">Frontend Mastery</span>
                                                            <span className="text-[#55a2ff]">{frontendPct}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-[#1c2e4e]">
                                                            <div
                                                                style={{ width: `${frontendPct}%` }}
                                                                className="h-2 rounded-full bg-[#2f6df6]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="text-[#c5d6ee]">
                                                                Backend Systems
                                                            </span>
                                                            <span className="text-[#55a2ff]">
                                                                {architecturePct}%
                                                            </span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-[#1c2e4e]">
                                                            <div
                                                                style={{ width: `${architecturePct}%` }}
                                                                className="h-2 rounded-full bg-[#2f6df6]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="text-[#c5d6ee]">
                                                                Infrastructure / DevOps
                                                            </span>
                                                            <span className="text-[#55a2ff]">{infraPct}%</span>
                                                        </div>
                                                        <div className="h-2 rounded-full bg-[#1c2e4e]">
                                                            <div
                                                                style={{ width: `${infraPct}%` }}
                                                                className="h-2 rounded-full bg-[#2f6df6]"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-[#1a365f] bg-[#0e1b35] p-5">
                                                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-[#2f6df6] text-4xl font-semibold text-white">
                                                    {mastery}%
                                                </div>
                                                <p className="mt-6 text-center text-2xl font-semibold text-[#d9e8ff]">
                                                    Elite Readiness
                                                </p>
                                                <p className="mt-1 text-center text-sm text-[#7f98be]">
                                                    Top 25% of Developers
                                                </p>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
            <EditSkillModal
                skill={editingSkill}
                loading={editMutation.isPending}
                onClose={() => setEditingSkill(null)}
                onSubmit={(payload, files) => {
                    if (!editingSkill) return;
                    editMutation.mutate({ id: editingSkill._id, payload, files });
                }}
            />
            {showAddForm ? (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020617]/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-2xl border border-[#274a7c] bg-[#1b2a3f] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                        <div className="flex items-start justify-between border-b border-[#2a3d5a] p-5 pb-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">Add / Edit Skill</h2>
                                <p className="mt-1 text-sm text-[#8ea5c8]">
                                    Showcase your technical expertise to potential recruiters and
                                    collaborators.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetAddForm();
                                }}
                                className="text-[#8ea5c8] hover:text-white"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div className="space-y-5 p-5">
                            <div>
                                <label className="mb-1.5 block text-base text-[#d6e3f7]">Skill Name</label>
                                <div className="relative">
                                    <input
                                        value={addSkillName}
                                        onChange={(event) => setAddSkillName(event.target.value)}
                                        placeholder="Search for a skill (e.g. React, TypeScript)"
                                        className="h-11 w-full rounded-xl border border-[#2a4568] bg-[#101d34] px-4 pr-10 text-base text-[#e7f0fe] placeholder:text-[#6f86aa] focus:border-[#2f6df6] focus:outline-none"
                                    />
                                    <ChevronDown
                                        size={18}
                                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6f86aa]"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <label className="text-base text-[#d6e3f7]">
                                        Proficiency Level (1-10)
                                    </label>
                                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#16345a] text-base font-semibold text-[#55a2ff]">
                                        {addProficiency}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={addProficiency}
                                    onChange={(event) => setAddProficiency(Number(event.target.value))}
                                    className="h-2 w-full accent-[#2f6df6]"
                                />
                                <div className="mt-2 flex justify-between text-sm uppercase tracking-wide text-[#6f86aa]">
                                    <span>Beginner</span>
                                    <span>Intermediate</span>
                                    <span>Expert</span>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-base text-[#d6e3f7]">Description</label>
                                <textarea
                                    rows={3}
                                    value={addDescription}
                                    onChange={(event) => setAddDescription(event.target.value)}
                                    placeholder="Describe how you use this skill in your projects..."
                                    className="w-full rounded-xl border border-[#2a4568] bg-[#101d34] px-4 py-3 text-sm text-[#e7f0fe] placeholder:text-[#6f86aa] focus:border-[#2f6df6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-base text-[#d6e3f7]">
                                    Attachments & Proofs
                                </label>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#36557d] bg-[#101d34] text-center">
                                        <UploadCloud size={30} className="text-[#8ea5c8]" />
                                        <p className="mt-2 text-lg text-[#9bb0cf]">
                                            Click to upload or drag & drop
                                        </p>
                                        <p className="text-sm text-[#6f86aa]">PDF, PNG, JPG (max. 10MB)</p>
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,image/png,image/jpeg,image/jpg"
                                            className="hidden"
                                            onChange={(event) => {
                                                const selected = Array.from(event.target.files || []);
                                                setAddFiles(selected.slice(0, 5));
                                            }}
                                        />
                                    </label>
                                    <div className="rounded-xl border border-[#2a4568] bg-[#101d34] p-3">
                                        {addFiles.length === 0 ? (
                                            <p className="text-sm text-[#6f86aa]">No attachments selected.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {addFiles.map((file, index) => (
                                                    <div
                                                        key={`${file.name}-${index}`}
                                                        className="flex items-center justify-between rounded-lg bg-[#162741] px-3 py-2"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f3a72] text-[#7fb2ff]">
                                                                <FileText size={18} />
                                                            </span>
                                                            <div>
                                                                <p className="text-sm text-[#d6e3f7]">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-xs text-[#6f86aa]">
                                                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="text-sm text-[#8ea5c8] hover:text-white"
                                                            onClick={() =>
                                                                setAddFiles((prev) =>
                                                                    prev.filter((_, i) => i !== index)
                                                                )
                                                            }
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-[#2a3d5a] p-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-11 text-[#9bb0cf] hover:bg-[#21314d] hover:text-white"
                                onClick={() => {
                                    setShowAddForm(false);
                                    resetAddForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="h-11 rounded-xl bg-[#2684ea] px-6 text-sm font-semibold hover:bg-[#1f72cb]"
                                disabled={addMutation.isPending}
                                onClick={submitAddSkill}
                            >
                                <Plus size={16} className="mr-2" />
                                {addMutation.isPending ? "Adding..." : "Add Skill"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </ProtectedRoute>
    );
}
