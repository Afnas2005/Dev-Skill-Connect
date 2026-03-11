"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Bell,
    Check,
    Code2,
    Compass,
    House,
    Lock,
    MessageSquare,
    Settings,
    User,
    UserCog,
    LogOut,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logoutUser } from "@/services/authServices";
import { deleteMyAccount, getMySettings, updateMySettings } from "@/services/settingServices";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const leftNav = [
    { href: "/dashboard", label: "Feed", icon: House },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/skills", label: "My Skills", icon: Code2 },
    { href: "/search", label: "Explore", icon: Compass },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings, active: true },
];

function Toggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "relative h-7 w-12 rounded-full transition-colors",
                checked ? "bg-[#6366f1]" : "bg-[#2a3b59]"
            )}
        >
            <span
                className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                    checked ? "left-6" : "left-1"
                )}
            />
        </button>
    );
}

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.logout);
    const pushToast = useToastStore((state) => state.pushToast);
    const router = useRouter();
    const queryClient = useQueryClient();

    const settingsQuery = useQuery({
        queryKey: ["settings", "me"],
        queryFn: getMySettings,
        onSuccess: (response) => {
            const data = response.data;
            setEmail(data.email || "");
            setUsername(data.username || "");
            setPublicProfile(data.privacy.publicProfile);
            setOnlineStatus(data.privacy.showOnlineStatus);
            setSearchVisibility(data.privacy.searchVisibility);
            setEmailRequests(data.notifications.emailRequests);
            setEmailMessages(data.notifications.emailMessages);
            setEmailUpdates(data.notifications.emailUpdates);
            setPushDesktop(data.notifications.pushDesktop);
            setPushSound(data.notifications.pushSound);
        },
    });

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [publicProfile, setPublicProfile] = useState(true);
    const [onlineStatus, setOnlineStatus] = useState(false);
    const [searchVisibility, setSearchVisibility] = useState(true);
    const [emailRequests, setEmailRequests] = useState(true);
    const [emailMessages, setEmailMessages] = useState(true);
    const [emailUpdates, setEmailUpdates] = useState(false);
    const [pushDesktop, setPushDesktop] = useState(true);
    const [pushSound, setPushSound] = useState(true);

    const saveMutation = useMutation({
        mutationFn: () =>
            updateMySettings({
                email,
                username,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined,
                confirmNewPassword: confirmNewPassword || undefined,
                privacy: {
                    publicProfile,
                    showOnlineStatus: onlineStatus,
                    searchVisibility,
                },
                notifications: {
                    emailRequests,
                    emailMessages,
                    emailUpdates,
                    pushDesktop,
                    pushSound,
                },
            }),
        onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            settingsQuery.refetch();
            pushToast({
                type: "success",
                title: "Settings saved",
                description: "Your preferences were updated successfully.",
            });
        },
        onError: (error: unknown) => {
            const message =
                typeof error === "object" && error && "message" in error
                    ? String((error as { message?: string }).message)
                    : "Please try again.";
            pushToast({
                type: "error",
                title: "Failed to save settings",
                description: message,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMyAccount,
        onSuccess: async () => {
            await logoutUser();
            queryClient.clear();
            clearAuth();
            pushToast({
                type: "success",
                title: "Account deleted",
            });
            router.replace("/register");
        },
        onError: () => {
            pushToast({
                type: "error",
                title: "Failed to delete account",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            queryClient.clear();
            clearAuth();
            pushToast({
                type: "success",
                title: "Logged out",
            });
            router.replace("/login");
        },
        onError: () => {
            pushToast({
                type: "error",
                title: "Logout failed",
            });
        },
    });

    const fieldClass =
        "h-11 rounded-lg border border-[#1a365f] bg-[#0c1730] text-sm text-[#dbeafe] placeholder:text-[#607da7] focus-visible:ring-[#6366f1]";

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
                                                ? "bg-[#27324f] text-[#7f8cff]"
                                                : "text-[#8aa0c2] hover:bg-[#122541] hover:text-[#d7e7ff]"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-auto w-full rounded-2xl bg-[#f8fafc] p-3 text-[#0f172a]">
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

                    <main className="no-scrollbar h-screen flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0">
                        <div className="mx-auto w-full max-w-[900px]">
                            <header className="mb-4 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-4">
                                <h1 className="text-5xl font-semibold text-white">Settings</h1>
                                <p className="mt-2 text-xl text-[#8aa0c2]">
                                    Manage your account preferences and security settings.
                                </p>
                            </header>

                            {settingsQuery.isLoading ? (
                                <div className="text-[#8aa0c2]">Loading settings...</div>
                            ) : settingsQuery.isError ? (
                                <div className="rounded-xl border border-red-900/40 bg-red-950/50 p-4 text-sm text-red-300">
                                    Failed to load settings.
                                </div>
                            ) : (
                                <>
                                    <section className="mb-4 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-5">
                                        <h2 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold text-[#dce8fa]">
                                            <UserCog size={18} className="text-[#7f8cff]" />
                                            Account Settings
                                        </h2>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-[#7f98be]">
                                                    Email Address
                                                </label>
                                                <Input
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                    className={fieldClass}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs uppercase tracking-wider text-[#7f98be]">
                                                    Username
                                                </label>
                                                <Input
                                                    value={username}
                                                    onChange={(event) => setUsername(event.target.value)}
                                                    className={fieldClass}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-5 space-y-2">
                                            <label className="text-xs uppercase tracking-wider text-[#7f98be]">
                                                Change Password
                                            </label>
                                            <div className="grid gap-3 md:grid-cols-3">
                                                <Input
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(event) =>
                                                        setCurrentPassword(event.target.value)
                                                    }
                                                    placeholder="Current Password"
                                                    className={fieldClass}
                                                />
                                                <Input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(event) =>
                                                        setNewPassword(event.target.value)
                                                    }
                                                    placeholder="New Password"
                                                    className={fieldClass}
                                                />
                                                <Input
                                                    type="password"
                                                    value={confirmNewPassword}
                                                    onChange={(event) =>
                                                        setConfirmNewPassword(event.target.value)
                                                    }
                                                    placeholder="Confirm New Password"
                                                    className={fieldClass}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end">
                                            <Button
                                                onClick={() => saveMutation.mutate()}
                                                disabled={saveMutation.isPending}
                                                className="h-10 rounded-lg bg-[#6366f1] px-5 font-semibold hover:bg-[#5558dc]"
                                            >
                                                {saveMutation.isPending ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>
                                    </section>

                                    <section className="mb-4 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-5">
                                        <h2 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold text-[#dce8fa]">
                                            <Lock size={18} className="text-[#7f8cff]" />
                                            Privacy
                                        </h2>
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-[#16253f] p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-white">
                                                            Public Profile
                                                        </p>
                                                        <p className="text-sm text-[#7f98be]">
                                                            Allow other developers to find and view your
                                                            profile.
                                                        </p>
                                                    </div>
                                                    <Toggle
                                                        checked={publicProfile}
                                                        onChange={setPublicProfile}
                                                    />
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-[#16253f] p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-white">
                                                            Show Online Status
                                                        </p>
                                                        <p className="text-sm text-[#7f98be]">
                                                            Show a green dot when you&apos;re active on the
                                                            platform.
                                                        </p>
                                                    </div>
                                                    <Toggle
                                                        checked={onlineStatus}
                                                        onChange={setOnlineStatus}
                                                    />
                                                </div>
                                            </div>
                                            <div className="rounded-xl bg-[#16253f] p-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-white">
                                                            Search Engine Visibility
                                                        </p>
                                                        <p className="text-sm text-[#7f98be]">
                                                            Allow search engines to index your profile page.
                                                        </p>
                                                    </div>
                                                    <Toggle
                                                        checked={searchVisibility}
                                                        onChange={setSearchVisibility}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="mb-4 rounded-2xl border border-[#1a365f] bg-[#1d2a43] p-5">
                                        <h2 className="mb-4 inline-flex items-center gap-2 text-2xl font-semibold text-[#dce8fa]">
                                            <Bell size={18} className="text-[#7f8cff]" />
                                            Notifications
                                        </h2>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <p className="mb-3 text-xs uppercase tracking-wider text-[#7f98be]">
                                                    Email Alerts
                                                </p>
                                                <div className="space-y-2 text-[#cad8ee]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailRequests((v) => !v)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                                                                emailRequests
                                                                    ? "border-[#6366f1] bg-[#6366f1]"
                                                                    : "border-[#4f6382]"
                                                            )}
                                                        >
                                                            {emailRequests ? <Check size={11} /> : null}
                                                        </span>
                                                        New connection requests
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailMessages((v) => !v)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                                                                emailMessages
                                                                    ? "border-[#6366f1] bg-[#6366f1]"
                                                                    : "border-[#4f6382]"
                                                            )}
                                                        >
                                                            {emailMessages ? <Check size={11} /> : null}
                                                        </span>
                                                        Direct message notifications
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmailUpdates((v) => !v)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                                                                emailUpdates
                                                                    ? "border-[#6366f1] bg-[#6366f1]"
                                                                    : "border-[#4f6382]"
                                                            )}
                                                        >
                                                            {emailUpdates ? <Check size={11} /> : null}
                                                        </span>
                                                        Platform updates and news
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="mb-3 text-xs uppercase tracking-wider text-[#7f98be]">
                                                    Push Notifications
                                                </p>
                                                <div className="space-y-2 text-[#cad8ee]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPushDesktop((v) => !v)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                                                                pushDesktop
                                                                    ? "border-[#6366f1] bg-[#6366f1]"
                                                                    : "border-[#4f6382]"
                                                            )}
                                                        >
                                                            {pushDesktop ? <Check size={11} /> : null}
                                                        </span>
                                                        Browser desktop notifications
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPushSound((v) => !v)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span
                                                            className={cn(
                                                                "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                                                                pushSound
                                                                    ? "border-[#6366f1] bg-[#6366f1]"
                                                                    : "border-[#4f6382]"
                                                            )}
                                                        >
                                                            {pushSound ? <Check size={11} /> : null}
                                                        </span>
                                                        Sound alerts for messages
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-[#5a1f37] bg-[#1b1223] p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-2xl font-semibold text-[#ff6b81]">
                                                    Danger Zone
                                                </h3>
                                                <p className="text-sm text-[#d5a5b3]">
                                                    Once you delete your account, there is no going back.
                                                    Please be certain.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="h-10 rounded-lg border-[#3c2b3f] bg-[#22182b] px-5 font-semibold text-[#f4b5c0] hover:bg-[#2a1d31]"
                                                    onClick={() => logoutMutation.mutate()}
                                                    disabled={logoutMutation.isPending}
                                                >
                                                    <LogOut size={14} className="mr-2" />
                                                    {logoutMutation.isPending ? "Logging out..." : "Logout"}
                                                </Button>
                                                <Button
                                                    onClick={() => deleteMutation.mutate()}
                                                    disabled={deleteMutation.isPending}
                                                    className="h-10 rounded-lg bg-[#ef2f3b] px-5 font-semibold hover:bg-[#d82834]"
                                                >
                                                    {deleteMutation.isPending
                                                        ? "Deleting..."
                                                        : "Delete Account"}
                                                </Button>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}

                            <p className="mt-8 text-center text-sm text-[#6e86aa]">
                                © 2024 DevConnect Platform. All rights reserved.
                            </p>
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
