"use client";

import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import { useToastStore } from "@/store/toastStore";

const toneMap = {
    success: {
        severity: "success" as const,
    },
    error: {
        severity: "error" as const,
    },
    info: {
        severity: "info" as const,
    },
} as const;

export function Toaster() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    useEffect(() => {
        if (toasts.length === 0) {
            return;
        }

        const timers = toasts.map((toast) =>
            window.setTimeout(() => removeToast(toast.id), 3500)
        );

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [toasts, removeToast]);

    return (
        <Stack
            spacing={1.2}
            sx={{
                pointerEvents: "none",
                position: "fixed",
                right: 16,
                top: 16,
                zIndex: 1400,
                width: 340,
                maxWidth: "calc(100vw - 2rem)",
            }}
        >
            {toasts.map((toast) => {
                const tone = toneMap[toast.type];

                return (
                    <Slide
                        key={toast.id}
                        in
                        direction="left"
                        mountOnEnter
                        unmountOnExit
                    >
                        <Alert
                            severity={tone.severity}
                            variant="filled"
                            sx={{
                                pointerEvents: "auto",
                                alignItems: "center",
                                boxShadow: "0 8px 30px rgba(15,23,42,0.18)",
                                borderRadius: "12px",
                            }}
                            action={
                                <IconButton
                                    aria-label="Dismiss toast"
                                    color="inherit"
                                    size="small"
                                    onClick={() => removeToast(toast.id)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <div>
                                <strong>{toast.title}</strong>
                                {toast.description ? <div>{toast.description}</div> : null}
                            </div>
                        </Alert>
                    </Slide>
                );
            })}
        </Stack>
    );
}
