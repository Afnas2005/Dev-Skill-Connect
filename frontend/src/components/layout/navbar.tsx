"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface NavbarProps {
    userEmail?: string;
}

export function Navbar({ userEmail }: NavbarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/login");
        } catch (err) {
            console.error("Logout error:", err);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--app-line)] app-topbar shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="container mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-primary)] text-white shadow-glow"
                    >
                        <span className="font-bold text-sm">DC</span>
                    </motion.div>
                    <span className="font-bold text-xl tracking-tight text-[var(--app-text)] group-hover:text-gradient-primary transition-all">DevSkill Connect</span>
                </Link>

                <div className="flex items-center gap-5">
                    {userEmail && (
                        <div className="hidden items-center gap-2 text-sm text-[var(--app-muted)] sm:flex font-medium">
                            <div className="h-8 w-8 rounded-full app-glass flex items-center justify-center text-[var(--app-primary)]">
                                <User size={16} />
                            </div>
                            <span>{userEmail}</span>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-[var(--app-muted)] hover:text-[var(--app-danger)] hover:bg-[rgba(239,68,68,0.1)] rounded-full px-4"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline font-bold">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
