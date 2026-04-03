import { createTheme } from "@mui/material/styles";
import type { AppTheme } from "@/store/themeStore";

export const createAppMuiTheme = (themeMode: AppTheme) => {
    const isDark = themeMode === "dark";

    return createTheme({
        palette: {
            mode: isDark ? "dark" : "light",
            primary: {
                main: isDark ? "#818CF8" : "#2563EB",
            },
            secondary: {
                main: isDark ? "#2DD4BF" : "#3B82F6",
            },
            background: {
                default: isDark ? "#020617" : "#F8FAFC",
                paper: isDark ? "rgba(30, 41, 59, 0.4)" : "#FFFFFF",
            },
            text: {
                primary: isDark ? "#F8FAFC" : "#1E293B",
                secondary: isDark ? "#94A3B8" : "#64748B",
            },
            success: {
                main: "#22C55E",
            },
            error: {
                main: "#EF4444",
            },
        },
        shape: {
            borderRadius: isDark ? 18 : 16,
        },
        typography: {
            fontFamily: "var(--font-dm-sans), 'DM Sans', 'Segoe UI', sans-serif",
            h1: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontSize: "2rem",
                fontWeight: 600,
            },
            h2: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontSize: "1.5rem",
                fontWeight: 600,
            },
            h3: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontWeight: 600,
            },
            h4: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontWeight: 600,
            },
            h5: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontWeight: 600,
            },
            h6: {
                fontFamily: "var(--font-sora), 'Sora', 'Segoe UI', sans-serif",
                color: isDark ? "#F8FAFC" : "#1E293B",
                fontWeight: 600,
            },
            body1: {
                fontSize: "1rem",
                color: isDark ? "#94A3B8" : "#64748B",
            },
            body2: {
                fontSize: "0.875rem",
                color: isDark ? "#94A3B8" : "#64748B",
            },
            button: {
                textTransform: "none",
                fontWeight: 500,
            },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
                        borderRadius: isDark ? 18 : 16,
                        background: isDark ? "rgba(30, 41, 59, 0.4)" : "#FFFFFF",
                        boxShadow: isDark
                            ? "0 10px 30px rgba(2, 6, 23, 0.34)"
                            : "0 10px 25px rgba(0, 0, 0, 0.05)",
                        backdropFilter: isDark ? "blur(12px)" : "none",
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: {
                        border: "none",
                        borderRadius: 10,
                        background: isDark ? "#818CF8" : "#2563EB",
                        color: isDark ? "#020617" : "#FFFFFF",
                        boxShadow: isDark
                            ? "0 0 15px rgba(129, 140, 248, 0.4)"
                            : "0 10px 25px rgba(37, 99, 235, 0.22)",
                        transition:
                            "transform 220ms ease, box-shadow 220ms ease, background-color 220ms ease",
                    },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        background: isDark ? "rgba(30, 41, 59, 0.4)" : "#FFFFFF",
                        border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #E2E8F0",
                        boxShadow: isDark
                            ? "none"
                            : "none",
                        backdropFilter: isDark ? "blur(12px)" : "none",
                        "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                        },
                    },
                },
            },
        },
    });
};
