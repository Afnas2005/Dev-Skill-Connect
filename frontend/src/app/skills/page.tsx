"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EditSkillModal } from "@/components/skills/edit-skill-modal";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { createSkill, deleteSkill, getMySkills, updateSkill } from "@/services/skillServices";
import { updateMyProfile } from "@/services/profileServices";
import { uploadResume, uploadSkillAttachments } from "@/services/uploadServices";
import type { Skill, SkillPayload } from "@/types/domain";
import { Plus, UploadCloud, Grid3X3, FileText, X, ChevronDown, PenLine, Trash2 } from "lucide-react";

const filters = ["All Talents", "Frontend", "Backend", "Systems Design"];

function levelToPercent(level: Skill["level"]) {
    if (level === "advanced") return 92;
    if (level === "intermediate") return 76;
    return 62;
}

const staggerList = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3 } } };

export default function SkillsPage() {
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addSkillName, setAddSkillName] = useState("");
    const [addProficiency, setAddProficiency] = useState(7);
    const [addDescription, setAddDescription] = useState("");
    const [addFiles, setAddFiles] = useState<File[]>([]);
    
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    
    const queryClient = useQueryClient();
    const pushToast = useToastStore((state) => state.pushToast);

    const skillsQuery = useQuery({ queryKey: ["skills", "me"], queryFn: getMySkills });

    const addMutation = useMutation({
        mutationFn: async ({ payload, files }: { payload: SkillPayload; files: File[] }) => {
            let attachments = payload.attachments || [];
            if (files.length > 0) {
                const upload = await uploadSkillAttachments(files);
                attachments = upload.data.urls;
            }
            return createSkill({ ...payload, attachments });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setShowAddForm(false);
            resetAddForm();
            pushToast({ type: "success", title: "Skill initialized" });
        },
        onError: () => pushToast({ type: "error", title: "Failed to initialize skill" }),
    });

    const editMutation = useMutation({
        mutationFn: async ({ id, payload, files }: { id: string; payload: SkillPayload; files: File[] }) => {
            let attachments = payload.attachments || [];
            if (files.length > 0) {
                const upload = await uploadSkillAttachments(files);
                attachments = [...attachments, ...upload.data.urls];
            }
            return updateSkill(id, { ...payload, attachments });
        },
        onSuccess: () => {
            setEditingSkill(null);
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            pushToast({ type: "success", title: "Skill matrix updated" });
        },
        onError: () => pushToast({ type: "error", title: "Update failed" }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSkill,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            pushToast({ type: "success", title: "Skill purged" });
        },
        onError: () => pushToast({ type: "error", title: "Purge failed" }),
    });

    const resumeMutation = useMutation({
        mutationFn: async (file: File) => {
            const upload = await uploadResume(file);
            return updateMyProfile({ resumeUrl: upload.data.url });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setResumeFile(null);
            setShowResumeModal(false);
            pushToast({ type: "success", title: "Resume data secured" });
        },
        onError: () => pushToast({ type: "error", title: "Upload malfunctioned" }),
    });

    const skills = skillsQuery.data?.data || [];
    const mastery = skills.length ? Math.round(skills.reduce((acc, s) => acc + levelToPercent(s.level), 0) / skills.length) : 75;
    const frontendPct = skills.length ? Math.min(95, mastery + 8) : 85;
    const architecturePct = skills.length ? Math.max(65, mastery + 1) : 78;
    const infraPct = skills.length ? Math.max(55, mastery - 13) : 62;

    const proficiencyToLevel = (val: number): Skill["level"] => val <= 3 ? "beginner" : val <= 7 ? "intermediate" : "advanced";
    const resetAddForm = () => { setAddSkillName(""); setAddProficiency(7); setAddDescription(""); setAddFiles([]); };

    const submitAddSkill = () => {
        if (!addSkillName.trim()) {
            pushToast({ type: "error", title: "Skill Identifier is required" });
            return;
        }
        addMutation.mutate({
            payload: {
                skillName: addSkillName.trim(),
                level: proficiencyToLevel(addProficiency),
                description: addDescription.trim() || undefined,
            },
            files: addFiles,
        });
    };

    return (
        <DashboardLayout>
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5 app-card p-6 border-[var(--app-line)] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--app-primary-strong)_0%,transparent_60%)] opacity-20 pointer-events-none rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-[var(--app-text)] drop-shadow-sm">Technical Arsenal</h1>
                        <p className="mt-2 text-[0.95rem] text-[var(--app-muted)] max-w-xl">
                            Quantify and showcase your professional technical capabilities. Upload verified evidence to increase your overall node rating.
                        </p>
                    </div>
                    <div className="relative z-10 shrink-0">
                        <Button
                            onClick={() => setShowResumeModal(true)}
                            className="h-11 rounded-xl bg-white text-black hover:bg-white/90 font-bold px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <UploadCloud size={16} className="mr-2" />
                            Secure Resume Drop
                        </Button>
                    </div>
                </header>

                <div className="mb-8 flex flex-wrap gap-2">
                    {filters.map((label, i) => (
                        <button key={label} className={cn("inline-flex items-center gap-2 rounded-[12px] border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all shadow-sm", i === 0 ? "border-[var(--app-primary-glow)] bg-[var(--app-primary-soft)] text-[var(--app-primary)]" : "border-[var(--app-line)] app-glass text-[var(--app-muted)] hover:border-[var(--app-text-soft)] hover:text-[var(--app-text)]")}>
                            {i === 0 && <Grid3X3 size={14} />} {label}
                        </button>
                    ))}
                </div>

                {skillsQuery.isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Spinner size={32} className="text-[var(--app-primary)]" />
                    </div>
                ) : (
                    <>
                        <motion.section variants={staggerList} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <motion.button variants={fadeUp} onClick={() => setShowAddForm(true)} className="flex min-h-[260px] flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[var(--app-primary-soft)] bg-[var(--app-primary)]/5 text-center group transition-all hover:bg-[var(--app-primary)]/10">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--app-primary)] text-white shadow-glow group-hover:scale-110 transition-transform">
                                    <Plus size={32} />
                                </span>
                                <p className="text-xl font-extrabold text-[var(--app-text)]">Install Skill</p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[var(--app-primary)]">Expand Matrix</p>
                            </motion.button>

                            {skills.map((skill) => {
                                const pct = levelToPercent(skill.level);
                                return (
                                    <motion.article key={skill._id} variants={fadeUp} className="rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface)] p-6 shadow-sm overflow-hidden relative group hover:border-[var(--app-primary-soft)] transition-colors">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--app-primary)]/5 rounded-bl-[100px] pointer-events-none group-hover:bg-[var(--app-primary)]/15 transition-colors" />
                                        
                                        <div className="mb-5 flex items-start justify-between relative z-10">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--app-primary-strong)] to-[var(--app-primary)] text-sm font-extrabold text-white shadow-glow">
                                                {skill.skillName.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingSkill(skill)} className="p-2 rounded-lg text-[var(--app-muted)] hover:text-[var(--app-primary)] hover:bg-[var(--app-primary-soft)]">
                                                    <PenLine size={14} />
                                                </button>
                                                <button onClick={() => deleteMutation.mutate(skill._id)} className="p-2 rounded-lg text-[var(--app-muted)] hover:text-red-400 hover:bg-red-500/10">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="relative z-10">
                                            <p className="text-xl font-extrabold text-[var(--app-text)] truncate">{skill.skillName}</p>
                                            <span className="mt-2 inline-flex rounded-md bg-[var(--app-success)]/10 border border-[var(--app-success)]/20 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[var(--app-success)]">
                                                {skill.level}
                                            </span>
                                        </div>
                                        
                                        <div className="mt-6 relative z-10">
                                            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                                <span className="text-[var(--app-muted)]">Proficiency</span>
                                                <span className="text-[var(--app-primary)]">{pct}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-[var(--app-surface-soft)] p-[1px] overflow-hidden border border-[var(--app-line)]">
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#38bdf8] shadow-[0_0_10px_var(--app-primary-glow)]" />
                                            </div>
                                        </div>
                                        <p className="mt-5 text-[0.85rem] leading-relaxed text-[var(--app-text-soft)] line-clamp-2 relative z-10">
                                            {skill.description || "Core component in current stack."}
                                        </p>
                                    </motion.article>
                                );
                            })}
                        </motion.section>

                        <section className="mt-10 rounded-[32px] border border-[var(--app-secondary)]/30 bg-gradient-to-br from-[#0a0520] to-[#120a3a] p-8 lg:p-10 shadow-[0_0_40px_rgba(168,85,247,0.1)] relative overflow-hidden isolate">
                            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--app-secondary)]/20 rounded-full blur-[80px]" />
                            <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full bg-[var(--app-secondary)] shadow-glow animate-pulse" />
                                        System Analysis
                                    </h2>
                                    <p className="mt-3 text-sm font-medium text-[var(--app-muted)] max-w-lg leading-relaxed">
                                        Based on your current capability matrix, your full-stack readiness indicates high compatibility for senior-level deployment.
                                    </p>
                                    <div className="mt-8 space-y-6">
                                        {[
                                            { label: "Frontend Architecture", pct: frontendPct },
                                            { label: "Backend Resilience", pct: architecturePct },
                                            { label: "DevOps Integration", pct: infraPct }
                                        ].map((stat, i) => (
                                            <div key={stat.label}>
                                                <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-widest text-[#a855f7]">
                                                    <span>{stat.label}</span>
                                                    <span className="text-white">{stat.pct}%</span>
                                                </div>
                                                <div className="h-2 rounded-full bg-white/5 p-[1px] border border-white/10">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${stat.pct}%` }} transition={{ duration: 1, delay: i * 0.2 }} className="h-full rounded-full bg-gradient-to-r from-[#a855f7] to-[#e879f9]" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-[24px] border border-white/10 app-glass-strong p-8 flex flex-col items-center justify-center relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[24px] pointer-events-none" />
                                    <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                        <span className="text-5xl font-extrabold text-white drop-shadow-lg">{mastery}%</span>
                                    </div>
                                    <p className="mt-8 text-center text-xl font-extrabold text-white">Elite Readiness</p>
                                    <p className="mt-1 text-center text-xs font-bold uppercase tracking-widest text-[#a855f7]">Top Tier Protocol</p>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <EditSkillModal skill={editingSkill} loading={editMutation.isPending} onClose={() => setEditingSkill(null)} onSubmit={(p, f) => { if (editingSkill) editMutation.mutate({ id: editingSkill._id, payload: p, files: f }); }} />
            
            {/* Keeping identical forms inside similar modals just styled */}
            <AnimatePresence>
                {showResumeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface)] shadow-2xl overflow-hidden">
                            <div className="border-b border-[var(--app-line)] bg-[var(--app-surface-soft)] p-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-extrabold text-[var(--app-text)]">Secure Upload</h2>
                                    <p className="text-xs text-[var(--app-muted)] mt-1 uppercase tracking-widest font-bold">Encrypted Resume Transfer</p>
                                </div>
                                <button onClick={() => { setShowResumeModal(false); setResumeFile(null); }} className="p-2 app-glass rounded-xl text-[var(--app-muted)] hover:text-white border border-[var(--app-line)]"><X size={18} /></button>
                            </div>
                            <div className="p-6">
                                <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[var(--app-primary-soft)] bg-[var(--app-primary)]/5 hover:bg-[var(--app-primary)]/10 transition-colors text-center p-6">
                                    <UploadCloud size={36} className="text-[var(--app-primary)]" />
                                    <div>
                                        <p className="text-sm font-bold text-[var(--app-text)] mb-1">{resumeFile ? resumeFile.name : "Select or drag file here"}</p>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--app-muted)]">{resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB (Ready)` : "PDF, DOCX format supported"}</p>
                                    </div>
                                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} />
                                </label>
                            </div>
                            <div className="border-t border-[var(--app-line)] bg-[var(--app-surface-soft)] p-5 flex justify-end gap-3">
                                <Button variant="ghost" className="font-bold text-[var(--app-muted)]" onClick={() => { setShowResumeModal(false); setResumeFile(null); }}>Abort</Button>
                                <Button disabled={resumeMutation.isPending || !resumeFile} onClick={() => resumeMutation.mutate(resumeFile as File)} className="font-bold shadow-glow">
                                    {resumeMutation.isPending ? "Transmitting..." : "Initialize Upload"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showAddForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[var(--app-line)] bg-[var(--app-surface)] shadow-2xl no-scrollbar">
                            <div className="sticky top-0 z-10 border-b border-[var(--app-line)] bg-[var(--app-surface-soft)]/90 backdrop-blur-md p-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-extrabold text-[var(--app-text)]">Install New Skill module</h2>
                                    <p className="text-xs text-[var(--app-muted)] mt-1 uppercase tracking-widest font-bold">Enhance Matrix capabilities</p>
                                </div>
                                <button onClick={() => { setShowAddForm(false); resetAddForm(); }} className="p-2 app-glass rounded-xl text-[var(--app-muted)] hover:text-white border border-[var(--app-line)]"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">Identifier (Skill Name)</label>
                                    <input value={addSkillName} onChange={(e) => setAddSkillName(e.target.value)} placeholder="e.g. Next.js, Rust, Docker" className="h-12 w-full rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] px-4 text-sm font-bold text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-muted)] transition-colors" />
                                </div>
                                <div>
                                    <div className="mb-3 flex justify-between items-center">
                                        <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">Proficiency Calibration</label>
                                        <span className="text-[var(--app-primary)] font-extrabold">{addProficiency}/10</span>
                                    </div>
                                    <input type="range" min={1} max={10} value={addProficiency} onChange={(e) => setAddProficiency(Number(e.target.value))} className="h-2 w-full accent-[var(--app-primary)]" />
                                </div>
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">Module Description</label>
                                    <textarea rows={3} value={addDescription} onChange={(e) => setAddDescription(e.target.value)} placeholder="Elaborate on field experience..." className="w-full resize-none rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] p-4 text-sm font-medium text-[var(--app-text)] focus:border-[var(--app-primary)] focus:outline-none placeholder:text-[var(--app-muted)] transition-colors" />
                                </div>
                                <div>
                                    <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-[var(--app-muted)]">Verified Evidence (Max 5)</label>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--app-primary-soft)] bg-[var(--app-primary)]/5 text-[var(--app-primary)] hover:bg-[var(--app-primary)]/10 transition-colors">
                                            <UploadCloud size={24} className="mb-2" />
                                            <span className="text-xs font-bold">Upload Logs</span>
                                            <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => setAddFiles(Array.from(e.target.files || []).slice(0, 5))} />
                                        </label>
                                        <div className="rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] p-3 overflow-y-auto max-h-[120px] no-scrollbar">
                                            {addFiles.length === 0 ? <p className="text-xs font-medium text-[var(--app-muted)] text-center mt-8 inline-block w-full">No evidence attached.</p> : (
                                                <div className="space-y-2">
                                                    {addFiles.map((f, i) => (
                                                        <div key={i} className="flex items-center justify-between rounded-lg bg-[var(--app-surface)] border border-[var(--app-line)] p-2">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <FileText size={14} className="min-w-fit text-[var(--app-primary)]" />
                                                                <span className="text-[10px] font-bold text-[var(--app-text)] truncate">{f.name}</span>
                                                            </div>
                                                            <button onClick={() => setAddFiles(addFiles.filter((_, idx) => idx !== i))} className="text-[var(--app-muted)] hover:text-red-400 min-w-fit ml-2"><X size={12} /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="sticky bottom-0 border-t border-[var(--app-line)] bg-[var(--app-surface-soft)] p-5 flex justify-end gap-3 z-10">
                                <Button variant="ghost" className="font-bold text-[var(--app-muted)]" onClick={() => { setShowAddForm(false); resetAddForm(); }}>Abort</Button>
                                <Button disabled={addMutation.isPending} onClick={submitAddSkill} className="font-bold shadow-glow"><Plus size={16} className="mr-2" /> Execute Install</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
