"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/authServices";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const setUser = useAuthStore((state) => state.setUser);
    const setHydrated = useAuthStore((state) => state.setHydrated);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: getMe,
        retry: false,
        staleTime: 0,
        refetchOnMount: "always",
    });

    useEffect(() => {
        if (data?.data?.user) {
            setUser(data.data.user);
            setHydrated(true);
        }
    }, [data, setHydrated, setUser]);

    useEffect(() => {
        if (isError) {
            setUser(null);
            setHydrated(true);
            router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        }
    }, [isError, pathname, router, setHydrated, setUser]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-2 text-zinc-600">
                    <Spinner size={20} />
                    <span className="text-sm font-medium">Checking session...</span>
                </div>
            </div>
        );
    }

    if (isError) {
        return null;
    }

    return <>{children}</>;
}
