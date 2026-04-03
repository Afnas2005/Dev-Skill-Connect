"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <div className="app-shell">
                <div className="flex min-h-screen">
                    <div className="flex min-h-screen flex-1 flex-col">
                        <Topbar />
                        <main className="flex-1 px-4 py-6 lg:px-8 xl:px-10">{children}</main>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
