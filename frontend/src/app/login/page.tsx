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
                return "Backend server is not running on http://localhost:5001. Start backend and try again.";
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

    return (
        <div className="min-h-screen bg-zinc-100 lg:flex">
            <aside className="relative hidden min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#2d89ee] to-[#1f7cdc] lg:flex lg:w-3/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.15),transparent_45%),radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.1),transparent_35%)]" />
                <div className="relative flex w-full flex-col justify-between p-14 text-white">
                    <p className="text-4xl font-semibold tracking-tight">DevSkill Connect</p>
                    <div className="max-w-xl space-y-6">
                        <h1 className="text-7xl font-bold leading-[1.05]">
                            The home for
                            <br />
                            world-class
                            <br />
                            developers.
                        </h1>
                        <p className="max-w-lg text-3xl leading-relaxed text-blue-50">
                            Join a community of thousands of full-stack engineers. Showcase your
                            portfolio, find mentors, and land your next big role.
                        </p>
                    </div>
                    <p className="text-lg text-blue-50">Joined by 10k+ developers this month</p>
                </div>
            </aside>

            <main className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f7] px-6 py-8 lg:w-2/5">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="text-5xl font-bold text-[#121a2f]">Welcome back</h2>
                        <p className="mt-2 text-xl text-[#6d7893]">
                            Please enter your details to sign in.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="min-h-11">
                            {isValidClientId ? (
                                <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            googleMutation.mutate(credentialResponse.credential);
                                        }
                                    }}
                                    onError={() => setError("Google authentication failed.")}
                                    theme="outline"
                                    size="large"
                                    shape="rectangular"
                                    width={380}
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setError("Google sign-in is currently unavailable.")
                                    }
                                    className="h-11 w-full rounded-lg border border-zinc-300 bg-white text-base font-medium text-zinc-700"
                                >
                                    Continue with Google
                                </button>
                            )}
                        </div>

                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold tracking-[0.14em] text-[#93a0bc]">
                        <div className="h-px flex-1 bg-zinc-300" />
                        OR CONTINUE WITH EMAIL
                        <div className="h-px flex-1 bg-zinc-300" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error ? (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <label className="text-base font-medium text-[#2f3b59]">
                                Email address
                            </label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                required
                                disabled={loginMutation.isPending}
                                className="h-12 rounded-lg border-zinc-300 bg-white text-base placeholder:text-zinc-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-base font-medium text-[#2f3b59]">
                                    Password
                                </label>
                                <Link href="#" className="text-base font-semibold text-[#2b80e0]">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="........"
                                    required
                                    disabled={loginMutation.isPending}
                                    className="h-12 rounded-lg border-zinc-300 bg-white pr-12 text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((value) => !value)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-base text-[#4f5b79]">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                                className="h-4 w-4 rounded border-zinc-300"
                            />
                            Remember me for 30 days
                        </label>

                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="h-12 w-full rounded-lg bg-[#2b80e0] text-xl font-semibold text-white hover:bg-[#246ec1]"
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Spinner size={18} className="mr-2 text-current" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign in"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-base text-[#66708e]">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-[#2b80e0] hover:underline"
                        >
                            Create an account
                        </Link>
                    </p>

                    <div className="flex justify-center gap-8 text-xs font-semibold tracking-[0.12em] text-[#a0abc6]">
                        <span>PRIVACY POLICY</span>
                        <span>TERMS OF SERVICE</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
