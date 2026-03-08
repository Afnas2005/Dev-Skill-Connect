import { create } from "zustand";

type ToastType = "success" | "error" | "info";

export type Toast = {
    id: string;
    title: string;
    description?: string;
    type: ToastType;
};

type ToastState = {
    toasts: Toast[];
    pushToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    pushToast: (toast) =>
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
        })),
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        })),
}));
