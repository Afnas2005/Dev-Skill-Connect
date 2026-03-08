"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#242f44_0%,#171d2a_52%,#121722_100%)]">
                <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex min-h-screen flex-1 flex-col">
                        <Topbar />
                        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
