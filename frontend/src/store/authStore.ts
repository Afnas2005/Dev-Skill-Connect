import { create } from "zustand";
import type { AuthUser } from "@/types/domain";

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setUser: (user: AuthUser | null) => void;
    setHydrated: (value: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isHydrated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setHydrated: (value) => set({ isHydrated: value }),
    logout: () => set({ user: null, isAuthenticated: false, isHydrated: true }),
}));
