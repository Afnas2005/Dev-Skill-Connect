"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import {
    loginUser,
    googleLogin,
    type ApiError,
    type ApiResponse,
    type AuthResult,
    type LoginPayload,
} from "@/services/authServices";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/services/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const router = useRouter();
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);
    const getErrorMessage = (err: unknown, fallback: string) => {
        if (typeof err === "string") {
            const lower = err.toLowerCase();
            if (lower.includes("network") || lower.includes("connection refused")) {
                return `Backend server is not reachable at ${API_BASE_URL}. Start backend and try again.`;
            }
            return err;
        }
        const apiErr = err as ApiError;
        return apiErr?.error || apiErr?.message || fallback;
    };

    const navigatePostLogin = () => {
        router.push("/dashboard");
    };

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data: ApiResponse<AuthResult>) => {
            queryClient.clear();
            if (data?.data?.user) {
                setUser(data.data.user);
            }
            navigatePostLogin();
        },
        onError: (err: unknown) =>
            setError(getErrorMessage(err, "Login failed. Please check your credentials.")),
    });

    const googleMutation = useMutation({
        mutationFn: googleLogin,
        onSuccess: (data: ApiResponse<AuthResult>) => {
            queryClient.clear();
            if (data?.data?.user) {
                setUser(data.data.user);
            }
            navigatePostLogin();
        },
        onError: (err: unknown) => setError(getErrorMessage(err, "Google login failed.")),
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError("");
        const payload: LoginPayload = { email, password };
        loginMutation.mutate(payload);
    };

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const isValidClientId = Boolean(
        googleClientId &&
            !googleClientId.includes("REPLACE_WITH_REAL_GOOGLE_WEB_CLIENT_ID") &&
            /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(googleClientId)
    );
    const googleOriginError =
        "Google sign-in is blocked for this origin. Add http://localhost:3000 to Authorized JavaScript origins in Google Cloud Console.";

    return (
        <div className="min-h-screen bg-[var(--app-bg)] lg:flex font-sans">
            <aside className="relative hidden min-h-screen w-full overflow-hidden bg-[var(--background)] lg:flex lg:w-[50%] border-r border-[var(--app-line)] isolate">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(6,182,212,0.15),transparent_40%),radial-gradient(circle_at_18%_78%,rgba(139,92,246,0.15),transparent_40%)]" />
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--app-primary)] opacity-20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--app-secondary)] opacity-20 blur-[100px]" />
                
                <div className="relative flex w-full flex-col justify-between p-14 xl:p-24 z-10">
                    <Link href="/">
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-[var(--app-primary)] text-white font-bold text-xl shadow-glow group-hover:scale-110 transition-transform">DC</div>
                            <p className="text-2xl font-bold tracking-tight text-[var(--app-text)] group-hover:text-gradient-primary">DevSkill Connect</p>
                        </div>
                    </Link>
                    <div className="max-w-2xl space-y-8">
                        <h1 className="text-5xl font-extrabold leading-[1.1] xl:text-6xl text-[var(--app-text)]">
                            Enter the <br />
                            <span className="text-gradient-primary text-glow-primary">developer</span> <br />
                            multiverse.
                        </h1>
                        <p className="max-w-xl text-xl leading-relaxed text-[var(--app-text-soft)]">
                            Sign in to access your workspace, manage your cutting-edge portfolio, 
                            and connect with elite engineers.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 opacity-80">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-[var(--app-bg)] bg-[var(--app-primary-soft)] backdrop-blur-md" />
                            <div className="w-10 h-10 rounded-full border-2 border-[var(--app-bg)] bg-[var(--app-secondary-soft)] backdrop-blur-md" />
                            <div className="w-10 h-10 rounded-full border-2 border-[var(--app-bg)] app-glass-strong flex justify-center items-center text-xs font-bold">+10k</div>
                        </div>
                        <p className="text-sm font-medium text-[var(--app-text-soft)]">Engineers joined recently</p>
                    </div>
                </div>
            </aside>

            <main className="flex min-h-screen w-full items-center justify-center px-6 py-8 lg:w-[50%] lg:px-10 relative overflow-hidden">
                {/* Mobile only backgrounds */}
                <div className="absolute lg:hidden top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_50%)] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md app-card p-8 lg:p-12 relative z-10"
                >
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--app-text)]">Welcome back</h2>
                        <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                            Sign in to continue your journey.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="min-h-11 flex justify-center">
                            {isValidClientId ? (
                                <div className="w-full overflow-hidden rounded-[12px]">
                                    <GoogleLogin
                                        onSuccess={(credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                googleMutation.mutate(credentialResponse.credential);
                                            }
                                        }}
                                        onError={() => setError(googleOriginError)}
                                        theme="filled_black"
                                        size="large"
                                        shape="rectangular"
                                        width="100%"
                                    />
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setError("Google sign-in is currently unavailable. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID first.")
                                    }
                                    className="w-full h-12 text-[var(--app-text)] border-[var(--app-line)] hover:bg-[var(--app-surface-soft)]"
                                >
                                    Continue with Google
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="my-8 flex items-center gap-4 text-xs font-bold tracking-[0.2em] text-[var(--app-muted)]">
                        <div className="h-px flex-1 bg-[var(--app-line)]" />
                        OR EMAIL
                        <div className="h-px flex-1 bg-[var(--app-line)]" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error ? (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        ) : null}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--app-text)]">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loginMutation.isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-[var(--app-text)]">
                                    Password
                                </label>
                                <Link href="#" className="text-sm font-semibold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={loginMutation.isPending}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 text-sm text-[var(--app-text-soft)] cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-[var(--app-line-strong)] rounded bg-transparent checked:bg-[var(--app-primary)] checked:border-[var(--app-primary)] transition-all cursor-pointer"
                                />
                                <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white">
                                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <span className="group-hover:text-[var(--app-text)] transition-colors">Remember me for 30 days</span>
                        </label>

                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full mt-4 h-12 text-base font-bold shadow-glow text-glow-primary"
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Spinner size={18} className="mr-3 text-white" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[var(--app-text-soft)]">
                        New around here?{" "}
                        <Link
                            href="/register"
                            className="font-bold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
