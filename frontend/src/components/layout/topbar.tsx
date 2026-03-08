"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/ui/avatar";
import { Sidebar } from "./sidebar";
import { Button } from "@/components/ui/button";

export function Topbar() {
    const [open, setOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    return (
        <>
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-0 bg-[#1b2230]/95 px-4 shadow-[9px_9px_18px_#121722,-9px_-9px_18px_#2a3448] backdrop-blur lg:px-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <Menu size={16} />
                    </Button>
                    <div>
                        <p className="text-sm font-semibold">Workspace</p>
                        <p className="text-xs text-slate-300">Manage profile and skills</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Avatar name={user?.name || user?.email} src={user?.profileImage} />
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-medium">{user?.name || "Developer"}</p>
                        <p className="text-xs text-slate-300">{user?.email}</p>
                    </div>
                </div>
            </header>

            {open ? (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative h-full w-72 bg-[#1b2230]">
                        <Sidebar mobile />
                    </div>
                </div>
            ) : null}
        </>
    );
}
