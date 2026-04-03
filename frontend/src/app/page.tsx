"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] relative overflow-hidden p-6 font-sans">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--app-primary)] rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[var(--app-secondary)] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-4xl app-card p-12 lg:p-16 relative z-10 border border-[var(--app-line-strong)] text-center"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl app-glass-strong text-2xl font-bold text-[var(--app-primary)] shadow-glow"
                >
                    DC
                </motion.div>
                
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[var(--app-primary)] mb-4">
                    Welcome to the Future
                </p>
                
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[var(--app-text)] leading-[1.1]">
                    Build your <br className="hidden md:block" />
                    <span className="text-gradient-primary text-glow-primary">developer identity.</span>
                </h1>
                
                <p className="mt-8 mx-auto max-w-2xl text-lg text-[var(--app-text-soft)] leading-relaxed">
                    Manage your profile, track skill growth, and connect with top developers 
                    in a beautifully crafted, immersive workspace.
                </p>
                
                <div className="mt-12 flex flex-wrap justify-center gap-6">
                    <Button asChild size="lg" className="h-14 px-8 text-lg rounded-[16px]">
                        <Link href="/login">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-[16px] text-[var(--app-text)] border-[var(--app-line)] hover:border-[var(--app-primary-soft)] hover:bg-[var(--app-primary-soft)] hover:text-[var(--app-primary)]">
                        <Link href="/figma-page">View Design System</Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
