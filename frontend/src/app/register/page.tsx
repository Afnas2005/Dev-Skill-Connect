"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    registerUser,
    googleLogin,
    type ApiError,
    type ApiResponse,
    type AuthResult,
    type RegisterPayload,
} from "@/services/authServices";
import { useAuthStore } from "@/store/authStore";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, Shield, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getPasswordScore = (value: string): number => {
    let score = 0;
    if (value.length >= 6) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
};

const getPasswordLevel = (score: number): string => {
    if (score <= 1) return "Weak";
    if (score === 2) return "Fair";
    if (score === 3) return "Good";
    return "Strong";
};

export default function RegisterPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const passwordScore = getPasswordScore(password);
    const passwordLevel = getPasswordLevel(passwordScore);

    const getErrorMessage = (err: unknown, fallback: string) => {
        const apiErr = err as ApiError;
        return apiErr?.error || apiErr?.message || fallback;
    };

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            setSuccess("Account created successfully! Redirecting...");
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        },
        onError: (err: unknown) => {
            setError(getErrorMessage(err, "Registration failed. Please try again."));
        },
    });

    const googleMutation = useMutation({
        mutationFn: googleLogin,
        onSuccess: (data: ApiResponse<AuthResult>) => {
            queryClient.clear();
            if (data?.data?.user) {
                setUser(data.data.user);
            }
            setSuccess("Account linked successfully! Redirecting...");
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        },
        onError: (err: unknown) => {
            setError(getErrorMessage(err, "Google sign up failed."));
        },
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!acceptedTerms) {
            setError("Please accept Terms of Service and Privacy Policy.");
            return;
        }

        const payload: RegisterPayload = { email, password };
        registerMutation.mutate(payload);
    };

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const isPlaceholderClientId = !googleClientId || googleClientId.includes("REPLACE_WITH_REAL_GOOGLE_WEB_CLIENT_ID");
    const isValidClientId = !isPlaceholderClientId && /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(googleClientId);
    const googleOriginError =
        "Google sign-up is blocked for this origin. Add http://localhost:3000 to Authorized JavaScript origins in Google Cloud Console.";

    const isBusy = registerMutation.isPending || googleMutation.isPending || !!success;

    return (
        <div className="min-h-screen bg-[var(--app-bg)] lg:flex font-sans">
            <aside className="relative hidden min-h-screen w-full overflow-hidden bg-[var(--background)] lg:flex lg:w-[50%] border-r border-[var(--app-line)] isolate">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(6,182,212,0.15),transparent_40%)]" />
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--app-secondary)] opacity-15 blur-[120px]" />
                <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[var(--app-primary)] opacity-15 blur-[100px]" />
                
                <div className="relative flex w-full flex-col justify-between p-14 xl:p-24 z-10">
                    <Link href="/">
                        <div className="flex items-center gap-4 group cursor-pointer w-fit">
                            <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-[var(--app-primary)] text-white font-bold text-xl shadow-glow group-hover:scale-110 transition-transform">DC</div>
                            <p className="text-2xl font-bold tracking-tight text-[var(--app-text)] group-hover:text-gradient-primary">DevSkill Connect</p>
                        </div>
                    </Link>
                    <div className="max-w-xl space-y-8">
                        <h1 className="text-5xl font-extrabold leading-[1.1] xl:text-6xl text-[var(--app-text)]">
                            Begin your <br />
                            <span className="text-gradient-secondary text-glow-secondary">ascension.</span>
                        </h1>
                        <p className="text-xl leading-relaxed text-[var(--app-text-soft)]">
                            Join the elite network of developers building the future. Your journey to mastery starts here.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 opacity-90 text-[var(--app-text-soft)]">
                            <CheckCircle2 className="text-[var(--app-success)]" size={20} />
                            <span className="font-medium text-sm">Build your dynamic portfolio</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-90 text-[var(--app-text-soft)]">
                            <CheckCircle2 className="text-[var(--app-success)]" size={20} />
                            <span className="font-medium text-sm">Connect with industry leaders</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-90 text-[var(--app-text-soft)]">
                            <CheckCircle2 className="text-[var(--app-success)]" size={20} />
                            <span className="font-medium text-sm">Track your technical growth</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex min-h-screen w-full items-center justify-center px-6 py-10 lg:w-[50%] lg:px-12 relative overflow-hidden">
                <div className="absolute lg:hidden top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(139,92,246,0.1),transparent_60%)] pointer-events-none" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md app-card p-8 lg:p-12 relative z-10"
                >
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--app-text)]">Initialize Node</h2>
                        <p className="mt-2 text-sm text-[var(--app-text-soft)]">
                            Create your account to access the network.
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
                                        text="signup_with"
                                        width="100%"
                                    />
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        setError("Google registration is currently disabled. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID first.")
                                    }
                                    className="w-full h-12 text-[var(--app-text)] border-[var(--app-line)] hover:bg-[var(--app-surface-soft)]"
                                >
                                    Sign up with Google
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
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                            {success && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-[var(--app-success)]">
                                    <CheckCircle2 size={18} className="shrink-0" />
                                    <span>{success}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--app-text)]">Full Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="Ghost in the Shell"
                                required
                                disabled={isBusy}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--app-text)]">Email Address</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@domain.com"
                                required
                                disabled={isBusy}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[var(--app-text)]">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="••••••••"
                                    required
                                    disabled={isBusy}
                                    minLength={6}
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 bg-[var(--app-surface-subtle)] p-3 rounded-xl border border-[var(--app-line)]">
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 3, 4].map((level) => (
                                    <span
                                        key={level}
                                        className={`h-1.5 rounded-full transition-colors duration-300 ${
                                            passwordScore >= level 
                                                ? passwordScore < 3 ? "bg-[var(--app-warning)] shadow-[0_0_8px_var(--app-warning)]" : "bg-[var(--app-success)] shadow-[0_0_8px_var(--app-success)]"
                                                : "bg-[var(--app-line-strong)]"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="flex items-center gap-2 text-xs font-semibold text-[var(--app-text-soft)] mt-2">
                                <Shield size={14} className={passwordScore >= 3 ? "text-[var(--app-success)]" : "text-[var(--app-muted)]"} />
                                Security Level: <span className={passwordScore >= 3 ? "text-[var(--app-success)]" : ""}>{passwordLevel}</span>
                            </p>
                        </div>

                        <label className="flex items-start gap-3 text-sm text-[var(--app-text-soft)] cursor-pointer mt-6 group">
                            <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                                    className="peer appearance-none w-5 h-5 border-2 border-[var(--app-line-strong)] rounded bg-transparent checked:bg-[var(--app-primary)] checked:border-[var(--app-primary)] transition-all cursor-pointer"
                                />
                                <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white">
                                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                        <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                            <span className="leading-tight">
                                I agree to the{" "}
                                <Link href="#" className="font-semibold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="font-semibold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

                        <Button
                            type="submit"
                            disabled={isBusy}
                            className="w-full mt-6 h-12 text-base font-bold shadow-glow text-glow-primary"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Spinner size={18} className="mr-3 text-white" />
                                    Creating Node...
                                </>
                            ) : (
                                "Initialize Account"
                            )}
                        </Button>
                    </form>

                    <p className="pt-8 text-center text-sm text-[var(--app-text-soft)]">
                        Already part of the network?{" "}
                        <Link href="/login" className="font-bold text-[var(--app-primary)] hover:text-[var(--app-primary-strong)] hover:underline">
                            Access Portal
                        </Link>
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
