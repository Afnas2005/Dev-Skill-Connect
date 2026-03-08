import { createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#7ea2d9",
        },
        secondary: {
            main: "#9aaac2",
        },
        background: {
            default: "#171d2a",
            paper: "#1b2230",
        },
        text: {
            primary: "#e4ebf7",
            secondary: "#a7b4ca",
        },
    },
    shape: {
        borderRadius: 18,
    },
    typography: {
        fontFamily: "var(--font-geist-sans), Segoe UI, sans-serif",
        button: {
            textTransform: "none",
            fontWeight: 600,
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: "#121722",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: "none",
                    borderRadius: 18,
                    background: "#1b2230",
                    boxShadow: "0 12px 24px rgba(5, 8, 14, 0.55)",
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
                    borderRadius: 14,
                    background: "#20293a",
                    color: "#e4ebf7",
                    boxShadow: "0 8px 16px rgba(6, 10, 18, 0.45)",
                    transition: "transform 220ms ease, box-shadow 220ms ease, background-color 220ms ease",
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    border: "none",
                    borderRadius: 14,
                    background: "#1b2230",
                    boxShadow: "inset 0 2px 8px rgba(7, 10, 16, 0.65)",
                    "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                    },
                },
            },
        },
    },
});
