"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Code2, Cookie, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch (err: any) {
        console.error("Failed to fetch user:", err);
        setError("Session expired. Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="h-16 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"></header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-zinc-500">
            <Spinner size={32} />
            <p className="text-sm font-medium animate-pulse">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <Spinner className="text-red-500" />
            <p className="font-medium text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar userEmail={user?.email} />

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome to your developer workspace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="md:col-span-2 lg:col-span-1 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg dark:bg-indigo-900/40 dark:text-indigo-400">
                  <ShieldCheck size={20} />
                </div>
                <CardTitle className="text-lg">Account Profile</CardTitle>
              </div>
              <CardDescription>Your personal credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-zinc-100 p-3 dark:bg-zinc-900/50">
                  <p className="text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Email Address</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                  <Cookie size={18} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Secure Session Active</p>
                    <p className="opacity-90 mt-0.5 text-xs">Auth token is stored securely in an HTTP-only cookie.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Cards for a "SaaS" look */}
          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg dark:bg-blue-900/40 dark:text-blue-400">
                  <Code2 size={20} />
                </div>
                <CardTitle className="text-lg">Projects</CardTitle>
              </div>
              <CardDescription>Manage your codebases</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center text-zinc-500">
              <div className="h-12 w-12 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center mb-3 dark:border-zinc-800">
                <Code2 size={24} className="text-zinc-300 dark:text-zinc-700" />
              </div>
              <p className="text-sm">No projects found.</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg dark:bg-purple-900/40 dark:text-purple-400">
                  <LayoutDashboard size={20} />
                </div>
                <CardTitle className="text-lg">Activity</CardTitle>
              </div>
              <CardDescription>Recent actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 text-center text-zinc-500">
              <p className="text-sm">Your activity feed will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
