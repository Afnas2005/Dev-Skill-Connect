"use client";

import { create } from "zustand";

export type AppTheme = "light" | "dark";

type ThemeState = {
    theme: AppTheme;
    initialized: boolean;
    initializeTheme: () => void;
    setTheme: (theme: AppTheme) => void;
};

const STORAGE_KEY = "devconnect-theme";

const applyTheme = (theme: AppTheme) => {
    if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = theme;
    }

    if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, theme);
    }
};

export const useThemeStore = create<ThemeState>((set) => ({
    theme: "dark",
    initialized: false,
    initializeTheme: () => {
        if (typeof window === "undefined") {
            set({ initialized: true });
            return;
        }

        const storedTheme = window.localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
        const theme: AppTheme =
            storedTheme === "light"
                ? "light"
                : storedTheme === "dark" || storedTheme === "classic" || prefersDark
                ? "dark"
                : "light";

        applyTheme(theme);
        set({ theme, initialized: true });
    },
    setTheme: (theme) => {
        applyTheme(theme);
        set({ theme, initialized: true });
    },
}));
