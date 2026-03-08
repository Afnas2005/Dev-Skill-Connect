"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Search, ShieldUser, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/services/authServices";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: ShieldUser },
    { href: "/skills", label: "Skills", icon: Sparkles },
    { href: "/search", label: "Search", icon: Search },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();
    const clearAuth = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        await logoutUser();
        queryClient.clear();
        clearAuth();
        router.replace("/login");
    };

    return (
        <aside
            className={cn(
                "w-64 border-0 bg-[#1b2230] px-4 py-5 shadow-[9px_9px_18px_#121722,-9px_-9px_18px_#2a3448]",
                mobile ? "block h-full" : "hidden lg:block"
            )}
        >
            <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#20293a] text-sm font-bold text-[#d9e4f8] shadow-[6px_6px_12px_#121722,-6px_-6px_12px_#2a3448]">
                    DS
                </div>
                <div>
                    <p className="text-sm font-semibold">DevSkill Connect</p>
                    <p className="text-xs text-slate-300">SaaS Workspace</p>
                </div>
            </Link>

            <nav className="space-y-1">
                {links.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all duration-200",
                                active
                                    ? "bg-[#20293a] text-[#d9e4f8] shadow-[inset_3px_3px_8px_#131a26,inset_-3px_-3px_8px_#2a3448]"
                                    : "text-slate-300 hover:bg-[#20293a] hover:text-slate-100 hover:shadow-[6px_6px_12px_#121722,-6px_-6px_12px_#2a3448]"
                            )}
                        >
                            <Icon size={16} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-6 border-t border-[#2c364a] pt-5">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={handleLogout}
                >
                    <LogOut size={16} />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
