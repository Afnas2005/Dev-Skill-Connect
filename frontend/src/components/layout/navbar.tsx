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
        <header className="sticky top-0 z-50 w-full border-0 bg-[#1b2230]/95 shadow-[9px_9px_18px_#121722,-9px_-9px_18px_#2a3448] backdrop-blur-xl">
            <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#20293a] text-[#e4ebf7] shadow-[6px_6px_12px_#121722,-6px_-6px_12px_#2a3448]">
                        <span className="font-bold text-sm">DC</span>
                    </div>
                    <span className="font-semibold text-lg tracking-tight">DevSkill Connect</span>
                </Link>

                <div className="flex items-center gap-4">
                    {userEmail && (
                        <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
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
