"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material";
import { Toaster } from "@/components/ui/toaster";
import { useThemeStore } from "@/store/themeStore";
import { createAppMuiTheme } from "@/theme/muiTheme";

export default function Providers({ children }: { children: React.ReactNode }) {
    const theme = useThemeStore((state) => state.theme);
    const initializeTheme = useThemeStore((state) => state.initializeTheme);
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: true,
                        staleTime: 5 * 60 * 1000,
                        retry: 1,
                    },
                },
            })
    );

    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    const muiTheme = useMemo(() => createAppMuiTheme(theme), [theme]);

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
    const isPlaceholderClientId =
        !googleClientId ||
        googleClientId.includes("REPLACE_WITH_REAL_GOOGLE_WEB_CLIENT_ID") ||
        googleClientId.includes("your_google_client_id_here");
    const isValidClientId =
        !isPlaceholderClientId &&
        /^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(googleClientId);

    const content = (
        <ThemeProvider theme={muiTheme}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    );

    return isValidClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
            {content}
        </GoogleOAuthProvider>
    ) : (
        content
    );
}
