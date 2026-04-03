"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/avatar";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";

export function Topbar() {
    const [open, setOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const pathname = usePathname();

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <>
            <header className="sticky top-0 z-40 px-4 pb-0 pt-4 lg:px-6 xl:px-8">
                <motion.div
                    className="app-topbar mx-auto w-full max-w-7xl rounded-[20px] flex h-[76px] items-center justify-between px-4 md:px-5 border border-[var(--app-line)] shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                >
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-[var(--app-line)] app-glass text-[var(--app-text)] hover:bg-[var(--app-surface-soft)]"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <Menu size={18} />
                    </Button>
                    <div>
                        <h2 className="text-lg font-bold text-[var(--app-text)] text-gradient-primary">Workspace</h2>
                        <p className="text-xs text-[var(--app-muted)] hidden sm:block">Manage profile, skills, and connections</p>
                        <p className="text-xs text-[var(--app-muted)] sm:hidden">Overview</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-[var(--app-line-strong)] app-glass-strong px-2 py-2 shadow-sm transition-all hover:bg-[var(--app-surface-soft)] cursor-pointer">
                    <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                    <div className="hidden pr-3 text-right sm:block">
                        <p className="text-sm font-bold text-[var(--app-text)]">{user?.name || "Developer"}</p>
                        <p className="text-xs text-[var(--app-muted)]">{user?.email}</p>
                    </div>
                </div>
                </motion.div>
            </header>

            <AnimatePresence>
            {open ? (
                <motion.div
                    key="mobile-nav-menu"
                    className="fixed inset-0 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.button
                        type="button"
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                    <motion.div
                        className="relative h-full w-72 app-sidebar border-r border-[var(--app-line)] shadow-[20px_0_40px_rgba(0,0,0,0.5)]"
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Sidebar mobile />
                    </motion.div>
                </motion.div>
            ) : null}
            </AnimatePresence>
        </>
    );
}
