"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useToastStore } from "@/store/toastStore";
import { updateMyProfile, changePassword } from "@/services/profileServices";
import { Shield, Bell, Lock, User, Save, KeyRound, MonitorSmartphone, EyeOff, Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { id: "profile", label: "Identity", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "preferences", label: "Preferences", icon: MonitorSmartphone },
];

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } }, exit: { opacity: 0, y: -10, transition: { duration: 0.2 } } };

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);
    const theme = useThemeStore((state) => state.theme);
    const setTheme = useThemeStore((state) => state.setTheme);
    const pushToast = useToastStore((state) => state.pushToast);
    const queryClient = useQueryClient();

    // Form States
    const [name, setName] = useState(user?.name || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [location, setLocation] = useState(user?.location || "");
    const [githubUrl, setGithubUrl] = useState(user?.githubUrl || "");
    const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const profileMutation = useMutation({
        mutationFn: updateMyProfile,
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setUser(res.data);
            pushToast({ type: "success", title: "Identity parameters updated" });
        },
        onError: () => pushToast({ type: "error", title: "Failed to update identity" }),
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
            pushToast({ type: "success", title: "Security credentials updated" });
        },
        onError: (error: unknown) => {
            const title =
                error && typeof error === "object" && "message" in error && typeof error.message === "string"
                    ? error.message
                    : "Password update failed";

            pushToast({ type: "error", title });
        },
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileMutation.mutate({ name, bio, location, githubUrl, linkedinUrl });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            pushToast({ type: "error", title: "Passwords do not match" });
            return;
        }
        passwordMutation.mutate({ currentPassword, newPassword });
    };

    return (
        <DashboardLayout>
            <div className="mx-auto flex w-full max-w-5xl flex-col lg:flex-row gap-8">
                {/* Fixed Left Sidebar for Tabs */}
                <aside className="w-full lg:w-[280px] shrink-0">
                    <div className="sticky top-24 space-y-2">
                        <div className="mb-6 px-4">
                            <h1 className="text-2xl font-extrabold text-[var(--app-text)]">Configuration</h1>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--app-muted)] mt-1">System Preferences</p>
                        </div>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group border",
                                        isActive 
                                        ? "bg-[var(--app-primary)]/10 border-[var(--app-primary-soft)] text-[var(--app-primary)] shadow-[0_0_15px_var(--app-primary-soft)]" 
                                        : "bg-[var(--app-surface-soft)] border-transparent text-[var(--app-muted)] hover:border-[var(--app-line)] hover:bg-[var(--app-surface)] hover:text-[var(--app-text)]"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon size={18} className={isActive ? "animate-pulse" : "group-hover:scale-110 transition-transform"} />
                                        <span className="font-bold text-sm">{tab.label}</span>
                                    </div>
                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-primary)] shadow-glow" />}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="app-card border-[var(--app-line)] p-6 sm:p-8 relative overflow-hidden min-h-[600px]">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,var(--app-primary-strong)_0%,transparent_60%)] opacity-10 pointer-events-none rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                        
                        <AnimatePresence mode="wait">
                            {activeTab === "profile" && (
                                <motion.div key="profile" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="relative z-10 w-full max-w-2xl">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-extrabold text-[var(--app-text)]">Developer Identity</h2>
                                        <p className="text-sm font-medium text-[var(--app-muted)] mt-1">Update your public-facing terminal attributes.</p>
                                    </div>
                                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="space-y-4">
                                            <InputGroup label="Designation (Name)" id="name" value={name} onChange={setName} placeholder="John Doe" />
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-[var(--app-muted)] ml-1">Directive (Bio)</label>
                                                <textarea
                                                    value={bio}
                                                    onChange={(e) => setBio(e.target.value)}
                                                    placeholder="Full-stack engineer building the future..."
                                                    rows={4}
                                                    className="w-full resize-none rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] p-4 text-sm font-medium text-[var(--app-text)] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_var(--app-primary-soft)] focus:outline-none transition-all"
                                                />
                                            </div>
                                            <InputGroup label="Sector (Location)" id="location" value={location} onChange={setLocation} placeholder="San Francisco, CA" />
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <InputGroup label="GitHub Coordinates" id="github" value={githubUrl} onChange={setGithubUrl} placeholder="https://github.com/..." />
                                                <InputGroup label="LinkedIn Coordinates" id="linkedin" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="https://linkedin.com/..." />
                                            </div>
                                        </div>
                                        <div className="pt-6 mt-6 border-t border-[var(--app-line)] flex justify-end">
                                            <Button type="submit" disabled={profileMutation.isPending} className="font-bold px-8 shadow-glow">
                                                <Save size={16} className="mr-2" /> Commit Changes
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div key="security" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="relative z-10 w-full max-w-2xl">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-extrabold text-[var(--app-text)]">Access Credentials</h2>
                                        <p className="text-sm font-medium text-[var(--app-muted)] mt-1">Modify your encryption keys to maintain system security.</p>
                                    </div>
                                    
                                    {!user?.isGoogleUser ? (
                                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                            <div className="space-y-4">
                                                <InputGroup label="Current Encryption Key" type="password" id="current_password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" icon={KeyRound} />
                                                <div className="pt-2">
                                                    <InputGroup label="New Encryption Key" type="password" id="new_password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" icon={Shield} />
                                                </div>
                                                <InputGroup label="Verify New Key" type="password" id="confirm_password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                                            </div>
                                            <div className="pt-6 mt-6 border-t border-[var(--app-line)] flex justify-end">
                                                <Button type="submit" disabled={passwordMutation.isPending || !currentPassword || !newPassword} className="font-bold px-8 shadow-glow">
                                                    <Lock size={16} className="mr-2" /> Rotate Keys
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="app-card border border-[var(--app-success)]/30 bg-[var(--app-success)]/5 px-6 py-8 text-center mt-4">
                                            <Shield size={48} className="mx-auto text-[var(--app-success)] mb-4 opacity-80" />
                                            <p className="text-lg font-extrabold text-[var(--app-text)]">Federated Authentication Active</p>
                                            <p className="text-sm text-[var(--app-muted)] mt-2 font-medium max-w-md mx-auto">
                                                Your node is currently secured via Google OAuth. Standard encryption key rotation is disabled for this terminal.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-12 pt-8 border-t border-red-500/20">
                                        <h3 className="text-lg font-extrabold text-red-500 mb-2">Danger Zone</h3>
                                        <p className="text-sm text-[var(--app-muted)] mb-4">Permanently format this node and sever all network links.</p>
                                        <Button variant="outline" className="text-red-500 border-red-500/50 hover:bg-red-500/10 font-bold">
                                            Initiate Self-Destruct
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "preferences" && (
                                <motion.div key="preferences" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="relative z-10 w-full max-w-2xl">
                                    <div className="mb-8">
                                        <h2 className="text-2xl font-extrabold text-[var(--app-text)]">System Preferences</h2>
                                        <p className="text-sm font-medium text-[var(--app-muted)] mt-1">Configure your HUD and alert mechanics.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Example Toggles that do nothing right now but look cool */}
                                        <ToggleItem 
                                            icon={Bell} title="Network Pings" desc="Receive alerts for external connection requests and mentions." 
                                            defaultChecked={true} 
                                        />
                                        <ToggleItem 
                                            icon={MonitorSmartphone} title="Cross-Device Sync" desc="Synchronize UI state across all authenticated terminals." 
                                            defaultChecked={true} 
                                        />
                                        <ToggleItem 
                                            icon={EyeOff} title="Stealth Mode" desc="Hide online status and typing indicators from peer nodes." 
                                            defaultChecked={false} 
                                        />
                                    </div>

                                    <div className="mt-12 p-6 rounded-2xl border border-[var(--app-secondary)]/30 bg-[var(--app-secondary)]/5">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-[var(--app-secondary)]/10 rounded-xl text-[var(--app-primary)]">
                                                <MonitorSmartphone size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-extrabold text-[var(--app-text)] mb-1 text-lg">Appearance Theme</h4>
                                                <p className="text-sm text-[var(--app-text-soft)] leading-relaxed">
                                                    Choose between a bright white workspace or the original dark project look.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={() => setTheme("light")}
                                                className={cn(
                                                    "rounded-2xl border p-4 text-left transition-all",
                                                    theme === "light"
                                                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-[0_0_18px_var(--app-primary-soft)]"
                                                        : "border-[var(--app-line)] bg-[var(--app-surface)] hover:border-[var(--app-line-strong)]"
                                                )}
                                            >
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="rounded-xl bg-white p-2 text-[var(--app-primary)] shadow-sm">
                                                        <Sun size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--app-text)]">Light Theme</p>
                                                        <p className="text-xs text-[var(--app-muted)]">Clean premium SaaS look</p>
                                                    </div>
                                                </div>
                                                <div className="rounded-xl border border-slate-200 bg-white p-3">
                                                    <div className="mb-2 h-2 w-24 rounded-full bg-slate-900" />
                                                    <div className="h-2 w-36 rounded-full bg-slate-500" />
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTheme("dark")}
                                                className={cn(
                                                    "rounded-2xl border p-4 text-left transition-all",
                                                    theme === "dark"
                                                        ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)] shadow-[0_0_18px_var(--app-primary-soft)]"
                                                        : "border-[var(--app-line)] bg-[var(--app-surface)] hover:border-[var(--app-line-strong)]"
                                                )}
                                            >
                                                <div className="mb-3 flex items-center gap-3">
                                                    <div className="rounded-xl bg-slate-950 p-2 text-indigo-300 shadow-sm">
                                                        <Moon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[var(--app-text)]">Dark Theme</p>
                                                        <p className="text-xs text-[var(--app-muted)]">Original dark project style</p>
                                                    </div>
                                                </div>
                                                <div className="rounded-xl border border-[#2c364a] bg-[#1b2230] p-3">
                                                    <div className="mb-2 h-2 w-24 rounded-full bg-[#e4ebf7]" />
                                                    <div className="h-2 w-36 rounded-full bg-[#a7b4ca]" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    );
}

type InputGroupProps = {
    label: string;
    type?: React.HTMLInputTypeAttribute;
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: LucideIcon;
};

function InputGroup({ label, type = "text", id, value, onChange, placeholder, icon: Icon }: InputGroupProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-[var(--app-muted)] ml-1">{label}</label>
            <div className="relative">
                {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-muted)]" />}
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        "h-12 w-full rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface-soft)] px-4 text-sm font-bold text-[var(--app-text)] focus:border-[var(--app-primary)] focus:shadow-[0_0_0_3px_var(--app-primary-soft)] focus:outline-none transition-all placeholder:text-[var(--app-muted)] placeholder:font-medium",
                        Icon && "pl-11"
                    )}
                />
            </div>
        </div>
    );
}

type ToggleItemProps = {
    icon: LucideIcon;
    title: string;
    desc: string;
    defaultChecked: boolean;
};

function ToggleItem({ icon: Icon, title, desc, defaultChecked }: ToggleItemProps) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl border border-[var(--app-line)] bg-[var(--app-surface)] hover:border-[var(--app-text-soft)] transition-colors">
            <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[var(--app-surface-soft)] text-[var(--app-muted)] border border-[var(--app-line)]">
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-extrabold text-[var(--app-text)]">{title}</h4>
                    <p className="text-[12px] text-[var(--app-muted)] mt-0.5">{desc}</p>
                </div>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none",
                    checked ? "bg-[var(--app-primary)] shadow-glow" : "bg-[var(--app-surface-strong)]"
                )}
            >
                <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )} />
            </button>
        </div>
    );
}
