"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

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
        <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
            <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 text-zinc-50 flex items-center justify-center dark:bg-zinc-50 dark:text-zinc-900">
                        <span className="font-bold text-sm">DC</span>
                    </div>
                    <span className="font-semibold text-lg tracking-tight">DevSkill Connect</span>
                </Link>

                <div className="flex items-center gap-4">
                    {userEmail && (
                        <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <User size={16} />
                            <span>{userEmail}</span>
                        </div>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
