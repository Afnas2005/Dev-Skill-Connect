"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6">
            <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                    DevSkill Connect
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900">
                    Build your developer identity and showcase skills.
                </h1>
                <p className="mt-4 max-w-2xl text-zinc-600">
                    Manage your profile, track skill growth, and search developers by expertise
                    in a clean SaaS workspace.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild variant="secondary">
                        <Link href="/figma-page">Open new page</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/login">Sign in</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/register">Create account</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
