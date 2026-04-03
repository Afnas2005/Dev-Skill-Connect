import * as React from "react"
import OutlinedInput from "@mui/material/OutlinedInput"
import { cn } from "@/lib/utils"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <OutlinedInput
                type={type}
                inputRef={ref}
                size="small"
                fullWidth
                className={cn(
                    "h-11 rounded-[12px] border border-[var(--app-line)] bg-[var(--app-surface-soft)] text-[var(--app-text)] shadow-sm backdrop-blur-[12px] transition-all duration-300",
                    className
                )}
                sx={{
                    "& fieldset": {
                        border: "0 !important",
                    },
                    "&.Mui-focused": {
                        boxShadow: "0 0 0 3px var(--app-primary-soft), 0 0 0 1px var(--app-primary) !important",
                        backgroundColor: "var(--app-surface) !important",
                    },
                    "& .MuiOutlinedInput-input": {
                        py: "11px",
                        color: "var(--app-text) !important",
                    },
                    "& .MuiOutlinedInput-input::placeholder": {
                        color: "var(--app-muted) !important",
                        opacity: 1,
                    }
                }}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
