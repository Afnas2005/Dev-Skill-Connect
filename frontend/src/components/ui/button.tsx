import * as React from "react"
import MuiButton from "@mui/material/Button"
import { Slot } from "@radix-ui/react-slot"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "border-0 bg-[var(--app-primary)] text-white shadow-[0_0_15px_var(--app-primary-glow)] font-medium hover:bg-[var(--app-primary-strong)]",
    destructive: "bg-[var(--app-danger)] text-white hover:bg-red-600 shadow-[0_10px_25px_rgba(239,68,68,0.2)]",
    outline: "bg-white text-[var(--app-text)] border border-[var(--app-line)] hover:bg-[var(--app-surface-subtle)]",
    secondary: "bg-[var(--app-secondary)] text-slate-950 hover:bg-[var(--app-secondary-strong)] shadow-[0_0_15px_var(--app-secondary-soft)]",
    ghost: "bg-transparent text-[var(--app-text-soft)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]",
    link: "bg-transparent p-0 text-[var(--app-primary)] underline-offset-4 hover:underline",
}

const sizeClassMap: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-11 px-5 py-2.5",
    sm: "h-9 rounded-lg px-4",
    lg: "h-12 rounded-xl px-8 text-base",
    icon: "h-11 w-11 p-0",
}

const MotionMuiButton = motion.create(MuiButton)
const MotionSpan = motion.create("span")

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const classes = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm tracking-wide transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
            variantClassMap[variant],
            sizeClassMap[size],
            className
        )

        if (asChild) {
            const Comp = Slot
            return (
                <MotionSpan whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-flex">
                    
                    <Comp className={classes} ref={ref} {...props} />
                </MotionSpan>
            )
        }

        const muiVariant =
            variant === "outline" ? "outlined" : variant === "ghost" || variant === "link" ? "text" : "contained"
        const muiColor =
            variant === "destructive" ? "error" : variant === "secondary" ? "secondary" : "primary"

        return (
            <MotionMuiButton
                ref={ref}
                variant={muiVariant}
                // @ts-expect-error MUI color prop is narrowed differently than our variant mapping.
                color={muiColor}
                className={classes}
                disableElevation
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
