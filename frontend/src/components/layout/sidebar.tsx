"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { LayoutDashboard, Search, ShieldUser, Sparkles, LogOut, Bell, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { logoutUser } from "@/services/authServices";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: ShieldUser },
    { href: "/skills", label: "Skills", icon: Sparkles },
    { href: "/search", label: "Search", icon: Search },
    { href: "/messager", label: "Messager", icon: MessageSquare },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.logout);
    const { unreadCount } = useUnreadNotificationsCount();

    const handleLogout = async () => {
        await logoutUser();
        queryClient.clear();
        clearAuth();
        router.replace("/login");
    };

    return (
        <motion.aside
            className={cn(
                "app-sidebar w-72 px-5 py-6 text-[var(--app-text)]",
                mobile ? "block h-full" : "hidden lg:block z-10"
            )}
            initial={mobile ? { x: -28, opacity: 0 } : false}
            animate={mobile ? { x: 0, opacity: 1 } : undefined}
            exit={mobile ? { x: -28, opacity: 0 } : undefined}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href="/dashboard" className="mb-10 flex items-center gap-3 px-2 group">
                <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl app-glass-strong text-lg font-bold text-[var(--app-primary)] shadow-glow backdrop-blur-md"
                >
                    DC
                </motion.div>
                <div>
                    <h1 className="text-lg font-bold tracking-[-0.02em] text-gradient-primary">DevSkill Connect</h1>
                    <p className="text-xs text-[var(--app-muted)]">Developer workspace</p>
                </div>
            </Link>

            <nav className="space-y-2 border-0 bg-transparent shadow-none">
                {links.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const isNotifications = item.href === "/notifications";

                    return (
                        <motion.div
                            key={item.href}
                            whileHover={{ x: 6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Link
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[0.95rem] font-medium transition-all duration-300",
                                    active
                                    ? "bg-[var(--app-primary-soft)] text-[var(--app-primary)] border border-[var(--app-primary-glow)] shadow-[0_0_20px_var(--app-primary-soft)]"
                                    : "text-[var(--app-text-soft)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
                                )}
                            >
                                <span
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                                        active ? "bg-[var(--app-primary)] text-white shadow-glow" : "bg-[var(--app-surface-subtle)] text-[var(--app-muted)] group-hover:bg-[var(--app-surface-soft)] group-hover:text-[var(--app-primary)]"
                                    )}
                                >
                                    <Icon size={18} />
                                </span>
                                <span className="flex flex-1 items-center justify-between gap-3">
                                    <span>{item.label}</span>
                                    {isNotifications && unreadCount > 0 ? (
                                        <span
                                            className={cn(
                                                "inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                                                active
                                                    ? "bg-white/20 text-white"
                                                    : "bg-[var(--app-primary)] text-white shadow-glow"
                                            )}
                                        >
                                            {unreadCount > 99 ? "99+" : unreadCount}
                                        </span>
                                    ) : null}
                                </span>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-4 pt-8">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-3 border-[var(--app-line)] bg-transparent text-[var(--app-text-soft)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-danger)]"
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>
        </motion.aside>
    );
}
