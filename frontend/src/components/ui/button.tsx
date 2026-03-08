import * as React from "react"
import MuiButton from "@mui/material/Button"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "neu-soft text-slate-100 hover:bg-[#253146]",
    destructive: "neu-soft text-rose-300 hover:bg-[#33242d]",
    outline: "neu-soft text-slate-200 hover:bg-[#253146]",
    secondary: "neu-soft text-slate-200 hover:bg-[#253146]",
    ghost: "bg-transparent text-slate-200 hover:bg-[#20293a] hover:text-slate-100",
    link: "bg-transparent p-0 text-slate-200 underline-offset-4 hover:underline",
}

const sizeClassMap: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10 p-0",
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const classes = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
            variantClassMap[variant],
            sizeClassMap[size],
            className
        )

        if (asChild) {
            const Comp = Slot
            return <Comp className={classes} ref={ref} {...props} />
        }

        const muiVariant =
            variant === "outline" ? "outlined" : variant === "ghost" || variant === "link" ? "text" : "contained"
        const muiColor =
            variant === "destructive" ? "error" : variant === "secondary" ? "secondary" : "primary"

        return (
            <MuiButton
                ref={ref}
                variant={muiVariant}
                color={muiColor}
                className={classes}
                disableElevation
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
