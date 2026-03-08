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
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";

const getPasswordScore = (value: string): number => {
    let score = 0;
    if (value.length >= 6) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
};

const getPasswordLevel = (score: number): string => {
    if (score <= 1) return "Low";
    if (score === 2) return "Medium";
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
    const isPlaceholderClientId =
        !googleClientId ||
        googleClientId.includes("REPLACE_WITH_REAL_GOOGLE_WEB_CLIENT_ID") ||
        googleClientId.includes("your_google_client_id_here");
    const isValidClientId =
        !isPlaceholderClientId &&
        /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(googleClientId);

    const isBusy = registerMutation.isPending || googleMutation.isPending || !!success;

    return (
        <div className="min-h-screen bg-[#060d24] lg:flex">
            <aside className="relative hidden min-h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#163b6f_0%,#071639_70%,#020814_100%)] lg:flex lg:w-1/2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_38%),radial-gradient(circle_at_80%_55%,rgba(33,122,255,0.22),transparent_42%)]" />
                <div className="relative flex w-full flex-col justify-between p-12 text-white">
                    <p className="text-4xl font-semibold tracking-tight">DevSkill Connect</p>
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-7xl font-bold leading-[1.1]">
                            Build your
                            <br />
                            professional edge.
                        </h1>
                        <p className="text-3xl leading-relaxed text-blue-100">
                            Join the elite community of full-stack developers. Showcase your projects,
                            get endorsed, and land your next dream role.
                        </p>
                    </div>
                    <p className="text-lg text-blue-100">Join 10k+ developers today</p>
                </div>
            </aside>

            <main className="flex min-h-screen w-full items-center justify-center bg-[#0a1535] px-6 py-8 lg:w-1/2">
                <div className="w-full max-w-md space-y-7">
                    <div>
                        <h2 className="text-5xl font-bold text-white">Create your account</h2>
                        <p className="mt-2 text-xl text-[#93a4c9]">
                            Start your journey with the world&apos;s best dev community.
                        </p>
                    </div>

                    <div className="min-h-11">
                        {isValidClientId ? (
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    if (credentialResponse.credential) {
                                        googleMutation.mutate(credentialResponse.credential);
                                    }
                                }}
                                onError={() =>
                                    setError(
                                        "Google authentication failed. Check Google Cloud settings."
                                    )
                                }
                                theme="outline"
                                size="large"
                                shape="rectangular"
                                text="signup_with"
                                width={380}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    setError(
                                        "Google registration is currently disabled. Please configure your Google Client ID."
                                    )
                                }
                                className="h-12 w-full rounded-xl border border-[#334873] bg-[#182846] text-base font-medium text-[#d8e2f8]"
                            >
                                Sign up with Google
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.14em] text-[#7f91ba]">
                        <div className="h-px flex-1 bg-[#26365d]" />
                        OR WITH EMAIL
                        <div className="h-px flex-1 bg-[#26365d]" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error ? (
                            <div className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm font-medium text-red-200">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        {success ? (
                            <div className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-200">
                                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                                <span>{success}</span>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <label className="text-base font-medium text-[#d6e0f8]">Full Name</label>
                            <Input
                                type="text"
                                value={fullName}
                                onChange={(event) => setFullName(event.target.value)}
                                placeholder="John Doe"
                                required
                                disabled={isBusy}
                                className="h-12 rounded-xl border-[#31466f] bg-[#1b2c4c] text-base text-white placeholder:text-[#7387b3]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-medium text-[#d6e0f8]">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="john@example.com"
                                required
                                disabled={isBusy}
                                className="h-12 rounded-xl border-[#31466f] bg-[#1b2c4c] text-base text-white placeholder:text-[#7387b3]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-base font-medium text-[#d6e0f8]">Password</label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="........"
                                required
                                disabled={isBusy}
                                className="h-12 rounded-xl border-[#31466f] bg-[#1b2c4c] text-base text-white placeholder:text-[#7387b3]"
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-2">
                                <span
                                    className={`h-1.5 rounded-full ${
                                        passwordScore >= 1 ? "bg-[#2389ff]" : "bg-[#32466f]"
                                    }`}
                                />
                                <span
                                    className={`h-1.5 rounded-full ${
                                        passwordScore >= 2 ? "bg-[#2389ff]" : "bg-[#32466f]"
                                    }`}
                                />
                                <span
                                    className={`h-1.5 rounded-full ${
                                        passwordScore >= 3 ? "bg-[#2389ff]" : "bg-[#32466f]"
                                    }`}
                                />
                                <span
                                    className={`h-1.5 rounded-full ${
                                        passwordScore >= 4 ? "bg-[#2389ff]" : "bg-[#32466f]"
                                    }`}
                                />
                            </div>
                            <p className="flex items-center gap-2 text-sm text-[#8ea2cc]">
                                <Shield size={14} />
                                Security level: {passwordLevel}
                            </p>
                        </div>

                        <label className="flex items-start gap-3 text-sm text-[#9eb0d8]">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(event) => setAcceptedTerms(event.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-[#38517d] bg-[#1b2c4c]"
                            />
                            <span>
                                I agree to the{" "}
                                <Link href="#" className="text-[#3c97ff] hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="#" className="text-[#3c97ff] hover:underline">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

                        <Button
                            type="submit"
                            disabled={isBusy}
                            className="h-12 w-full rounded-xl bg-[#2389ff] text-xl font-semibold text-white hover:bg-[#1a73dc]"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Spinner size={18} className="mr-2 text-current" />
                                    Creating account...
                                </>
                            ) : (
                                "Create My Account"
                            )}
                        </Button>
                    </form>

                    <p className="pt-2 text-center text-base text-[#8ea1c9]">
                        Already part of the community?{" "}
                        <Link href="/login" className="font-semibold text-[#2792ff] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
